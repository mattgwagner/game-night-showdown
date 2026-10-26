/* The one game state. Change it with update(draft => { ... }): the recipe
   mutates an immer draft, and every commit is saved, so a closed tab
   resumes where it left off. */
import { produce } from 'immer';
import { useSyncExternalStore } from 'react';
import { loadSavedGame, loadWeekend, persistDrawn, saveGame } from './persistence';
import { freshState, type GameState } from './state';

// Land on setup with the saved game's spice, so the host chooses whether to resume.
let state: GameState = { ...freshState(), drawn: loadWeekend().drawn, spice: loadSavedGame()?.spice || 'family' };
const listeners = new Set<() => void>();

export const getState = () => state;

export function update(recipe: (draft: GameState) => void) {
  setState(produce(state, recipe));
}

export function setState(next: GameState) {
  const drawnChanged = next.drawn !== state.drawn;
  state = next;
  saveGame(state);
  if (drawnChanged) persistDrawn(state.drawn);
  listeners.forEach(l => l());
}

/** A fresh game that keeps the weekend's drawn cards. */
export function resetGame() {
  setState({ ...freshState(), drawn: loadWeekend().drawn });
}

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function useGame(): GameState {
  return useSyncExternalStore(subscribe, getState);
}

/* ---------- A tiny store factory for the UI-only stores (overlay, buzz) ---------- */
export function createStore<T>(initial: T) {
  let value = initial;
  const ls = new Set<() => void>();
  const sub = (l: () => void) => { ls.add(l); return () => { ls.delete(l); }; };
  return {
    get: () => value,
    set(next: T) { value = next; ls.forEach(l => l()); },
    use: () => useSyncExternalStore(sub, () => value),
  };
}
