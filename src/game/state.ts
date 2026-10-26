import type { Question } from '../content/types';

export const VALUES = [100, 200, 300, 400, 500] as const;
export type Value = (typeof VALUES)[number];

export const TEAM_COLORS = [
  '#f5c518', '#2ecc71', '#3498db', '#e67e22', '#9b59b6',
  '#1abc9c', '#e74c3c', '#fd79a8', '#00cec9', '#a29bfe',
];

export interface Team {
  id: number;
  name: string;
  color: string;
  score: number;
  wildcardGain: number;
  biggestSwing: number;
  maxStreak: number;
  currentStreak: number;
  challengesWon: number;
}

export type Screen = 'setup' | 'roundselect' | 'board' | 'mode' | 'winner';

export type ModeState =
  | { kind: 'lightning'; order: number[]; idx: number; phase: 'ready' | 'playing' | 'done'; correct: Record<number, number>; q: Question | null; deadline: number }
  | { kind: 'standing'; alive: number[]; idx: number; phase: 'question' | 'reveal'; q: Question; out: string[]; paid?: boolean }
  | { kind: 'potato'; alive: number[]; idx: number; prompt: string; said: number; paid?: boolean };

export interface GameState {
  teams: Team[];
  nextTeamId: number;
  /** "Category|Value" -> true once the square is played */
  used: Record<string, true>;
  screen: Screen;
  roundId: string | null;
  /** Round ids in the order the round list shows them this session */
  roundOrder: string[] | null;
  /** Who picks next: the team that last answered a question correctly */
  readerIndex: number;
  lastCorrectTeamId: number | null;
  spice: 'family' | 'party';
  /** Drinking games are their own opt-in, separate from spice */
  drinks: boolean;
  /** How many of a round's categories go on the board */
  boardSize: number;
  activeCategories: string[] | null;
  /** This game's Daily Double square */
  dd: { category: string; value: number } | null;
  /** "cat|val" -> true for this board's wildcard squares */
  wild: Record<string, true>;
  modeState: ModeState | null;
  /** deck name -> keys of cards already drawn this weekend */
  drawn: Record<string, string[]>;
  /** Undo snapshots (JSON) */
  history: string[];
  finalDone: boolean;
  boardIntro: boolean;
}

export function freshState(): GameState {
  return {
    teams: [],
    nextTeamId: 1,
    used: {},
    screen: 'setup',
    roundId: null,
    roundOrder: null,
    readerIndex: 0,
    lastCorrectTeamId: null,
    spice: 'family',
    drinks: false,
    boardSize: 4,
    activeCategories: null,
    dd: null,
    wild: {},
    modeState: null,
    drawn: {},
    history: [],
    finalDone: false,
    boardIntro: false,
  };
}

export const squareKey = (cat: string, val: number) => cat + '|' + val;
