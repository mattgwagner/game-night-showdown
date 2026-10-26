/* ============================================================
   PHONE BUZZ-IN + HOST COMPANION: the WebSocket side.
   Stage (iPad/TV, role "host"): questions, no answers until revealed.
   Host phone (role "controller"): answers + scoring.
   Players (role "player"): buzz in.
============================================================ */
import { createStore, getState } from '../game/store';
import type { BuzzEntry, ClientMsg, Prompt, Role, RoomState, ServerMsg, TeamInfo } from './protocol';
import { getHostCode, getJoinCode, getStageCode } from './room';

// Tests point this at a local `wrangler dev`; never drive the live room from a test.
const BUZZ_API = import.meta.env.VITE_BUZZ_API || 'https://game-night-buzz.mattgwagner.workers.dev';
const BUZZ_WS = BUZZ_API.replace(/^http/, 'ws') + '/ws';

export interface BuzzView extends Omit<RoomState, 'answerLeft' | 'answerTotal'> {
  connected: boolean;
  code: string;
  myId: string;
  role: Role | null;
  name: string;
  teamId: number | null;
  teamName: string;
  /** The room's answer clock on this device's clock (Date.now()), or null. */
  answerBy: number | null;
  answerTotal: number;
}

export const buzzStore = createStore<BuzzView>({
  connected: false, code: '', myId: '', role: null,
  armed: false, queue: [], missed: [], players: [], teams: [], prompt: null,
  name: '', teamId: null, teamName: '', answerBy: null, answerTotal: 15,
});
const view = () => buzzStore.get();
const patch = (p: Partial<BuzzView>) => buzzStore.set({ ...view(), ...p });

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let gen = 0;

/** Stage-side hooks, set by the show app. */
export const stageHooks = {
  /** Is the TV showing a trivia question right now? */
  onQuestion: () => false,
  remoteAward: (_teamId: number, _cat: string, _val: number) => {},
  remoteNobody: (_cat: string, _val: number) => {},
  error: (_message: string) => {},
};

export function buzzSend(msg: ClientMsg) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
}

export const buzzArm = () => buzzSend({ type: 'arm' });
export const buzzPop = () => buzzSend({ type: 'pop' });
export function buzzEndQuestion() {
  buzzSend({ type: 'disarm' });
  buzzSend({ type: 'clearPrompt' });
}

export const teamsForRoom = (): TeamInfo[] => getState().teams.map(t => ({ id: t.id, name: t.name, color: t.color }));
export const sendTeams = () => buzzSend({ type: 'setTeams', teams: teamsForRoom() });

/** Matches a buzz to one of tonight's teams, by id and then by name. */
export function resolveBuzzTeam<T extends TeamInfo>(entry: BuzzEntry | undefined, pool: T[]): T | null {
  if (!entry) return null;
  if (entry.teamId != null) {
    const byId = pool.find(t => t.id == entry.teamId);
    if (byId) return byId;
  }
  if (entry.teamName) {
    const n = entry.teamName.toLowerCase();
    return pool.find(t => t.name.toLowerCase() === n) || null;
  }
  return null;
}

function applyState(msg: RoomState) {
  const b = view();
  const wasLead = !!(b.myId && b.queue[0] && b.queue[0].id === b.myId);
  const nextQueue = msg.queue || [];
  const becomingArmed = !b.armed && !!msg.armed;
  // A fresh clue starts when the buzzers arm. Otherwise, getting pulled off the
  // front of the queue while they stay armed means that answer was wrong.
  let missed = Array.isArray(msg.missed) ? msg.missed.slice() : b.missed.slice();
  if (becomingArmed && !Array.isArray(msg.missed)) missed = [];
  if (!becomingArmed && b.role === 'player' && wasLead && msg.armed &&
      !nextQueue.some(q => q.id === b.myId) && !missed.includes(b.myId)) {
    missed.push(b.myId);
  }
  if (!msg.armed && !Array.isArray(msg.missed)) missed = [];
  const next: BuzzView = {
    ...b,
    armed: !!msg.armed,
    queue: nextQueue,
    missed,
    players: msg.players || [],
    teams: msg.teams || b.teams,
    prompt: msg.prompt !== undefined ? msg.prompt : b.prompt,
    answerBy: msg.answerLeft == null ? null : Date.now() + msg.answerLeft,
    answerTotal: msg.answerTotal || b.answerTotal,
  };
  // Player: the room still carries last game's teams until the TV sends tonight's.
  // If my pick isn't on the new list, ask again rather than scoring a different team.
  if (next.role === 'player' && next.teamName && next.teams.length &&
      !next.teams.some(t => t.id == next.teamId && t.name === next.teamName)) {
    next.teamId = null;
    next.teamName = '';
  }
  buzzStore.set(next);
}

function scheduleReconnect(code: string, role: Role, opts: ConnectOpts, g: number) {
  if (g !== gen) return;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    if (g !== gen) return;
    connectBuzzSocket(code, role, opts).catch(() => scheduleReconnect(code, role, opts, gen));
  }, 1200);
}

interface ConnectOpts { name?: string }

export function connectBuzzSocket(code: string, role: Role, opts: ConnectOpts = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!/^[A-Z0-9]{4}$/.test(code)) { reject(new Error('bad code')); return; }
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    const g = ++gen;
    if (ws) {
      try { ws.close(); } catch { /* ignore */ }
      ws = null;
    }
    const sock = new WebSocket(`${BUZZ_WS}?room=${encodeURIComponent(code)}`);
    ws = sock;
    patch({ connected: false, code, role });
    let opened = false;
    let settled = false;
    sock.onopen = () => {
      if (g !== gen) return;
      opened = true;
      const b = view();
      const defaultName = role === 'host' ? 'Stage' : role === 'controller' ? 'Host' : 'Player';
      buzzSend({ type: 'hello', role, name: opts.name || b.name || defaultName, teamId: b.teamId, teamName: b.teamName });
      if (role === 'host') {
        if (getState().teams.length) sendTeams();
        // The room outlives the tab. If the TV isn't on a question, drop any
        // armed question left over from a reload or last game night.
        if (!stageHooks.onQuestion()) buzzEndQuestion();
      }
    };
    sock.onmessage = (ev) => {
      if (g !== gen) return;
      let msg: ServerMsg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.type === 'welcome') {
        patch({ connected: true, myId: msg.id });
        applyState(msg);
        if (!settled) { settled = true; resolve(); }
      } else if (msg.type === 'state') {
        applyState(msg);
      } else if (msg.type === 'remoteAward' && role === 'host') {
        stageHooks.remoteAward(msg.teamId, msg.cat, msg.val);
      } else if (msg.type === 'remoteNobody' && role === 'host') {
        stageHooks.remoteNobody(msg.cat, msg.val);
      } else if (msg.type === 'error') {
        stageHooks.error(msg.message || 'Buzz error');
      }
    };
    sock.onclose = () => {
      if (g !== gen) return;
      ws = null;
      patch({ connected: false, armed: false, answerBy: null });
      if (!opened && !settled) { settled = true; reject(new Error('connect failed')); }
      if (opened) scheduleReconnect(code, role, opts, g);
    };
    sock.onerror = () => {
      if (g !== gen) return;
      if (!opened && !settled) { settled = true; reject(new Error('ws error')); }
    };
  });
}

/** Joins as a player and remembers the name for reconnects. */
export function joinAsPlayer(code: string, name: string) {
  patch({ name });
  return connectBuzzSocket(code, 'player', { name });
}

export function pickTeam(team: TeamInfo) {
  patch({ teamId: team.id, teamName: team.name });
  const b = view();
  buzzSend({ type: 'hello', role: 'player', name: b.name, teamId: b.teamId, teamName: b.teamName });
}

/** Connects the show to the stage room. Claims the room first (best-effort). */
export async function enableBuzzers(): Promise<boolean> {
  const code = getStageCode();
  fetch(BUZZ_API + '/room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  }).catch(() => {});
  try {
    await connectBuzzSocket(code, 'host');
    return true;
  } catch {
    return false;
  }
}

let stagePromise: Promise<boolean> | null = null;
/** Keeps the show connected so answers stay on the host phone. */
export function ensureStageBuzz(): Promise<boolean> | undefined {
  if (getHostCode() || getJoinCode()) return;
  const b = view();
  if (b.connected && b.role === 'host' && b.code === getStageCode()) return;
  if (stagePromise) return stagePromise;
  stagePromise = enableBuzzers().finally(() => { stagePromise = null; });
  return stagePromise;
}

export type { Prompt };
