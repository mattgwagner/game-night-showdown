import { DurableObject } from "cloudflare:workers";

export interface Env {
  ROOM: DurableObjectNamespace<BuzzRoom>;
}

type Role = "host" | "player" | "controller";

type Attachment = {
  role: Role;
  name: string;
  id: string;
  teamId: number | null;
  teamName: string;
};

type BuzzEntry = { id: string; name: string; teamId: number | null; teamName: string; at: number };
type Lockout = { id: string; name: string; teamId: number | null };
type TeamInfo = { id: number; name: string; color?: string };

type Prompt = {
  cat: string;
  val: number;
  q: string;
  a: string;
  hint?: string;
  revealed: boolean;
};

type ClientMsg =
  | { type: "hello"; role: Role; name?: string; teamId?: number | null; teamName?: string }
  | { type: "setTeams"; teams: TeamInfo[] }
  | { type: "arm" }
  | { type: "disarm" }
  | { type: "buzz" }
  | { type: "pop" }
  | { type: "clear" }
  | { type: "prompt"; cat: string; val: number; q: string; a: string; hint?: string }
  | { type: "revealAnswer" }
  | { type: "clearPrompt" }
  | { type: "remoteAward"; teamId: number }
  | { type: "remoteNobody" };

type ServerMsg =
  | {
      type: "welcome";
      id: string;
      code: string;
      armed: boolean;
      queue: BuzzEntry[];
      missed: string[];
      answerLeft: number | null;
      answerTotal: number;
      players: { id: string; name: string; teamName: string }[];
      teams: TeamInfo[];
      prompt: Prompt | null;
    }
  | {
      type: "state";
      armed: boolean;
      queue: BuzzEntry[];
      missed: string[];
      answerLeft: number | null;
      answerTotal: number;
      players: { id: string; name: string; teamName: string }[];
      teams: TeamInfo[];
      prompt: Prompt | null;
    }
  | { type: "remoteAward"; teamId: number; val: number; cat: string }
  | { type: "remoteNobody"; cat: string; val: number }
  | { type: "error"; message: string };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function codeOk(code: string) {
  return /^[A-Z0-9]{4}$/.test(code);
}

// The answer clock: a clue gets 15s, and whoever is answering gets at least 8.
const CLUE_SECONDS = 15;
const BUZZ_SECONDS = 8;

// A room with no activity for this long deletes its storage.
const IDLE_MS = 24 * 60 * 60 * 1000;

function isStaff(role: Role) {
  return role === "host" || role === "controller";
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({ ok: true }, { headers: CORS });
    }

    if (url.pathname === "/room" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as { code?: string };
      let code = (body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
      if (!codeOk(code)) {
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        code = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
      }
      return Response.json(
        {
          code,
          joinPath: `?join=${code}`,
          hostPath: `?host=${code}`,
          wsPath: `/ws?room=${code}`,
        },
        { headers: CORS },
      );
    }

    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 426, headers: CORS });
      }
      const room = (url.searchParams.get("room") || "").toUpperCase();
      if (!codeOk(room)) return new Response("Bad room code", { status: 400, headers: CORS });
      return env.ROOM.getByName(room).fetch(request);
    }

    return new Response("game-night-buzz", { headers: CORS });
  },
} satisfies ExportedHandler<Env>;

export class BuzzRoom extends DurableObject<Env> {
  armed = false;
  queue: BuzzEntry[] = [];
  // Players ruled wrong on the current clue. They cannot buzz again until the next one.
  missed: Lockout[] = [];
  teams: TeamInfo[] = [];
  prompt: Prompt | null = null;
  // When the current clue's answer clock runs out (server time). The TV closes the clue.
  answerBy: number | null = null;
  answerTotal = CLUE_SECONDS;
  code = "";

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
    this.ctx.blockConcurrencyWhile(async () => {
      this.armed = (await this.ctx.storage.get<boolean>("armed")) || false;
      this.queue = (await this.ctx.storage.get<BuzzEntry[]>("queue")) || [];
      this.missed = (await this.ctx.storage.get<Lockout[]>("missed")) || [];
      this.teams = (await this.ctx.storage.get<TeamInfo[]>("teams")) || [];
      this.prompt = (await this.ctx.storage.get<Prompt | null>("prompt")) || null;
      this.answerBy = (await this.ctx.storage.get<number | null>("answerBy")) ?? null;
      this.answerTotal = (await this.ctx.storage.get<number>("answerTotal")) || CLUE_SECONDS;
      this.code = (await this.ctx.storage.get<string>("code")) || "";
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (!this.code) {
      this.code = (url.searchParams.get("room") || "").toUpperCase();
      await this.ctx.storage.put("code", this.code);
    }
    await this.touch();

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({
      role: "player",
      name: "Player",
      id: crypto.randomUUID().slice(0, 8),
      teamId: null,
      teamName: "",
    } satisfies Attachment);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message !== "string") return;
    let msg: ClientMsg;
    try {
      msg = JSON.parse(message) as ClientMsg;
    } catch {
      this.send(ws, { type: "error", message: "bad json" });
      return;
    }

    const att = (ws.deserializeAttachment() || {}) as Attachment;
    await this.touch();

    if (msg.type === "hello") {
      const role: Role =
        msg.role === "host" ? "host" : msg.role === "controller" ? "controller" : "player";
      att.role = role;
      att.name =
        (msg.name || (role === "host" ? "Stage" : role === "controller" ? "Host" : "Player"))
          .trim()
          .slice(0, 24) || "Player";
      if (msg.teamId != null) att.teamId = msg.teamId;
      if (msg.teamName) att.teamName = String(msg.teamName).slice(0, 24);
      ws.serializeAttachment(att);
      // A dropped phone reconnects with a new socket id. Keep the lockout on the person.
      if (role === "player" && this.isLocked(att) && !this.missed.some((m) => m.id === att.id)) {
        this.missed.push({ id: att.id, name: att.name, teamId: att.teamId });
        await this.persist();
      }
      this.send(ws, {
        type: "welcome",
        id: att.id,
        code: this.code,
        armed: this.armed,
        queue: this.queue,
        missed: this.missedIds(),
        ...this.clock(),
        players: this.playerList(),
        teams: this.teams,
        prompt: this.promptFor(att.role),
      });
      this.broadcastState();
      return;
    }

    if (msg.type === "buzz") {
      if (!this.armed) {
        this.send(ws, { type: "error", message: "not armed" });
        return;
      }
      if (att.role !== "player") return;
      if (this.queue.some((q) => q.id === att.id)) return;
      if (this.isLocked(att)) {
        this.send(ws, { type: "error", message: "already tried this one" });
        return;
      }
      this.queue.push({
        id: att.id,
        name: att.name,
        teamId: att.teamId,
        teamName: att.teamName || "",
        at: Date.now(),
      });
      if (this.queue.length === 1) this.ensureAnswerWindow(BUZZ_SECONDS);
      await this.persist();
      this.broadcastState();
      return;
    }

    if (!isStaff(att.role)) {
      this.send(ws, { type: "error", message: "host only" });
      return;
    }

    // Stage-only: arm / disarm / setTeams / prompt / clearPrompt
    if (msg.type === "setTeams" && att.role === "host") {
      this.teams = Array.isArray(msg.teams) ? msg.teams.slice(0, 12) : [];
      await this.persist();
      this.broadcastState();
      return;
    }

    if (msg.type === "arm" && att.role === "host") {
      this.armed = true;
      this.queue = [];
      this.missed = [];
      this.answerBy = null;
      await this.persist();
      this.broadcastState();
      return;
    }

    if (msg.type === "disarm" && att.role === "host") {
      this.armed = false;
      this.answerBy = null;
      await this.persist();
      this.broadcastState();
      return;
    }

    if (msg.type === "prompt" && att.role === "host") {
      this.prompt = {
        cat: String(msg.cat || "").slice(0, 80),
        val: Number(msg.val) || 0,
        q: String(msg.q || "").slice(0, 500),
        a: String(msg.a || "").slice(0, 500),
        hint: msg.hint ? String(msg.hint).slice(0, 200) : undefined,
        revealed: false,
      };
      this.answerBy = Date.now() + CLUE_SECONDS * 1000;
      this.answerTotal = CLUE_SECONDS;
      await this.persist();
      this.broadcastState();
      return;
    }

    if (msg.type === "clearPrompt" && att.role === "host") {
      this.prompt = null;
      this.missed = [];
      this.answerBy = null;
      await this.persist();
      this.broadcastState();
      return;
    }

    // Staff (stage or controller)
    if (msg.type === "pop") {
      const wrong = this.queue.shift();
      if (wrong && !this.isLocked(wrong)) {
        this.missed.push({ id: wrong.id, name: wrong.name, teamId: wrong.teamId });
      }
      if (this.queue.length) this.ensureAnswerWindow(BUZZ_SECONDS);
      await this.persist();
      this.broadcastState();
      return;
    }

    if (msg.type === "clear") {
      this.queue = [];
      await this.persist();
      this.broadcastState();
      return;
    }

    if (msg.type === "revealAnswer") {
      if (this.prompt) {
        this.prompt = { ...this.prompt, revealed: true };
        this.answerBy = null;
        await this.persist();
        this.broadcastState();
      }
      return;
    }

    if (msg.type === "remoteAward") {
      if (!this.prompt) return;
      const cat = this.prompt.cat;
      const val = this.prompt.val;
      const teamId = Number(msg.teamId);
      this.armed = false;
      this.queue = [];
      this.missed = [];
      this.prompt = null;
      this.answerBy = null;
      await this.persist();
      this.broadcastAll({ type: "remoteAward", teamId, val, cat });
      this.broadcastState();
      return;
    }

    if (msg.type === "remoteNobody") {
      if (!this.prompt) return;
      const cat = this.prompt.cat;
      const val = this.prompt.val;
      this.armed = false;
      this.queue = [];
      this.missed = [];
      this.prompt = null;
      this.answerBy = null;
      await this.persist();
      this.broadcastAll({ type: "remoteNobody", cat, val });
      this.broadcastState();
    }
  }

  async webSocketClose(ws: WebSocket) {
    try {
      ws.close();
    } catch {
      /* ignore */
    }
    this.broadcastState();
  }

  async webSocketError(ws: WebSocket) {
    try {
      ws.close(1011, "error");
    } catch {
      /* ignore */
    }
  }

  /** A buzz-in gets at least `seconds` to answer, without shortening a longer clock. */
  private ensureAnswerWindow(seconds: number) {
    if (!this.prompt || this.prompt.revealed) return;
    const next = Date.now() + seconds * 1000;
    if (!this.answerBy || this.answerBy < next) {
      this.answerBy = next;
      this.answerTotal = seconds;
    }
  }

  /** Time left rather than a timestamp, so a phone whose clock is off still counts right. */
  private clock() {
    return {
      answerLeft: this.answerBy === null ? null : Math.max(0, this.answerBy - Date.now()),
      answerTotal: this.answerTotal,
    };
  }

  private missedIds() {
    return this.missed.map((m) => m.id);
  }

  private isLocked(who: { id: string; name: string; teamId: number | null }) {
    const name = (who.name || "").trim().toLowerCase();
    return this.missed.some((m) => {
      if (m.id === who.id) return true;
      const lockedName = (m.name || "").trim().toLowerCase();
      return !!name && name === lockedName && m.teamId === who.teamId;
    });
  }

  /** Controllers get the answer; stage/players get it blank until revealed. */
  private promptFor(role: Role): Prompt | null {
    if (!this.prompt) return null;
    if (role === "controller") return this.prompt;
    if (this.prompt.revealed) return this.prompt;
    return { ...this.prompt, a: "" };
  }

  private playerList() {
    const out: { id: string; name: string; teamName: string }[] = [];
    for (const sock of this.ctx.getWebSockets()) {
      const a = sock.deserializeAttachment() as Attachment | null;
      if (a && a.role === "player") out.push({ id: a.id, name: a.name, teamName: a.teamName || "" });
    }
    return out;
  }

  /** Push the idle cleanup back a day from now. */
  private async touch() {
    await this.ctx.storage.setAlarm(Date.now() + IDLE_MS);
  }

  /** Idle a day: drop the room. A phone still connected keeps it alive. */
  async alarm() {
    if (this.ctx.getWebSockets().length > 0) {
      await this.touch();
      return;
    }
    await this.ctx.storage.deleteAll();
    this.armed = false;
    this.queue = [];
    this.missed = [];
    this.teams = [];
    this.prompt = null;
    this.answerBy = null;
    this.code = "";
  }

  private async persist() {
    await this.ctx.storage.put({
      armed: this.armed,
      queue: this.queue,
      missed: this.missed,
      teams: this.teams,
      prompt: this.prompt,
      answerBy: this.answerBy,
      answerTotal: this.answerTotal,
    });
  }

  private send(ws: WebSocket, msg: ServerMsg) {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      /* ignore */
    }
  }

  private broadcastAll(msg: ServerMsg) {
    const raw = JSON.stringify(msg);
    for (const sock of this.ctx.getWebSockets()) {
      try {
        sock.send(raw);
      } catch {
        /* ignore */
      }
    }
  }

  private broadcastState() {
    for (const sock of this.ctx.getWebSockets()) {
      const a = sock.deserializeAttachment() as Attachment | null;
      const role = (a && a.role) || "player";
      const payload: ServerMsg = {
        type: "state",
        armed: this.armed,
        queue: this.queue,
        missed: this.missedIds(),
        ...this.clock(),
        players: this.playerList(),
        teams: this.teams,
        prompt: this.promptFor(role),
      };
      this.send(sock, payload);
    }
  }
}
