/* The rules every content edit has to pass. `npm test` runs these; so does CI. */
import { describe, expect, test } from 'vitest';
import * as C from '../src/content';
import type { ChallengeType, TriviaRound } from '../src/content/types';
import { DECKS } from '../src/game/decks';

const trivia = C.ROUNDS.filter((r): r is TriviaRound => r.kind === 'trivia');
const filled = (s: unknown) => typeof s === 'string' && s.trim().length > 0 && s === s.trim();

describe('rounds', () => {
  test('ids are unique', () => {
    const ids = C.ROUNDS.map(r => r.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  test.each(C.ROUNDS.map(r => [r.id, r] as const))('%s has a name, a tagline and at least 4 categories', (_, r) => {
    expect(filled(r.name)).toBe(true);
    expect(filled(r.tagline)).toBe(true);
    expect(Object.keys(r.categories).length).toBeGreaterThanOrEqual(4);
    // "|" separates category and value in the board's square keys.
    for (const c of Object.keys(r.categories)) expect(c, c).not.toContain('|');
  });

  test.each(trivia.map(r => [r.id, r] as const))('%s: every category has five filled-in questions', (_, r) => {
    for (const [cat, qs] of Object.entries(r.categories)) {
      expect(qs.length, cat).toBe(5);
      qs.forEach((q, i) => {
        expect(filled(q.q), `${cat} #${i + 1} question`).toBe(true);
        expect(filled(q.a), `${cat} #${i + 1} answer`).toBe(true);
        if (q.hint !== undefined) expect(filled(q.hint), `${cat} #${i + 1} hint`).toBe(true);
      });
    }
  });

  test('no question is asked twice anywhere in the game', () => {
    const seen = new Map<string, string>();
    for (const r of trivia) for (const [cat, qs] of Object.entries(r.categories)) for (const q of qs) {
      const k = q.q.toLowerCase();
      expect(seen.get(k), `"${q.q}" is in ${seen.get(k)} and ${r.id} / ${cat}`).toBeUndefined();
      seen.set(k, `${r.id} / ${cat}`);
    }
  });

  test('gauntlet squares point at challenge types that have cards', () => {
    for (const r of C.ROUNDS) if (r.kind === 'gauntlet') for (const [cat, sq] of Object.entries(r.categories)) {
      if (sq.deck !== 'challenge' || !sq.type) continue;
      const types = ([] as ChallengeType[]).concat(sq.type);
      expect(C.CHALLENGES.some(c => types.includes(c.type)), `${r.id} / ${cat}`).toBe(true);
    }
  });

  test('every category hint matches a category that exists', () => {
    const cats = new Set(C.ROUNDS.flatMap(r => Object.keys(r.categories)));
    for (const name of Object.keys(C.CATEGORY_HINTS)) expect(cats.has(name), name).toBe(true);
  });
});

describe('decks', () => {
  // A card's text is its identity in the weekend's "already drawn" list.
  test.each(Object.keys(DECKS))('%s cards are unique and filled in', (name) => {
    const { pool, key } = DECKS[name as keyof typeof DECKS] as { pool: unknown[]; key: (c: unknown) => string };
    const keys = pool.map(key);
    expect(pool.length).toBeGreaterThan(0);
    keys.forEach(k => expect(filled(k), k).toBe(true));
    expect(keys.length - new Set(keys).size, 'duplicate cards').toBe(0);
  });

  test('every challenge type a wildcard can draw has family-friendly, sober cards', () => {
    const types: ChallengeType[] = ['physical', 'burn', 'performance', 'speed', 'social', 'room'];
    for (const t of types) expect(C.CHALLENGES.some(c => c.type === t && !c.spice && !c.drinks), t).toBe(true);
  });

  test('drink cards are gated behind drinking games', () => {
    for (const c of C.CHALLENGES) if (c.type === 'drink') expect(c.drinks, c.t).toBe(true);
  });
});
