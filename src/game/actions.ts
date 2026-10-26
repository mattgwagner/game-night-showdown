/* What the buttons do. Each action commits a state change, plays its sound,
   and opens or closes the card on screen. */
import { CATEGORY_HINTS } from '../content';
import type { ChallengeType } from '../content/types';
import { buzzArm, buzzEndQuestion, buzzSend, buzzStore, enableBuzzers, ensureStageBuzz, sendTeams } from '../buzz/client';
import { getStageCode } from '../buzz/room';
import { flashScorePop, flashToast, overlayStore, type Done } from '../ui/uiStore';
import { drawFrom, drawWildcardEvent, type WildcardEvent } from './decks';
import * as rules from './rules';
import { playCorrect, playDailyDouble, playWildcardReveal, playWrong } from './sound';
import { squareKey } from './state';
import { getState, update } from './store';

export function closeOverlay() {
  overlayStore.set(null);
  const b = buzzStore.get();
  if (b.connected && (b.armed || b.prompt)) buzzEndQuestion();
}

function score(teamId: number, delta: number, opts?: rules.ScoreOpts) {
  update(s => rules.scoreEvent(s, teamId, delta, opts));
  flashScorePop(delta);
}

export function markUsed(cat: string, val: number) {
  update(s => { s.used[squareKey(cat, val)] = true; });
  closeOverlay();
}

export function finish(done: Done) {
  if (done.kind === 'square') markUsed(done.cat, done.val);
  else closeOverlay();
}

/** A team got the question right: points, the next pick, and the square is done. */
export function awardSquare(teamId: number, cat: string, val: number) {
  if (buzzStore.get().connected) buzzEndQuestion();
  score(teamId, val, { isAnswer: true });
  update(s => rules.giveControl(s, teamId));
  playCorrect();
  markUsed(cat, val);
}

/** `quiet` when the answer clock ran out: the buzzer already said so. */
export function nobodySquare(cat: string, val: number, quiet = false) {
  if (buzzStore.get().connected) buzzEndQuestion();
  if (!quiet) playWrong();
  markUsed(cat, val);
}

export function openSquare(cat: string, val: number) {
  update(rules.pushHistory);
  const s = getState();
  const round = rules.currentRound(s);
  const team = rules.currentReader(s);
  if (!round || !team) return;

  // Gauntlet boards have no trivia at all: every square draws live.
  if (round.kind === 'gauntlet') {
    const spec = round.categories[cat];
    const ctx = { val, teamId: team.id, done: { kind: 'square', cat, val } as Done };
    if (spec.deck === 'duel') openDuel(ctx);
    else openChallenge(ctx, spec.type);
    return;
  }

  const item = rules.questionAt(round, cat, val);
  if (s.dd && s.dd.category === cat && s.dd.value === val) {
    playDailyDouble();
    overlayStore.set({ kind: 'dailyDouble', cat, val, item, teamId: team.id });
    return;
  }
  if (s.wild[squareKey(cat, val)]) {
    overlayStore.set({ kind: 'wildcard', cat, val, teamId: team.id });
    return;
  }
  const hint = CATEGORY_HINTS[cat] || item.hint;
  // TV/stage hides answers until the host phone reveals.
  const split = buzzStore.get().connected;
  overlayStore.set({ kind: 'question', cat, val, item, hint, split });
  if (split) {
    buzzArm();
    buzzSend({ type: 'prompt', cat, val, q: item.q, a: item.a, hint: hint || '' });
  }
}

export function openRandomSquare() {
  const s = getState();
  const open = rules.activeCats(s).flatMap(cat => [100, 200, 300, 400, 500]
    .filter(v => !s.used[squareKey(cat, v)]).map(v => [cat, v] as const));
  if (!open.length) return;
  const [cat, v] = open[Math.floor(Math.random() * open.length)];
  openSquare(cat, v);
}

interface LiveCtx { val: number; teamId: number; done: Done }

// On a normal board, physical should show up more often than poems.
const WILDCARD_TYPES: ChallengeType[] = ['physical', 'burn', 'performance', 'speed', 'social', 'room'];

export function openChallenge(ctx: LiveCtx, filterType?: ChallengeType | ChallengeType[]) {
  const types = filterType ? ([] as ChallengeType[]).concat(filterType) : null;
  const mixed = !!types && types.length > 1 && types.includes('physical');
  let ch!: ReturnType<typeof drawFrom<'challenge'>>;
  let forfeit: string | undefined;
  update(s => {
    ch = (mixed && Math.random() < 0.6)
      ? drawFrom(s, 'challenge', c => c.type === 'physical' || c.type === 'burn')
      : drawFrom(s, 'challenge', types ? (c => types.includes(c.type)) : undefined);
    if (ch.drinks) forfeit = drawFrom(s, 'forfeit').d;
  });
  overlayStore.set({ kind: 'challenge', ch, forfeit, ...ctx });
}

export function rerollForfeit() {
  const o = overlayStore.get();
  if (o?.kind !== 'challenge') return;
  let d = '';
  update(s => { d = drawFrom(s, 'forfeit').d; });
  overlayStore.set({ ...o, forfeit: d });
}

export function openDuel(ctx: LiveCtx) {
  if (getState().teams.length < 2) { openChallenge(ctx); return; }
  overlayStore.set({ kind: 'duel', ...ctx });
}

export function drawDuel() {
  let duel!: ReturnType<typeof drawFrom<'duel'>>;
  update(s => { duel = drawFrom(s, 'duel'); });
  return duel;
}

/** A live challenge paid out. */
export function payChallenge(teamId: number, val: number, done: Done) {
  score(teamId, val, { isAnswer: true, isChallenge: true });
  playCorrect();
  finish(done);
}

export function settleDuel(winnerId: number, loserId: number, val: number, done: Done) {
  score(winnerId, val, { isAnswer: true, isChallenge: true });
  score(loserId, -Math.round(val / 2), { isChallenge: true });
  playCorrect();
  finish(done);
}

export function noPoints(done: Done) {
  playWrong();
  finish(done);
}

export const pickWildcardEvent = () => drawWildcardEvent(getState());

export function runWildcardEvent(event: WildcardEvent, cat: string, val: number, teamId: number) {
  playWildcardReveal();
  const done: Done = { kind: 'square', cat, val };
  if (event.kind === 'challenge') return openChallenge({ val, teamId, done }, WILDCARD_TYPES);
  if (event.kind === 'duel') return openDuel({ val, teamId, done });
  let text = '';
  update(s => {
    const team = rules.teamById(s, teamId);
    if (!team || !event.apply || !event.describe) return;
    text = event.describe(val, s, team);
    const before = team.score;
    event.apply(s, team, val);
    const delta = team.score - before;
    team.wildcardGain = (team.wildcardGain || 0) + delta;
    team.biggestSwing = Math.max(team.biggestSwing || 0, delta);
  });
  overlayStore.set({ kind: 'instant', label: event.label, text, done });
}

export function settleDailyDouble(teamId: number, wager: number, right: boolean, cat: string, val: number, quiet = false) {
  if (right) {
    score(teamId, wager, { isAnswer: true });
    update(s => rules.giveControl(s, teamId));
    playCorrect();
  } else {
    score(teamId, -wager, { isAnswer: false });
    if (!quiet) playWrong();
  }
  markUsed(cat, val);
}

export function startSideQuest(teamId: number) {
  update(rules.pushHistory);
  openChallenge({ val: 200, teamId, done: { kind: 'close' } });
}

export function adjustScore(teamId: number, delta: number) {
  update(s => { const t = rules.teamById(s, teamId); if (t) t.score += delta; });
}

export function openFinalShowdown() {
  let item!: ReturnType<typeof drawFrom<'final'>>;
  update(s => { item = drawFrom(s, 'final'); });
  playDailyDouble();
  overlayStore.set({ kind: 'final', item });
}

/** Final Showdown verdicts: each player's wager, won or lost. */
export function settleFinal(results: { teamId: number; wager: number; right: boolean }[]) {
  results.forEach(r => score(r.teamId, r.right ? r.wager : -r.wager, r.right ? { isAnswer: true } : {}));
  update(s => { s.finalDone = true; s.screen = 'winner'; });
  closeOverlay();
}

export function skipFinal() {
  update(s => { s.finalDone = true; s.screen = 'winner'; });
}

export function undo() {
  let ok = false;
  update(s => { ok = rules.undoLast(s); });
  return ok;
}

/* ---------- Dual screen ---------- */
export async function connectStage() {
  const ok = await enableBuzzers();
  flashToast(ok ? 'Show live — host phone uses ' + getStageCode() : 'Could not start dual screen');
  return ok;
}

let lastStageFailed = false;
/** Connects the show if it isn't already. Says so once when it fails, not on every retry. */
export function keepStageConnected() {
  ensureStageBuzz()?.then(ok => {
    if (ok) flashToast('Show live — host phone uses ' + getStageCode());
    else if (!lastStageFailed) flashToast('Could not start dual screen');
    lastStageFailed = !ok;
  });
}

export function openDualScreenCard() {
  sendTeams();
  overlayStore.set({ kind: 'dualScreen' });
}
