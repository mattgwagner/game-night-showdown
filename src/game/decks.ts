/* ============================================================
   DECK DRAWING
   Every live-action deck is filtered by the current spice level
   and drawn without repeats until the deck is exhausted, so you
   don't get the same dare twice in one weekend.
============================================================ */
import { BONUS_QUESTIONS, CHALLENGES, DUELS, FINAL_SHOWDOWN, FORFEITS, LIST_PROMPTS } from '../content';
import type { GameState, Team } from './state';

// A card's identity is its text, not its position, so adding a card anywhere in a
// deck doesn't make the weekend's "already drawn" list point at the wrong cards.
export const DECKS = {
  bonus: { pool: BONUS_QUESTIONS, key: (x: (typeof BONUS_QUESTIONS)[number]) => x.q },
  challenge: { pool: CHALLENGES, key: (x: (typeof CHALLENGES)[number]) => x.t },
  duel: { pool: DUELS, key: (x: (typeof DUELS)[number]) => x.t },
  final: { pool: FINAL_SHOWDOWN, key: (x: (typeof FINAL_SHOWDOWN)[number]) => x.q },
  forfeit: { pool: FORFEITS, key: (x: (typeof FORFEITS)[number]) => x.d },
  lists: { pool: LIST_PROMPTS, key: (x: string) => x },
};
export type DeckName = keyof typeof DECKS;
type Card<D extends DeckName> = (typeof DECKS)[D]['pool'][number];

interface Gated { spice?: 'party'; drinks?: true }

// Two independent gates. Spice is about how revealing the content is; drinks is
// about whether the room is drinking at all. A room with somebody sober, pregnant
// or driving should still get the full After Dark deck.
export function spiceOk(s: Pick<GameState, 'spice' | 'drinks'>, item: unknown): boolean {
  const g = (item && typeof item === 'object' ? item : {}) as Gated;
  if (g.spice === 'party' && s.spice !== 'party') return false;
  if (g.drinks && !s.drinks) return false;
  return true;
}

/** Draws a card and records it in `s.drawn`. Call on an immer draft. */
export function drawFrom<D extends DeckName>(s: GameState, deck: D, filter?: (c: Card<D>) => boolean): Card<D> {
  const { pool, key } = DECKS[deck] as unknown as { pool: Card<D>[]; key: (c: Card<D>) => string };
  const used = s.drawn[deck] || (s.drawn[deck] = []);
  let candidates = pool.filter(c => spiceOk(s, c) && (!filter || filter(c)));
  // Spice filter emptied the deck: fall back to the unfiltered pool.
  if (candidates.length === 0) candidates = pool.filter(c => !filter || filter(c));
  let fresh = candidates.filter(c => !used.includes(key(c)));
  if (fresh.length === 0) {
    // This subset is spent. Recycle ONLY its own cards; wiping the whole
    // deck here would let every other type start repeating too.
    const mine = new Set(candidates.map(key));
    s.drawn[deck] = used.filter(k => !mine.has(k));
    fresh = candidates;
  }
  const pick = fresh[Math.floor(Math.random() * fresh.length)];
  s.drawn[deck].push(key(pick));
  return pick;
}

/** Saves from before cards were keyed by text stored array positions. */
export function migrateDrawn(drawn: Record<string, unknown[]> | undefined): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [name, entries] of Object.entries(drawn || {})) {
    const deck = DECKS[name as DeckName] as { pool: unknown[]; key: (c: unknown) => string } | undefined;
    if (!deck || !Array.isArray(entries)) continue;
    out[name] = entries
      .map(e => (typeof e === 'number' ? (deck.pool[e] !== undefined ? deck.key(deck.pool[e]) : null) : e))
      .filter((e): e is string => typeof e === 'string');
  }
  return out;
}

// ============================================================
// WILDCARD EVENTS
// A few unmarked squares per board hijack the game. Only two
// flavors survive: a live challenge, or points walking out the
// door. `weight` biases the draw toward the live-action ones.
// ============================================================
export interface WildcardEvent {
  key: string;
  label: string;
  weight: number;
  kind: 'challenge' | 'duel' | 'instant';
  blurb?: string;
  describe?: (v: number, s: GameState, team: Team) => string;
  /** Mutates the draft */
  apply?: (s: GameState, team: Team, v: number) => void;
}

export function getLeader(s: GameState, exclude: Team): Team | null {
  const others = s.teams.filter(t => t.id !== exclude.id);
  if (others.length === 0) return null;
  return others.reduce((a, b) => (b.score > a.score ? b : a));
}

export const WILDCARD_EVENTS: WildcardEvent[] = [
  {
    key: 'challenge', label: '🔥 Challenge Accepted', weight: 5, kind: 'challenge',
    blurb: 'Put the phone down. Beat it and the points are yours.',
  },
  {
    key: 'duel', label: '⚔️ Duel', weight: 3, kind: 'duel',
    blurb: 'Pick an opponent. Only one of you walks away with points.',
  },
  {
    key: 'tab', label: '🍻 Bar Tab', weight: 2, kind: 'instant',
    describe: (v) => `Somebody's buying a round, and it's you. Down ${v}.`,
    apply: (_s, team, v) => { team.score -= v; },
  },
  {
    key: 'robinhood', label: '🏹 Robin Hood', weight: 2, kind: 'instant',
    describe: (v, s, team) => {
      const leader = getLeader(s, team);
      if (!leader) return `Nobody worth robbing. Take a flat +${v} and move along.`;
      return `Take ${v} points straight off the leader, ${leader.name}. No appeal.`;
    },
    apply: (s, team, v) => {
      const leader = getLeader(s, team);
      if (leader) { leader.score -= v; team.score += v; }
      else { team.score += v; }
    },
  },
  {
    key: 'tax', label: '💸 Everybody Pays', weight: 2, kind: 'instant',
    describe: (v) => `You're exempt. Every OTHER team loses ${Math.round(v / 2)}.`,
    apply: (s, team, v) => {
      const cut = Math.round(v / 2);
      s.teams.forEach(t => { if (t.id !== team.id) t.score -= cut; });
    },
  },
];

// Weighted draw so the live-action events dominate the deck.
export function drawWildcardEvent(s: GameState): WildcardEvent {
  const pool: WildcardEvent[] = [];
  WILDCARD_EVENTS.filter(e => spiceOk(s, e)).forEach(e => {
    for (let i = 0; i < (e.weight || 1); i++) pool.push(e);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}
