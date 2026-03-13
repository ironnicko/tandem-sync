import { create } from "zustand";
import { SocketState } from "./types";
import { useAuth } from "./useAuth";
import { useOtherUsers } from "./useOtherUsers";

import { WebSocketManager } from "@/lib/WebSocketManager";

export const useSocket = create<SocketState>((set, get) => {

  let manager: WebSocketManager | null = null;
  let announceCb:
    | ((msg: string, type: "info" | "join" | "success") => void)
    | null = null;
  let rideEndedCb: (() => void) | null = null;

  const handleMessage = (msg: any) => {
    const otherUsers = useOtherUsers.getState();
    const userName = otherUsers.getUserById(msg.data.userId)?.name || "Someone";

    switch (msg.eventType) {
      case "updateLocations":
        otherUsers.setUsersLocation(msg.data.locations);
        break;
      case "sentSignal":
        announceCb?.(`${userName} : ${msg.data.signalType}`, "info");
        break;
      case "userJoined":
        otherUsers.fetchUsersByIds([msg.data.userId]).then(() => {
          announceCb?.(`${userName} joined the ride`, "join");
        });
        break;
      case "userLeft":
        announceCb?.(`${userName} left the ride`, "info");
        otherUsers.setUserLocation(msg.data.userId, null);
        break;
      case "rideEnded":
        announceCb?.(`${userName} ended the ride`, "info");
        rideEndedCb?.();
        break;
    }
  };

  return {
    isConnected: false,
    inRoom: false,
    error: null,

    connect: () => {
      const token = useAuth.getState().accessToken;
      manager = new WebSocketManager(
        process.env.NEXT_PUBLIC_SOCKET_URL!,
        token,
        handleMessage,
      );
      manager.connect();
      set({ isConnected: true });
    },

    disconnect: () => {
      manager?.disconnect();
      manager = null;
      set({ isConnected: false, inRoom: false });
    },

    joinRide: (data) => {
      manager?.send({ eventType: "joinRide", data });
      set({ inRoom: true });
    },

    endRide: (data) => {
      manager?.send({ eventType: "endRide", data });
      set({ inRoom: false });
    },

    leaveRide: (data) => {
      manager?.send({ eventType: "leaveRide", data });
      set({ inRoom: false });
    },

    sendLocation: (data) => manager?.send({ eventType: "sendLocation", data }),
    sendSignal: (data) => manager?.send({ eventType: "sendSignal", data }),

    onAnnounce: (cb) => (announceCb = cb),
    onRideEnded: (cb) => (rideEndedCb = cb),
  };
});
