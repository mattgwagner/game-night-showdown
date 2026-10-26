import type { Round } from './types';

// Every file in rounds/ is a board. Drop a new file in and it shows up; no list to edit.
const modules = import.meta.glob<{ default: Round }>('./rounds/*.ts', { eager: true });
export const ROUNDS: Round[] = Object.keys(modules).sort().map(k => modules[k].default);

export { BONUS_QUESTIONS } from './bonus-questions';
export { CHALLENGES } from './challenges';
export { DUELS } from './duels';
export { FINAL_SHOWDOWN } from './final-showdown';
export { FORFEITS } from './forfeits';
export { LIST_PROMPTS } from './list-prompts';
export { CATEGORY_HINTS } from './category-hints';
export { NAME_LEFT, NAME_RIGHT } from './team-names';
export type * from './types';
