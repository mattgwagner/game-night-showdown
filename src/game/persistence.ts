/* ============================================================
   SAVE / RESUME
   Someone always closes the tab. This is a three-day weekend.
   Storage can fail (private browsing, quota); never break the game over it.
============================================================ */
import { ROUNDS } from '../content';
import { migrateDrawn } from './decks';
import { currentRound, drawWildcards } from './rules';
import { freshState, TEAM_COLORS, type GameState } from './state';

const SAVE_KEY = 'gns.save.v2';
const LEGACY_SAVE_KEY = 'gns.save.v1';
const WEEKEND_KEY = 'gns.weekend.v1';

const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
const remove = (k: string) => { try { localStorage.removeItem(k); } catch { /* ignore */ } };

export function saveGame(s: GameState) {
  write(SAVE_KEY, JSON.stringify(s));
}

/** A saved game worth offering on the setup screen, or null. */
export function loadSavedGame(): GameState | null {
  try {
    const raw = read(SAVE_KEY);
    const s = raw ? upgrade(JSON.parse(raw)) : loadLegacy();
    if (!s || s.teams.length === 0 || s.screen === 'setup') return null;
    return s;
  } catch {
    return null;
  }
}

export function clearSavedGame() {
  remove(SAVE_KEY);
  remove(LEGACY_SAVE_KEY);
}

/**
 * Every saved game passes through here, so a field added to GameState gets its
 * default from freshState() instead of crashing a game saved before the deploy.
 */
function upgrade(saved: Partial<GameState>, drawWild = false): GameState | null {
  if (!saved || !Array.isArray(saved.teams)) return null;
  const s: GameState = { ...freshState(), ...saved };
  s.teams = s.teams.map((t, i) => ({ ...t, color: t.color || TEAM_COLORS[i % TEAM_COLORS.length] }));
  s.drawn = migrateDrawn(s.drawn);
  if (s.roundId && !ROUNDS.some(r => r.id === s.roundId)) {
    // The round was deleted since this game was saved.
    s.roundId = null;
    if (s.screen === 'board' || s.screen === 'winner') s.screen = 'roundselect';
  }
  if (s.roundOrder && !s.roundOrder.every(id => typeof id === 'string')) s.roundOrder = null;
  // Saves from before wildcards were drawn at random: draw this board's now.
  if (drawWild && s.activeCategories && currentRound(s)?.kind === 'trivia') drawWildcards(s, s.activeCategories);
  return s;
}

// The single-file version saved { state, nextTeamId } with rounds by array position.
function loadLegacy(): GameState | null {
  const raw = read(LEGACY_SAVE_KEY);
  if (!raw) return null;
  const data = JSON.parse(raw);
  const old = data && data.state;
  if (!old || !Array.isArray(old.teams)) return null;
  const round = ROUNDS[old.roundIndex];
  return upgrade({
    ...old,
    roundId: round ? round.id : null,
    roundOrder: null,
    nextTeamId: data.nextTeamId || Math.max(0, ...old.teams.map((t: { id: number }) => t.id)) + 1,
  }, !old.wild);
}

/* ---------- The weekend board: scores banked across games ---------- */
export interface Weekend {
  games: { round: string; when: string; results: { name: string; score: number }[] }[];
  totals: Record<string, { points: number; wins: number; games: number }>;
  /** Dares, bonus questions and forfeits ride with the weekend, not the game,
      so Friday's wall-sit does not come back on Saturday. */
  drawn: Record<string, string[]>;
}

export function loadWeekend(): Weekend {
  try {
    const raw = read(WEEKEND_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (!data || !Array.isArray(data.games)) return { games: [], totals: {}, drawn: {} };
    return { games: data.games, totals: data.totals || {}, drawn: migrateDrawn(data.drawn) };
  } catch {
    return { games: [], totals: {}, drawn: {} };
  }
}

export function saveWeekend(w: Weekend) {
  write(WEEKEND_KEY, JSON.stringify(w));
}

export function persistDrawn(drawn: Record<string, string[]>) {
  const w = loadWeekend();
  w.drawn = drawn;
  saveWeekend(w);
}

// Fold a finished game's scores into the running weekend totals.
export function bankGameToWeekend(s: GameState, roundName: string) {
  const w = loadWeekend();
  const sorted = [...s.teams].sort((a, b) => b.score - a.score);
  w.games.push({
    round: roundName,
    when: new Date().toLocaleString(),
    results: sorted.map(t => ({ name: t.name, score: t.score })),
  });
  sorted.forEach((t, i) => {
    const tot = w.totals[t.name] || (w.totals[t.name] = { points: 0, wins: 0, games: 0 });
    tot.points += t.score;
    tot.games += 1;
    if (i === 0) tot.wins += 1;
  });
  saveWeekend(w);
}
