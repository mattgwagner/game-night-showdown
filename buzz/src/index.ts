import { DurableObject } from "cloudflare:workers";

export interface Env {
  ROOM: DurableObjectNamespace<BuzzRoom>;
}

type Role = "host" | "player";

type Attachment = {
  role: Role;
  name: string;
  id: string;
  teamId: number | null;
  teamName: string;
};

type BuzzEntry = { id: string; name: string; teamId: number | null; teamName: string; at: number };
type TeamInfo = { id: number; name: string; color?: string };

type ClientMsg =
  | { type: "hello"; role: Role; name?: string; teamId?: number | null; teamName?: string }
  | { type: "setTeams"; teams: TeamInfo[] }
  | { type: "arm" }
  | { type: "disarm" }
  | { type: "buzz" }
  | { type: "pop" }
  | { type: "clear" };

type ServerMsg =
  | {
      type: "welcome";
      id: string;
      code: string;
      armed: boolean;
      queue: BuzzEntry[];
      players: { id: string; name: string; teamName: string }[];
      teams: TeamInfo[];
    }
  | {
      type: "state";
      armed: boolean;
      queue: BuzzEntry[];
      players: { id: string; name: string; teamName: string }[];
      teams: TeamInfo[];
    }
  | { type: "error"; message: string };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function codeOk(code: string) {
  return /^[A-Z0-9]{4}$/.test(code);
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
      return Response.json({ code, joinPath: `?join=${code}`, wsPath: `/ws?room=${code}` }, { headers: CORS });
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
  teams: TeamInfo[] = [];
  code = "";

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
    this.ctx.blockConcurrencyWhile(async () => {
      this.armed = (await this.ctx.storage.get<boolean>("armed")) || false;
      this.queue = (await this.ctx.storage.get<BuzzEntry[]>("queue")) || [];
      this.teams = (await this.ctx.storage.get<TeamInfo[]>("teams")) || [];
      this.code = (await this.ctx.storage.get<string>("code")) || "";
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (!this.code) {
      this.code = (url.searchParams.get("room") || "").toUpperCase();
      await this.ctx.storage.put("code", this.code);
    }

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

    if (msg.type === "hello") {
      att.role = msg.role === "host" ? "host" : "player";
      att.name = (msg.name || (att.role === "host" ? "Host" : "Player")).trim().slice(0, 24) || "Player";
      if (msg.teamId != null) att.teamId = msg.teamId;
      if (msg.teamName) att.teamName = String(msg.teamName).slice(0, 24);
      ws.serializeAttachment(att);
      this.send(ws, {
        type: "welcome",
        id: att.id,
        code: this.code,
        armed: this.armed,
        queue: this.queue,
        players: this.playerList(),
        teams: this.teams,
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
      this.queue.push({
        id: att.id,
        name: att.name,
        teamId: att.teamId,
        teamName: att.teamName || "",
        at: Date.now(),
      });
      await this.persist();
      this.broadcastState();
      return;
    }

    if (att.role !== "host") {
      this.send(ws, { type: "error", message: "host only" });
      return;
    }

    if (msg.type === "setTeams") {
      this.teams = Array.isArray(msg.teams) ? msg.teams.slice(0, 12) : [];
      await this.persist();
      this.broadcastState();
      return;
    }

    if (msg.type === "arm") {
      this.armed = true;
      this.queue = [];
      await this.persist();
      this.broadcastState();
      return;
    }

    if (msg.type === "disarm") {
      this.armed = false;
      await this.persist();
      this.broadcastState();
      return;
    }

    if (msg.type === "pop") {
      this.queue.shift();
      await this.persist();
      this.broadcastState();
      return;
    }

    if (msg.type === "clear") {
      this.queue = [];
      await this.persist();
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

  private playerList() {
    const out: { id: string; name: string; teamName: string }[] = [];
    for (const sock of this.ctx.getWebSockets()) {
      const a = sock.deserializeAttachment() as Attachment | null;
      if (a && a.role === "player") out.push({ id: a.id, name: a.name, teamName: a.teamName || "" });
    }
    return out;
  }

  private async persist() {
    await this.ctx.storage.put({ armed: this.armed, queue: this.queue, teams: this.teams });
  }

  private send(ws: WebSocket, msg: ServerMsg) {
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      /* ignore */
    }
  }

  private broadcastState() {
    const payload: ServerMsg = {
      type: "state",
      armed: this.armed,
      queue: this.queue,
      players: this.playerList(),
      teams: this.teams,
    };
    const raw = JSON.stringify(payload);
    for (const sock of this.ctx.getWebSockets()) {
      try {
        sock.send(raw);
      } catch {
        /* ignore */
      }
    }
  }
}
