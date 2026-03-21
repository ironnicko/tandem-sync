import { useAuth } from "@/stores/useAuth";
import { useDashboard } from "@/stores/useDashboard";
import { useSocket } from "@/stores/useSocket";
import { useCallback, useEffect } from "react";

const SendLocation = () => {
  const { userLocation, updateDashboard } = useDashboard();
  const { user } = useAuth();
  const { sendLocation } = useSocket();

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
    if (userLocation && user?.currentRide!) {
      sendLocation({ rideCode: user?.currentRide, location: userLocation });
    }
  }, [userLocation, user.currentRide, sendLocation]);

  useEffect(() => {
    const intervalId = setInterval(sendLocationSocketEvent, 3000);
    return () => clearInterval(intervalId);
  }, [sendLocationSocketEvent]);

  return <></>;
};

export default SendLocation;
