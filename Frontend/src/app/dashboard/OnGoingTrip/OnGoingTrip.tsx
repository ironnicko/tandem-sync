import { Profile } from "@/components/Profile";
import Timer from "@/components/Timer";
import { RIDE } from "@/lib/graphql/query";
import { DashboardState, RideState } from "@/stores/types";
import { useAuth } from "@/stores/useAuth";
import { useSocket } from "@/stores/useSocket";
import { useQuery } from "@apollo/client/react";
import {
  Fuel,
  Square,
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
  PlusCircle,
} from "lucide-react";
import Announcer from "@/components/Announcer";
import useAnnouncer from "@/hooks/useAnnouncer";
import { useCallback, useEffect } from "react";

interface OnGoingTripProps {
  updateDashboard: (updates: Partial<DashboardState>) => void;
  dashboardState: DashboardState;
}

export const OnGoingTrip = ({
  updateDashboard,
  dashboardState,
}: OnGoingTripProps) => {
  const { user, setUser } = useAuth();
  const {
    joinRide,
    sendSignal,
    connect,
    inRoom,
    sendLocation,
    onAnnounce,
  } = useSocket();
  const { data, loading, error } = useQuery<{ ride: RideState }>(RIDE, {
    variables: { rideCode: user.currentRide },
    fetchPolicy: "cache-and-network",
  });
  const { announcements, addAnnouncement, removeAnnouncement } = useAnnouncer();
  const { userLocation } = dashboardState;

  useEffect(() => {
    onAnnounce((name: string, info: "join" | "info" | "success") => {
      addAnnouncement(`${name}`, info);
    });
  }, [onAnnounce, addAnnouncement]);

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
      joinRide({ rideCode: data?.ride?.rideCode });
    }
  }, [data?.ride?.rideCode, inRoom]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        updateDashboard({ userLocation: location });
        console.log("📍 Location updated:", location);
      },
      (err) => console.error("❌ Geolocation error:", err),
      { enableHighAccuracy: true },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      console.log("🧹 Geolocation watcher cleared");
    };
  }, []);

  const sendLocationSocketEvent = useCallback(() => {
    if (userLocation && data?.ride?.rideCode) {
      sendLocation({ rideCode: data?.ride?.rideCode, location: userLocation });
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

  if (loading) return <p className="p-4">Loading Current Trip...</p>;
  if (error)
    return (
      <p className="p-4 text-red-600">
        Error loading Current Trip: {error.message}
      </p>
    );

  return (
    <>
      <Announcer
        announcements={announcements}
        removeAnnouncement={removeAnnouncement}
      />
      <Profile className="absolute top-4 left-[12vw] flex flex-col items-center" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <Timer ride={data.ride}></Timer>
        <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-80">
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {/* Left Arrow */}
            <button
              className="flex flex-col items-center text-green-600 hover:text-green-800"
              onClick={() => handleSendSignal("Left")}
            >
              <ArrowLeft className="w-7 h-7" />
              <span className="text-xs mt-1">Left</span>
            </button>

            {/* U-Turn */}
            <button
              className="flex flex-col items-center text-purple-600 hover:text-purple-800"
              onClick={() => handleSendSignal("U-Turn")}
            >
              <RefreshCcw className="w-7 h-7" />
              <span className="text-xs mt-1">U-Turn</span>
            </button>

            {/* Right Arrow */}
            <button
              className="flex flex-col items-center text-red-600 hover:text-red-800"
              onClick={() => handleSendSignal("Right")}
            >
              <ArrowRight className="w-7 h-7" />
              <span className="text-xs mt-1">Right</span>
            </button>

            {/* Refuel */}
            <button
              className="flex flex-col items-center text-blue-600 hover:text-blue-800"
              onClick={() => handleSendSignal("Refuel")}
            >
              <Fuel className="w-7 h-7" />
              <span className="text-xs mt-1">Refuel</span>
            </button>

            {/* Stop */}
            <button
              className="flex flex-col items-center text-gray-600 hover:text-black"
              onClick={() => handleSendSignal("Stop")}
            >
              <Square className="w-7 h-7" />
              <span className="text-xs mt-1">Stop</span>
            </button>

            {/* Custom */}
            <button className="flex flex-col items-center text-yellow-600 hover:text-yellow-800">
              <PlusCircle className="w-7 h-7" />
              <span className="text-xs mt-1">Custom</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
