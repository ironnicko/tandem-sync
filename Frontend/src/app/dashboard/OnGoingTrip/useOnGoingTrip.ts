import { RIDE } from "@/lib/graphql/query";
import { UPDATE_RIDE } from "@/lib/graphql/mutation";
import { DashboardState, RideState } from "@/stores/types";
import { useAuth } from "@/stores/useAuth";
import { useSocket } from "@/stores/useSocket";
import { useOtherUsers } from "@/stores/useOtherUsers";
import { useQuery, useMutation } from "@apollo/client/react";
import useAnnouncer from "@/hooks/useAnnouncer";
import { useCallback, useEffect } from "react";

export function useOnGoingTrip(
  updateDashboard: (updates: Partial<DashboardState>) => void,
  userLocation: DashboardState["userLocation"],
) {
  const { user, setUser } = useAuth();
  const {
    joinRide,
    leaveRide,
    disconnect,
    sendSignal,
    connect,
    inRoom,
    sendLocation,
    onAnnounce,
    onRideEnded,
  } = useSocket();
  const [updateRide] = useMutation<{ updateRide: RideState }>(UPDATE_RIDE);
  const { data, loading, error } = useQuery<{ ride: RideState }>(RIDE, {
    variables: { rideCode: user.currentRide },
    fetchPolicy: "cache-and-network",
  });
  const { announcements, addAnnouncement, removeAnnouncement } = useAnnouncer();

  useEffect(() => {
    onAnnounce((name: string, info: "join" | "info" | "success") => {
      addAnnouncement(name, info);
    });
  }, [onAnnounce, addAnnouncement]);

  useEffect(() => {
    if (!data?.ride?.rideCode) return;
    const rideCode = data.ride.rideCode;
    onRideEnded(async () => {
      setUser({ ...user!, currentRide: null });
      await updateRide({ variables: { rideCode, requestType: "remove" } });
      leaveRide({ rideCode });
      disconnect();
    });
    return () => {
      onRideEnded(null);
    };
  }, [data?.ride?.rideCode]);

  useEffect(() => {
    if (!data?.ride?.rideCode) return;

    const { destination, start, endedAt } = data.ride;
    updateDashboard({ fromLocation: start, toLocation: destination });

    if (endedAt) {
      setUser({ ...user, currentRide: null });
      updateDashboard({ fromLocation: null, toLocation: null });
    }
  }, [data?.ride?.rideCode, data?.ride?.endedAt]);

  useEffect(() => {
    if (data?.ride?.rideCode && !inRoom) {
      connect();
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
