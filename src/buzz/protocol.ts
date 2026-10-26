// Messages to and from the buzz worker (buzz/src/index.ts). Keep the two in step.

/** Seconds to answer a clue. The worker has the same number. */
export const CLUE_SECONDS = 15;
export type Role = 'host' | 'player' | 'controller';
export type BuzzEntry = { id: string; name: string; teamId: number | null; teamName: string; at: number };
export type TeamInfo = { id: number; name: string; color?: string };
export type Prompt = { cat: string; val: number; q: string; a: string; hint?: string; revealed: boolean };
export type PlayerInfo = { id: string; name: string; teamName: string };

export type ClientMsg =
  | { type: 'hello'; role: Role; name?: string; teamId?: number | null; teamName?: string }
  | { type: 'setTeams'; teams: TeamInfo[] }
  | { type: 'arm' }
  | { type: 'disarm' }
  | { type: 'buzz' }
  | { type: 'pop' }
  | { type: 'clear' }
  | { type: 'prompt'; cat: string; val: number; q: string; a: string; hint?: string }
  | { type: 'revealAnswer' }
  | { type: 'clearPrompt' }
  | { type: 'remoteAward'; teamId: number }
  | { type: 'remoteNobody' };

export type RoomState = {
  armed: boolean;
  queue: BuzzEntry[];
  missed: string[];
  /** Milliseconds left on the answer clock when the room sent this; null when it isn't running. */
  answerLeft?: number | null;
  answerTotal?: number;
  players: PlayerInfo[];
  teams: TeamInfo[];
  prompt: Prompt | null;
};

export type ServerMsg =
  | ({ type: 'welcome'; id: string; code: string } & RoomState)
  | ({ type: 'state' } & RoomState)
  | { type: 'remoteAward'; teamId: number; val: number; cat: string }
  | { type: 'remoteNobody'; cat: string; val: number }
  | { type: 'error'; message: string };
