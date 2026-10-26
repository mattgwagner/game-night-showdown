/* Game rules as plain functions over the state. Anything that changes state
   takes an immer draft (see store.ts) and mutates it. No DOM in here. */
import { ROUNDS } from '../content';
import type { Question, Round, TriviaRound } from '../content/types';
import { drawFrom, migrateDrawn } from './decks';
import { VALUES, TEAM_COLORS, squareKey, type GameState, type Team } from './state';

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const findRound = (id: string | null): Round | undefined => ROUNDS.find(r => r.id === id);
export const currentRound = (s: GameState) => findRound(s.roundId);
export const categoryNames = (r: Round) => Object.keys(r.categories);

export function questionAt(r: TriviaRound, cat: string, val: number): Question {
  return r.categories[cat][VALUES.indexOf(val as (typeof VALUES)[number])];
}

// A round carries 8 categories but only `boardSize` of them go up. Picking a
// fresh slice each time keeps games short AND means the same round plays
// differently every night.
export function activeCats(s: GameState): string[] {
  const r = currentRound(s);
  if (!r) return [];
  const names = categoryNames(r);
  if (!s.activeCategories || !s.activeCategories.length) return names;
  return s.activeCategories.filter(c => names.includes(c));
}

export const totalCells = (s: GameState) => activeCats(s).length * VALUES.length;
export const usedCount = (s: GameState) => Object.keys(s.used).length;
export const boardCleared = (s: GameState) => totalCells(s) > 0 && usedCount(s) >= totalCells(s);

export function startRound(s: GameState, roundId: string) {
  const r = findRound(roundId);
  if (!r) return;
  s.roundId = roundId;
  s.used = {};
  s.readerIndex = 0;
  s.lastCorrectTeamId = null;
  s.history = [];
  s.finalDone = false;
  s.modeState = null;
  s.dd = null;
  s.wild = {};
  s.screen = 'board';

  if (r.kind === 'gauntlet') {
    s.activeCategories = categoryNames(r);
    s.boardIntro = false;
    return;
  }
  // Pre-pick boardSize categories; the host can change them on the next screen.
  s.activeCategories = shuffle(categoryNames(r)).slice(0, Math.min(s.boardSize || 4, categoryNames(r).length));
  s.boardIntro = true;
}

export function lockInCategories(s: GameState, selected: string[]) {
  const r = currentRound(s);
  if (!r) return;
  const picks = selected.filter(c => c in r.categories);
  if (!picks.length) return;
  s.activeCategories = picks;
  s.boardIntro = false;
  s.dd = null;
  if (r.kind === 'trivia') {
    const opts = picks.flatMap(c => VALUES.map(v => ({ category: c, value: v as number })));
    s.dd = opts[Math.floor(Math.random() * opts.length)];
    drawWildcards(s, picks);
  }
}

// A few random squares, about one per three categories, become wildcards.
export function drawWildcards(s: GameState, picks: string[]) {
  s.wild = {};
  const dk = s.dd ? squareKey(s.dd.category, s.dd.value) : null;
  const squares = picks.flatMap(c => VALUES.map(v => squareKey(c, v))).filter(k => k !== dk);
  const keep = Math.max(1, Math.round(picks.length / 3));
  shuffle(squares).slice(0, keep).forEach(k => { s.wild[k] = true; });
}

export function currentReader(s: GameState): Team | null {
  if (s.teams.length === 0) return null;
  return s.teams[s.readerIndex % s.teams.length];
}

export const teamById = (s: GameState, id: number | null | undefined) => s.teams.find(t => t.id === id);

// Control follows the last correct answer. A miss, a wildcard, or a challenge
// leaves the pick with whoever already has it.
export function giveControl(s: GameState, teamId: number) {
  const idx = s.teams.findIndex(t => t.id === teamId);
  if (idx !== -1) s.readerIndex = idx;
}

export function addTeam(s: GameState, name: string) {
  const id = s.nextTeamId++;
  s.teams.push({
    id, name, color: TEAM_COLORS[(id - 1) % TEAM_COLORS.length],
    score: 0, wildcardGain: 0, biggestSwing: 0, maxStreak: 0, currentStreak: 0, challengesWon: 0,
  });
}

export function resetTeamStats(team: Team) {
  team.score = 0;
  team.wildcardGain = 0;
  team.biggestSwing = 0;
  team.maxStreak = 0;
  team.currentStreak = 0;
}

export interface ScoreOpts { isAnswer?: boolean; isWildcard?: boolean; isChallenge?: boolean }

// Records a scoring event and updates the streak/wildcard/swing stats used for
// the end-of-game superlatives.
export function scoreEvent(s: GameState, teamId: number, delta: number, opts: ScoreOpts = {}) {
  const team = teamById(s, teamId);
  if (!team) return;
  team.score += delta;
  if (delta > (team.biggestSwing || 0)) team.biggestSwing = delta;
  if (opts.isWildcard) team.wildcardGain = (team.wildcardGain || 0) + delta;
  if (opts.isChallenge && delta > 0) team.challengesWon = (team.challengesWon || 0) + 1;
  if (opts.isAnswer && delta > 0) {
    if (s.lastCorrectTeamId === team.id) team.currentStreak = (team.currentStreak || 0) + 1;
    else team.currentStreak = 1;
    s.lastCorrectTeamId = team.id;
    team.maxStreak = Math.max(team.maxStreak || 0, team.currentStreak);
  }
}

/* ============================================================
   UNDO
   Snapshot before every square resolves. The host always
   mis-taps at least once a night.
============================================================ */
export function pushHistory(s: GameState) {
  s.history.push(JSON.stringify({
    teams: s.teams, used: s.used, readerIndex: s.readerIndex,
    lastCorrectTeamId: s.lastCorrectTeamId, drawn: s.drawn,
  }));
  if (s.history.length > 25) s.history.shift();
}

export function undoLast(s: GameState): boolean {
  const raw = s.history.pop();
  if (!raw) return false;
  const snap = JSON.parse(raw);
  s.teams = snap.teams;
  s.used = snap.used;
  s.readerIndex = snap.readerIndex;
  s.lastCorrectTeamId = snap.lastCorrectTeamId;
  s.drawn = migrateDrawn(snap.drawn); // snapshots from the old version stored positions
  if (s.screen === 'winner') s.screen = 'board';
  return true;
}

/* ---------- Superlatives (end-of-game awards) ---------- */
export interface Award { label: string; team: Team; detail: string }

export function computeSuperlatives(teams: Team[]): Award[] {
  const awards: Award[] = [];
  if (teams.length === 0) return awards;
  const top = (f: (t: Team) => number) => [...teams].sort((a, b) => f(b) - f(a))[0];

  const swing = top(t => t.biggestSwing || 0);
  if (swing.biggestSwing > 0) awards.push({ label: '💥 Comeback Kid (biggest single swing)', team: swing, detail: `+${swing.biggestSwing} in one shot` });

  const wild = top(t => t.wildcardGain || 0);
  if ((wild.wildcardGain || 0) > 0) awards.push({ label: '🍀 Wildcard Whisperer (luckiest on the unmarked squares)', team: wild, detail: `net +${wild.wildcardGain} from wildcards` });

  const streak = top(t => t.maxStreak || 0);
  if ((streak.maxStreak || 0) >= 2) awards.push({ label: '🧊 Ice in Their Veins (longest correct streak)', team: streak, detail: `${streak.maxStreak} correct in a row` });

  const chal = top(t => t.challengesWon || 0);
  if ((chal.challengesWon || 0) > 0) awards.push({ label: '💪 Did The Thing (most challenges completed)', team: chal, detail: `${chal.challengesWon} challenge${chal.challengesWon === 1 ? '' : 's'} survived` });

  const sorted = [...teams].sort((a, b) => b.score - a.score);
  if (sorted.length > 1) {
    const last = sorted[sorted.length - 1];
    awards.push({ label: '🪑 Gracious in Defeat (last place, still showed up)', team: last, detail: `${last.score} points and a lot of heart` });
  }
  return awards;
}

/* ============================================================
   GAME MODES: the non-Jeopardy formats. Everything they need
   lives in state.modeState so they survive a refresh.
============================================================ */
export function startMode(s: GameState, key: 'lightning' | 'standing' | 'potato') {
  const ids = s.teams.map(t => t.id);
  if (key === 'lightning') s.modeState = { kind: 'lightning', order: ids, idx: 0, phase: 'ready', correct: {}, q: null, deadline: 0 };
  else if (key === 'standing') s.modeState = { kind: 'standing', alive: [...ids], idx: 0, phase: 'question', q: drawFrom(s, 'bonus'), out: [] };
  else s.modeState = { kind: 'potato', alive: [...ids], idx: 0, prompt: drawFrom(s, 'lists'), said: 0 };
  s.screen = 'mode';
}

export function exitMode(s: GameState) {
  s.modeState = null;
  s.screen = 'roundselect';
}

export function aliveTeams(s: GameState, alive: number[]): Team[] {
  return alive.map(id => teamById(s, id)).filter((t): t is Team => !!t);
}

/** Last one standing in a knockout mode takes 1000, once. Returns the winner's id if paid now. */
export function payKnockoutWinner(s: GameState): number | null {
  const ms = s.modeState;
  if (!ms || ms.kind === 'lightning' || ms.paid) return null;
  const alive = aliveTeams(s, ms.alive);
  if (alive.length !== 1) return null;
  ms.paid = true;
  scoreEvent(s, alive[0].id, 1000, { isAnswer: true });
  return alive[0].id;
}
