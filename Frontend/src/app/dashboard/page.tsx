"use client";
import { useEffect } from "react";
import { AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { FitBoundsHandler } from "@/components/FitBoundsHelper";
import { RouteData, UserState } from "@/stores/types";
import BottomSection from "./CreateTrip/BottomSection";
import { useAuth } from "@/stores/useAuth";
import { OnGoingTrip } from "./OnGoingTrip/OnGoingTrip";
import { CircleDot, Loader } from "lucide-react";
import { useOtherUsers } from "@/stores/useOtherUsers";
import { useDashboard } from "@/stores/useDashboard";
import PushNotificationManager from "@/components/PushNotificationManager";
import { gqlClient } from "@/lib/graphql/client";
import { distanceMeters } from "@/lib/utils";
import { ME } from "@/lib/graphql/query";
import { getDeviceId } from "@/lib/utils";
import RoutePolyline from "@/components/RoutePolyline";
import polyline from "@mapbox/polyline";
import api from "@/lib/axios";

function hashStringToHsl(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { users: otherUsers } = useOtherUsers();

  const {
    toLocation,
    fromLocation,
    fitTrigger,
    userLocation,
    routeData,
    updateDashboard,
  } = useDashboard();

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    let lastLocation: { lat: number; lng: number } | null = null;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        if (lastLocation) {
          const dist = distanceMeters(lastLocation, next);

          // Ignore tiny GPS jitter (<8m)
          if (dist < 10) return;
        }

        lastLocation = next;

        updateDashboard({
          userLocation: next,
        });
      },
      (err) => console.error("Geolocation error:", err),
      {
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const { user, setUser } = useAuth.getState();
    const getData = async () => {
      const { data: gqlData } = await gqlClient.query<{ me: UserState }>({
        query: ME,
        variables: { deviceId: getDeviceId() },
        fetchPolicy: "network-only",
      });
      setUser({ ...user, ...gqlData.me });
    };
    getData();
  }, []);

  useEffect(() => {
    if (!userLocation || !toLocation) {
      updateDashboard({
        routeData: null,
      });
      return;
    }

    const fetchRoute = async () => {
      try {
        const res = await api.post<RouteData>("/route", {
          origin: userLocation,
          destination: toLocation,
        });

        const data = res.data;

        if (!data.polyline) return;

        const decoded = polyline.decode(data.polyline);

        const path = decoded.map(([lat, lng]) => ({ lat, lng }));
        data.polyline = path;
        updateDashboard({
          routeData: data,
        });
      } catch (err) {
        console.error("Route fetch failed:", err);
      }
    };

    fetchRoute();
  }, [userLocation, toLocation]);

  if (!userLocation) {
    return <LoaderScreen />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <PushNotificationManager />
      <Map
        defaultCenter={userLocation}
        disableDefaultUI={true}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
        defaultZoom={17}
        maxZoom={17}
        style={{ width: "100%", height: "100%" }}
      >
        {fromLocation && <AdvancedMarker position={fromLocation} />}
        {toLocation && <AdvancedMarker position={toLocation} />}
        {userLocation && (
          <AdvancedMarker position={userLocation}>
            <CircleDot className="text-blue-800 w-8 h-8" />
          </AdvancedMarker>
        )}
        {routeData && <RoutePolyline path={routeData.polyline} />}

        {Object.entries(otherUsers)
          .filter(
            ([_, u]) =>
              u.location &&
              !isNaN(Number(u.location.lat)) &&
              !isNaN(Number(u.location.lng)),
          )
          .map(([id, u]) => {
            if (id === user?.id) return null;
            if (!u.location) return null;

            const userColor = hashStringToHsl(id);
            const lat = Number(u.location.lat);
            const lng = Number(u.location.lng);

            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <AdvancedMarker key={id} position={{ lat, lng }}>
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-xs ${u.isLeaving ? "animate-blink border-red-500 scale-110" : ""}`}
                  style={{
                    borderColor: u.isLeaving ? undefined : userColor,
                    backgroundColor: "transparent",
                  }}
                >
                  {u.name}
                </div>
              </AdvancedMarker>
            );
          })}

        <FitBoundsHandler
          fromLocation={user?.currentRide ? userLocation : fromLocation}
          toLocation={toLocation}
          otherUsers={otherUsers}
          trigger={fitTrigger}
        />
      </Map>

      {!!user?.currentRide ? <OnGoingTrip /> : <BottomSection />}
    </div>
  );
}

const LoaderScreen = () => (
  <div className="flex flex-col items-center justify-center w-screen h-screen bg-background gap-6 p-4 text-center">
    <div className="relative">
      <Loader className="animate-spin" />
      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
    </div>
    <div className="space-y-2 max-w-xs">
      <h2 className="text-xl font-semibold tracking-tight">
        Syncing Location
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Please turn on Location Services to Continue if stuck...
      </p>
    </div>
  </div>
)