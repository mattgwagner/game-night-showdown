/* Shapes for everything under src/content. Adding a question or a category
   only ever touches content files; the compiler and `npm test` catch the
   mistakes (a category with four questions, a typo'd challenge type). */

export interface Question {
  q: string;
  a: string;
  /** Shown above the question, e.g. "Closest guess wins." */
  hint?: string;
}

/** Exactly five questions, easiest first: 100, 200, 300, 400, 500. */
export type Category = readonly [Question, Question, Question, Question, Question];

export interface TriviaRound {
  kind: 'trivia';
  /** Stable id. Saved games point at rounds by id, so never reuse or rename one. */
  id: string;
  name: string;
  tagline: string;
  /** Usually eight. The host puts 4, 6 or 8 of them on the board. */
  categories: Record<string, Category>;
}

export type ChallengeType = 'physical' | 'performance' | 'speed' | 'social' | 'room' | 'burn' | 'drink';

/** A no-trivia square: drawn live from a deck every time it's opened. */
export type GauntletSquare =
  | { deck: 'challenge'; type?: ChallengeType | ChallengeType[] }
  | { deck: 'duel' };

export interface GauntletRound {
  kind: 'gauntlet';
  id: string;
  name: string;
  tagline: string;
  categories: Record<string, GauntletSquare>;
}

export type Round = TriviaRound | GauntletRound;

/** Deck gates. `spice: 'party'` needs After Dark; `drinks: true` needs drinking games on. */
interface Gated {
  spice?: 'party';
  drinks?: true;
}

export interface Challenge extends Gated {
  /** Title. Also its identity in the "already drawn this weekend" list, so keep titles unique. */
  t: string;
  d: string;
  /** Seconds on the clock; 0 for no clock. */
  timer: number;
  /** one: one person from the picking team · team: the whole team · room: everybody, winner's team scores */
  who: 'one' | 'team' | 'room';
  type: ChallengeType;
}

export interface Duel extends Gated {
  t: string;
  d: string;
  timer?: number;
}

export interface FinalQuestion {
  cat: string;
  q: string;
  a: string;
}

export interface Forfeit {
  d: string;
}

export const defineRound = (r: Omit<TriviaRound, 'kind'>): TriviaRound => ({ kind: 'trivia', ...r });
export const defineGauntlet = (r: Omit<GauntletRound, 'kind'>): GauntletRound => ({ kind: 'gauntlet', ...r });
