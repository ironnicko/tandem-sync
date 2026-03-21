import { create } from "zustand";
import { SocketState } from "./types";
import { useAuth } from "./useAuth";
import { useOtherUsers } from "./useOtherUsers";
import { useAnnouncerStore } from "./useAnnoucer";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useDashboard } from "./useDashboard";

export const useSocket = create<SocketState>((set) => {
  let rideEndedCb: any = null;

  const handleMessage = (msg: any) => {
    const otherUsers = useOtherUsers.getState();
    const announcer = useAnnouncerStore.getState();
    const userName = otherUsers.getUserById(msg.data.userId)?.name || "Someone";

    switch (msg.eventType) {
      case "updateLocations":
        otherUsers.setUsersLocation(msg.data.locations);
        break;

      case "sentSignal":
        announcer.addAnnouncement(
          `${userName} : ${msg.data.signalType}`,
          "info",
        );
        break;

      case "userJoined":
        otherUsers.fetchUsersByIds([msg.data.userId]).then(() => {
          const joinedName =
            useOtherUsers.getState().getUserById(msg.data.userId)?.name ||
            "Someone";
          announcer.addAnnouncement(`${joinedName} joined the ride`, "join");
        });
        break;

      case "userLeft":
        announcer.addAnnouncement(`${userName} left the ride`, "leave");
        otherUsers.setUserLocation(msg.data.userId, null);
        break;

      case "rideEnded":
        announcer.addAnnouncement(`${userName} ended the ride`, "info");
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
      const { user, setUser } = useAuth.getState();
      setUser({ ...user!, currentRide: null });
      useOtherUsers.getState().clearUsersLocations();
      useDashboard
        .getState()
        .updateDashboard({ fromLocation: null, toLocation: null });
    },

    endRide: (data) => {
      socket().send({ eventType: "endRide", data });
    },

    sendLocation: (data) => socket().send({ eventType: "sendLocation", data }),

    sendSignal: (data) => socket().send({ eventType: "sendSignal", data }),

    onRideEnded: (cb) => (rideEndedCb = cb),
  };
});
