import { RIDE } from "@/lib/graphql/query";
import { RideState } from "@/stores/types";
import { useAuth } from "@/stores/useAuth";
import { useSocket } from "@/stores/useSocket";
import { useOtherUsers } from "@/stores/useOtherUsers";
import { useQuery } from "@apollo/client/react";
import { useAnnouncerStore } from "@/stores/useAnnoucer";
import { useEffect } from "react";
import { useDashboard } from "@/stores/useDashboard";

export function useOnGoingTrip() {
  const { user } = useAuth();
  const { userLocation, updateDashboard } = useDashboard();
  const { joinRide, leaveRide, sendSignal, inRoom, onRideEnded } =
    useSocket();
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

  const handleSendSignal = (type: string) => {
    try {
      if (data?.ride) {
        sendSignal({
          rideCode: data.ride.rideCode,
          location: userLocation,
          signalType: type,
        });
        addAnnouncement(type, type as any, user.id!);
      }
    } catch (err) {
      console.error("Signal send error:", err);
    }
  };

  const { users } = useOtherUsers();

  return {
    ride: data?.ride,
    loading,
    error,
    announcements,
    removeAnnouncement,
    handleSendSignal,
    otherUsers: users,
  };
}
