import ReconnectingWebSocket from "reconnecting-websocket";
import type { CloseEvent, ErrorEvent } from "reconnecting-websocket/dist/events";
import api from "./axios";

export type WSStatus = "connecting" | "open" | "closed" | "dormant";

export interface WebSocketManagerOptions {
  /** How long with no activity before the connection is considered dormant and closed. Default: 30s */
  dormancyTimeout?: number;
  /** How often to check for dormancy. Default: 5s */
  dormancyCheckInterval?: number;
  /** Max messages to queue while disconnected. Default: 50 */
  maxQueueSize?: number;
  /** Called whenever the connection status changes */
  onStatusChange?: (status: WSStatus) => void;
}

export class WebSocketManager {
  private rws: ReconnectingWebSocket | null = null;
  private readonly url: string;
  private readonly token: string;
  private readonly onMessage: (msg: unknown) => void;

  private readonly dormancyTimeout: number;
  private readonly dormancyCheckMs: number;
  private readonly maxQueueSize: number;
  private readonly onStatusChange?: (status: WSStatus) => void;

  private dormancyCheckInterval: ReturnType<typeof setInterval> | null = null;
  private lastActivityTime = 0;
  private messageQueue: unknown[] = [];
  private intentionalClose = false;

  constructor(
    url: string,
    token: string,
    onMessage: (msg: unknown) => void,
    options: WebSocketManagerOptions = {},
  ) {
    this.url = url;
    this.token = token;
    this.onMessage = onMessage;
    this.dormancyTimeout = options.dormancyTimeout ?? 30_000;
    this.dormancyCheckMs = options.dormancyCheckInterval ?? 5_000;
    this.maxQueueSize = options.maxQueueSize ?? 50;
    this.onStatusChange = options.onStatusChange;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  connect() {
    if (this.rws) return; // Already managing a connection

    this.intentionalClose = false;

    this.rws = new ReconnectingWebSocket(
      () => `${this.url}?token=${encodeURIComponent(this.token)}`,
      [],
      {
        minReconnectionDelay: 1_000,
        maxReconnectionDelay: 30_000,
        reconnectionDelayGrowFactor: 1.5,
        connectionTimeout: 10_000,
        maxRetries: Infinity,
        debug: process.env.NODE_ENV === "development",
      },
    );

    this.rws.addEventListener("open", this.handleOpen);
    this.rws.addEventListener("message", this.handleMessage);
    this.rws.addEventListener("close", this.handleClose);
  }

  send(data: unknown) {
    if (this.rws?.readyState === WebSocket.OPEN) {
      this.lastActivityTime = Date.now();
      this.rws.send(JSON.stringify(data));
      return;
    }

    // Drop location pings silently — they're time-sensitive and stale when replayed
    const event = data as Record<string, unknown>;
    if (event.eventType === "sendLocation") return;

    if (this.messageQueue.length >= this.maxQueueSize) {
      console.warn("[WS] Queue full, dropping oldest message");
      this.messageQueue.shift();
    }
    this.messageQueue.push(data);
  }

  disconnect() {
    this.intentionalClose = true;
    this.cleanup();
    this.onStatusChange?.("closed");
  }

  get status(): WSStatus {
    if (!this.rws) return "closed";
    switch (this.rws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "open";
      default:
        return "closed";
    }
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  private handleOpen = () => {
    console.log("[WS] Connected");
    this.lastActivityTime = Date.now();
    this.onStatusChange?.("open");
    this.startDormancyCheck();
    this.flushQueue();
  };

  private handleMessage = (e: MessageEvent) => {
    this.lastActivityTime = Date.now();
    try {
      this.onMessage(JSON.parse(e.data as string));
    } catch {
      console.error("[WS] Failed to parse message", e.data);
    }
  };

  // RWS ships its own CloseEvent (not the DOM global) — must match exactly
  private handleClose = (_e: CloseEvent) => {
    this.stopDormancyCheck();
    if (this.intentionalClose) {
      console.log("[WS] Disconnected (intentional)");
    } else {
      console.log("[WS] Disconnected — ReconnectingWebSocket will retry");
      this.onStatusChange?.("connecting");
    }
  };


  // ─── Dormancy ──────────────────────────────────────────────────────────────

  private startDormancyCheck() {
    this.stopDormancyCheck();
    this.dormancyCheckInterval = setInterval(() => {
      const idle = Date.now() - this.lastActivityTime;
      if (idle > this.dormancyTimeout) {
        console.log(`[WS] Dormant for ${idle}ms, closing`);
        this.onStatusChange?.("dormant");
        this.cleanup();
      }
    }, this.dormancyCheckMs);
  }

  private stopDormancyCheck() {
    if (this.dormancyCheckInterval) {
      clearInterval(this.dormancyCheckInterval);
      this.dormancyCheckInterval = null;
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private flushQueue() {
    const queued = [...this.messageQueue];
    this.messageQueue = [];
    for (const msg of queued) {
      console.log("[WS] Flushing queued message", msg);
      this.rws?.send(JSON.stringify(msg));
    }
  }

  private cleanup() {
    this.stopDormancyCheck();
    if (this.rws) {
      this.rws.removeEventListener("open", this.handleOpen);
      this.rws.removeEventListener("message", this.handleMessage);
      this.rws.removeEventListener("close", this.handleClose);
      this.rws.close();
      this.rws = null;
    }
  }
}