import { WebSocketManager } from "./WebSocketManager";

let manager: WebSocketManager | null = null;

export function getSocket(token: string, onMessage: (msg: unknown) => void) {
  if (!manager) {
    manager = new WebSocketManager(
      process.env.NEXT_PUBLIC_SOCKET_URL!,
      token,
      onMessage,
    );

    manager.connect();
  }

  return manager;
}

export function disconnectSocket() {
  manager?.disconnect();
  manager = null;
}
