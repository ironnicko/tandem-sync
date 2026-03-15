import { create } from "zustand";
import { SocketState } from "./types";
import { useAuth } from "./useAuth";
import { useOtherUsers } from "./useOtherUsers";
import { getSocket, disconnectSocket } from "@/lib/socket";

export const useSocket = create<SocketState>((set) => {
  let announceCb: any = null;
  let rideEndedCb: any = null;

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
          const joinedName =
            useOtherUsers.getState().getUserById(msg.data.userId)?.name ||
            "Someone";
          announceCb?.(`${joinedName} joined the ride`, "join");
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

  const socket = () =>
    getSocket(useAuth.getState().accessToken!, handleMessage);

  return {
    isConnected: false,
    inRoom: false,
    error: null,

    connect: () => {
      socket();
      set({ isConnected: true });
    },

    disconnect: () => {
      disconnectSocket();
      set({ isConnected: false, inRoom: false });
    },

    joinRide: (data) => {
      socket().send({ eventType: "joinRide", data });
      set({ inRoom: true });
    },

    leaveRide: (data) => {
      socket().send({ eventType: "leaveRide", data });
      set({ inRoom: false });
    },

    endRide: (data) => {
      socket().send({ eventType: "endRide", data });
      set({ inRoom: false });
    },

    sendLocation: (data) => socket().send({ eventType: "sendLocation", data }),

    sendSignal: (data) => socket().send({ eventType: "sendSignal", data }),

    onAnnounce: (cb) => (announceCb = cb),
    onRideEnded: (cb) => (rideEndedCb = cb),
  };
});
