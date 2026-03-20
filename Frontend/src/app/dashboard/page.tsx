"use client";
import { useEffect, useState } from "react";
import { AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { FitBoundsHandler } from "@/components/FitBoundsHelper";
import { DashboardState, GeoLocation, UserState } from "@/stores/types";
import BottomSection from "./CreateTrip/BottomSection";
import { useAuth } from "@/stores/useAuth";
import { OnGoingTrip } from "./OnGoingTrip/OnGoingTrip";
import { CircleDot, Loader } from "lucide-react";
import { useOtherUsers } from "@/stores/useOtherUsers";
import PushNotificationManager from "@/components/PushNotificationManager";
import { gqlClient } from "@/lib/graphql/client";
import { ME } from "@/lib/graphql/query";
import RoutePolyline from "@/components/RoutePolyline";
import polyline from "@mapbox/polyline";
import api from "@/lib/axios";

const distanceMeters = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) => {
  const R = 6371000;

  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

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
  const [routePath, setRoutePath] = useState<GeoLocation[]>([]);
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    formIndex: 0,
    toLocation: null,
    fromLocation: null,
    userLocation: null,
    toLocationName: null,
    fromLocationName: null,
    maxRiders: 5,
    visibility: "private",
    tripName: null,
  });

  const { toLocation, fromLocation, userLocation } = dashboardState;

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
          if (dist < 8) return;
        }

        lastLocation = next;

        setDashboardState((prev) => ({
          ...prev,
          userLocation: next,
        }));
      },
      (err) => console.error("Geolocation error:", err),
      {
        enableHighAccuracy: true,
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
        fetchPolicy: "network-only",
      });
      setUser({ ...user, ...gqlData.me });
    };
    getData();
  }, []);

  useEffect(() => {
    if (!fromLocation || !toLocation) {
      setRoutePath([]);
      return;
    }

    const fetchRoute = async () => {
      try {
        const res = await api.post("/route", {
          origin: fromLocation,
          destination: toLocation,
        });

        const data = await res.data;

        if (!data.polyline) return;

        const decoded = polyline.decode(data.polyline);

        const path = decoded.map(([lat, lng]) => ({ lat, lng }));

        setRoutePath(path);
      } catch (err) {
        console.error("Route fetch failed:", err);
      }
    };

    fetchRoute();
  }, [fromLocation, toLocation]);

  const updateDashboard = (updates: Partial<DashboardState>) =>
    setDashboardState((prev) => ({ ...prev, ...updates }));

  if (!userLocation) return <Loader className="animate-spin" />;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <PushNotificationManager />
      <Map
        defaultCenter={userLocation}
        disableDefaultUI={true}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
        defaultZoom={15}
        style={{ width: "100%", height: "100%" }}
      >
        {fromLocation && <AdvancedMarker position={fromLocation} />}
        {toLocation && <AdvancedMarker position={toLocation} />}
        {userLocation && (
          <AdvancedMarker position={userLocation}>
            <CircleDot className="text-blue-800 w-8 h-8" />
          </AdvancedMarker>
        )}
        {routePath.length > 0 && <RoutePolyline path={routePath} />}

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
                  className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-xs"
                  style={{
                    borderColor: userColor,
                    backgroundColor: "transparent",
                    // color: userColor,
                  }}
                >
                  {u.name}
                </div>
              </AdvancedMarker>
            );
          })}

        <FitBoundsHandler
          fromLocation={
            (user?.currentRide ? null : fromLocation) || userLocation
          }
          toLocation={toLocation}
          otherUsers={otherUsers}
        />
      </Map>

      {!!user?.currentRide ? (
        <OnGoingTrip
          updateDashboard={updateDashboard}
          dashboardState={dashboardState}
        />
      ) : (
        <BottomSection
          updateDashboard={updateDashboard}
          dashboardState={dashboardState}
        />
      )}
    </div>
  );
}
