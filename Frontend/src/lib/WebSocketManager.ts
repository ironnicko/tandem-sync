import api from "./axios";

export class WebSocketManager {
    private ws: WebSocket | null = null;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private readonly url: string;
    private readonly token: string;
    private readonly onMessage: (msg: any) => void;
    private readonly reconnectDelay = 5000;
    private readonly dormancyTimeout = 30000; // 30 seconds
    private dormancyCheckInterval: NodeJS.Timeout | null = null;
    private lastActivityTime: number = 0;

    private messageQueue: any[] = [];

    constructor(url: string, token: string, onMessage: (msg: any) => void) {
        this.url = url;
        this.token = token;
        this.onMessage = onMessage;
    }

    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

        this.ws = new WebSocket(
            `${this.url}?token=${encodeURIComponent(this.token)}`,
        );

        this.ws.onopen = () => {
            console.log("[WS] Connected");
            this.lastActivityTime = Date.now();
            this.startDormancyCheck();

            // flush queued messages
            this.messageQueue.forEach((msg) =>
                this.ws?.send(JSON.stringify(msg)),
            );

            this.messageQueue = [];
        };

        this.ws.onmessage = (e) => {
            this.lastActivityTime = Date.now();
            this.onMessage(JSON.parse(e.data));
        };
        this.ws.onclose = () => {
            console.log("[WS] Disconnected, retrying...");
            this.reconnectTimeout = setTimeout(
                () => this.connect(),
                this.reconnectDelay,
            );
        };
        this.ws.onerror = (e) => {
            console.error("[WS] Error:", e);
            api.post("/authenticated");
        };
    }

    send(data: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.lastActivityTime = Date.now();
            this.ws.send(JSON.stringify(data));
        } else {
            if (data.eventType != "sendLocation") {
                console.log("[WS] queueing message", data);
                this.messageQueue.push(data);
            }
        }
    }

    private startDormancyCheck() {
        if (this.dormancyCheckInterval) clearInterval(this.dormancyCheckInterval);

        this.dormancyCheckInterval = setInterval(() => {
            const timeSinceLastActivity = Date.now() - this.lastActivityTime;
            if (timeSinceLastActivity > this.dormancyTimeout) {
                console.log("[WS] Connection dormant for 30s, closing");
                this.ws?.close();
            }
        }, 5000); // Check every 5 seconds
    }

    private stopDormancyCheck() {
        if (this.dormancyCheckInterval) {
            clearInterval(this.dormancyCheckInterval);
            this.dormancyCheckInterval = null;
        }
    }

    disconnect() {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.stopDormancyCheck();
        this.ws?.close();
        this.ws = null;
    }
}
