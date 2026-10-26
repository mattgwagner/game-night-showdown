import { produce } from 'immer';
import { beforeEach, describe, expect, test } from 'vitest';
import { BONUS_QUESTIONS, CHALLENGES, ROUNDS } from '../src/content';
import { drawFrom, migrateDrawn } from '../src/game/decks';
import { loadSavedGame } from '../src/game/persistence';
import * as rules from '../src/game/rules';
import { freshState, squareKey, type GameState } from '../src/game/state';

const memory = new Map<string, string>();
beforeEach(() => {
  memory.clear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => memory.get(k) ?? null,
      setItem: (k: string, v: string) => { memory.set(k, v); },
      removeItem: (k: string) => { memory.delete(k); },
    },
  });
});

function game(teams = ['A', 'B', 'C']): GameState {
  return produce(freshState(), d => { teams.forEach(n => rules.addTeam(d, n)); });
}

describe('decks', () => {
  test('a filtered draw never repeats until its subset runs out, then recycles only that subset', () => {
    let s = game();
    const physical = CHALLENGES.filter(c => c.type === 'physical' && !c.spice && !c.drinks);
    const seen = new Set<string>();
    s = produce(s, d => { drawFrom(d, 'challenge', c => c.type === 'room'); });
    const room = s.drawn.challenge[0];
    for (let i = 0; i < physical.length; i++) s = produce(s, d => { seen.add(drawFrom(d, 'challenge', c => c.type === 'physical').t); });
    expect(seen.size).toBe(physical.length);
    s = produce(s, d => { drawFrom(d, 'challenge', c => c.type === 'physical'); });
    expect(s.drawn.challenge).toContain(room);
    expect(s.drawn.challenge.length).toBe(2);
  });

  test('After Dark and drinking cards stay out of a family game', () => {
    let s = game();
    for (let i = 0; i < CHALLENGES.length; i++) {
      s = produce(s, d => {
        const c = drawFrom(d, 'challenge');
        expect(c.spice, c.t).toBeUndefined();
        expect(c.drinks, c.t).toBeUndefined();
      });
    }
  });

  test('old position-based drawn lists become card keys', () => {
    expect(migrateDrawn({ bonus: [0, 2, 9999], challenge: ['Wall Sit'] })).toEqual({
      bonus: [BONUS_QUESTIONS[0].q, BONUS_QUESTIONS[2].q],
      challenge: ['Wall Sit'],
    });
  });
});

describe('board', () => {
  const trivia = ROUNDS.find(r => r.kind === 'trivia')!;

  test('starting a round pre-picks boardSize categories and waits on the intro', () => {
    const s = produce(game(), d => { d.boardSize = 6; rules.startRound(d, trivia.id); });
    expect(s.activeCategories).toHaveLength(6);
    expect(s.boardIntro).toBe(true);
    expect(s.screen).toBe('board');
  });

  test('locking in draws one Daily Double and about one wildcard per three categories, never on the same square', () => {
    for (let i = 0; i < 50; i++) {
      const picks = Object.keys(trivia.categories).slice(0, 6);
      const s = produce(game(), d => { rules.startRound(d, trivia.id); rules.lockInCategories(d, picks); });
      expect(picks).toContain(s.dd!.category);
      expect(Object.keys(s.wild)).toHaveLength(2);
      expect(s.wild[squareKey(s.dd!.category, s.dd!.value)]).toBeUndefined();
    }
  });

  test('the board is cleared once every active square is used', () => {
    const picks = Object.keys(trivia.categories).slice(0, 4);
    let s = produce(game(), d => { rules.startRound(d, trivia.id); rules.lockInCategories(d, picks); });
    expect(rules.boardCleared(s)).toBe(false);
    s = produce(s, d => { picks.forEach(c => [100, 200, 300, 400, 500].forEach(v => { d.used[squareKey(c, v)] = true; })); });
    expect(rules.boardCleared(s)).toBe(true);
  });
});

describe('scoring', () => {
  test('streaks count consecutive correct answers by the same team', () => {
    let s = game();
    const [a, b] = s.teams;
    s = produce(s, d => {
      rules.scoreEvent(d, a.id, 100, { isAnswer: true });
      rules.scoreEvent(d, a.id, 200, { isAnswer: true });
    });
    expect(s.teams[0]).toMatchObject({ score: 300, currentStreak: 2, maxStreak: 2, biggestSwing: 200 });
    s = produce(s, d => { rules.scoreEvent(d, b.id, 100, { isAnswer: true }); rules.scoreEvent(d, a.id, 100, { isAnswer: true }); });
    expect(s.teams[0]).toMatchObject({ currentStreak: 1, maxStreak: 2 });
  });

  test('undo restores scores and squares', () => {
    let s = produce(game(), d => { rules.pushHistory(d); rules.scoreEvent(d, d.teams[0].id, 500); d.used['X|100'] = true; });
    s = produce(s, d => { expect(rules.undoLast(d)).toBe(true); });
    expect(s.teams[0].score).toBe(0);
    expect(s.used).toEqual({});
  });

  test('the last team standing gets paid exactly once', () => {
    let s = produce(game(['A', 'B']), d => { rules.startMode(d, 'standing'); });
    const [a, b] = s.teams;
    s = produce(s, d => {
      if (d.modeState?.kind === 'standing') d.modeState.alive = [b.id];
      expect(rules.payKnockoutWinner(d)).toBe(b.id);
      expect(rules.payKnockoutWinner(d)).toBeNull();
    });
    expect(s.teams.find(t => t.id === b.id)!.score).toBe(1000);
    expect(s.teams.find(t => t.id === a.id)!.score).toBe(0);
  });
});

describe('saved games', () => {
  test('a game saved by the single-file version resumes on the same round', () => {
    memory.set('gns.save.v1', JSON.stringify({
      nextTeamId: 3,
      state: {
        teams: [{ id: 1, name: 'A', score: 300 }, { id: 2, name: 'B', score: 0 }],
        screen: 'board', roundIndex: 2, roundOrder: [2, 0, 1], used: { 'History|100': true },
        drawn: { bonus: [1] }, spice: 'party', fillers: {},
      },
    }));
    const s = loadSavedGame()!;
    expect(s.roundId).toBe(ROUNDS[2].id);
    expect(s.roundOrder).toBeNull();
    expect(s.nextTeamId).toBe(3);
    expect(s.drawn.bonus).toEqual([BONUS_QUESTIONS[1].q]);
    expect(s.wild).toEqual({});
    expect(s.history).toEqual([]);
    expect(s.teams[0].color).toBeTruthy();
  });

  test('a save pointing at a deleted round goes back to the round list', () => {
    memory.set('gns.save.v2', JSON.stringify({ ...freshState(), teams: [{ id: 1, name: 'A', score: 0 }], screen: 'board', roundId: 'gone' }));
    expect(loadSavedGame()).toMatchObject({ roundId: null, screen: 'roundselect' });
  });

  test('nothing to resume from the setup screen', () => {
    memory.set('gns.save.v2', JSON.stringify({ ...freshState(), teams: [{ id: 1, name: 'A', score: 0 }] }));
    expect(loadSavedGame()).toBeNull();
  });
});
