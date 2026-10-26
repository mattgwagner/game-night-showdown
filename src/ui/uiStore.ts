/* UI state that isn't part of the saved game: which card is open, toasts. */
import type { Challenge, FinalQuestion, Question } from '../content/types';
import { createStore } from '../game/store';

/** What happens when a live-action card finishes. */
export type Done = { kind: 'square'; cat: string; val: number } | { kind: 'close' };

export type Overlay =
  /** split: the TV hides the answer and the host phone has it (decided when the square opens) */
  | { kind: 'question'; cat: string; val: number; item: Question; hint?: string; split: boolean }
  | { kind: 'dailyDouble'; cat: string; val: number; item: Question; teamId: number }
  | { kind: 'wildcard'; cat: string; val: number; teamId: number }
  | { kind: 'challenge'; ch: Challenge; val: number; teamId: number; done: Done; forfeit?: string }
  | { kind: 'duel'; val: number; teamId: number; done: Done }
  | { kind: 'instant'; label: string; text: string; done: Done }
  | { kind: 'scoreEditor' }
  | { kind: 'sideQuest' }
  | { kind: 'final'; item: FinalQuestion }
  | { kind: 'dualScreen' };

export const overlayStore = createStore<Overlay | null>(null);
export const hostSheetStore = createStore(false);
export const toastStore = createStore<{ msg: string; n: number } | null>(null);
export const scorePopStore = createStore<{ delta: number; n: number } | null>(null);

let n = 0;
export const flashToast = (msg: string) => toastStore.set({ msg, n: ++n });
export const flashScorePop = (delta: number) => { if (delta) scorePopStore.set({ delta, n: ++n }); };
