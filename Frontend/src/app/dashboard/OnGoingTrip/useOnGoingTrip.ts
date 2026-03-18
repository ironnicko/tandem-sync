import { RIDE } from "@/lib/graphql/query";
import {
  DashboardState,
  RideState,
} from "@/stores/types";
import { useAuth } from "@/stores/useAuth";
import { useSocket } from "@/stores/useSocket";
import { useOtherUsers } from "@/stores/useOtherUsers";
import { useQuery } from "@apollo/client/react";
import { useAnnouncerStore } from "@/stores/useAnnoucer";
import { useCallback, useEffect } from "react";

export function useOnGoingTrip(
  updateDashboard: (updates: Partial<DashboardState>) => void,
  userLocation: DashboardState["userLocation"],
) {
  const { user } = useAuth();
  const {
    joinRide,
    leaveRide,
    sendSignal,
    inRoom,
    sendLocation,
    onRideEnded,
  } = useSocket();
  const { data, loading, error } = useQuery<{ ride: RideState }>(RIDE, {
    variables: { rideCode: user.currentRide },
    fetchPolicy: "cache-and-network",
  });
  const { announcements, addAnnouncement, removeAnnouncement } =
    useAnnouncerStore();

  useEffect(() => {
    if (!data?.ride?.rideCode) return;
    const rideCode = data.ride.rideCode;
    onRideEnded(() => {
      leaveRide({ rideCode });
      updateDashboard({ fromLocation: null, toLocation: null });
    });
    return () => {
      onRideEnded(null);
    };
  }, [data?.ride?.rideCode]);

  useEffect(() => {
    if (!data?.ride?.rideCode) return;

    const { destination, start } = data.ride;
    updateDashboard({ fromLocation: start, toLocation: destination });
  }, [data?.ride?.rideCode]);

  useEffect(() => {
    const reconnect = () => {
      useSocket.getState().connect();
    };

    window.addEventListener("focus", reconnect);
    return () => window.removeEventListener("focus", reconnect);
  }, []);

  useEffect(() => {
    if (data?.ride?.rideCode && !inRoom) {
      joinRide({ rideCode: data.ride.rideCode });
    }
  }, [data?.ride?.rideCode, inRoom]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        updateDashboard({
          userLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        });
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const sendLocationSocketEvent = useCallback(() => {
    if (userLocation && data?.ride?.rideCode) {
      sendLocation({ rideCode: data.ride.rideCode, location: userLocation });
    }
  }, [userLocation, data?.ride?.rideCode, sendLocation]);

  useEffect(() => {
    const intervalId = setInterval(sendLocationSocketEvent, 3000);
    return () => clearInterval(intervalId);
  }, [sendLocationSocketEvent]);

  const handleSendSignal = (type: string) => {
    try {
      if (data?.ride) {
        sendSignal({
          rideCode: data.ride.rideCode,
          location: userLocation,
          signalType: type,
        });
        addAnnouncement(type, "info");
      }
    } catch (err) {
      console.error("Signal send error:", err);
    }
  };

  return {
    ride: data?.ride,
    loading,
    error,
    announcements,
    removeAnnouncement,
    handleSendSignal,
    otherUsers: useOtherUsers.getState().users,
  };
}
