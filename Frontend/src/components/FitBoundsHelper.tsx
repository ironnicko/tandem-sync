"use client";

import { GeoLocation, UserState } from "@/stores/types";
import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

interface FitBoundsHandlerProps {
  fromLocation: GeoLocation | null;
  toLocation: GeoLocation | null;
  otherUsers: Record<string, UserState>;
}

export function FitBoundsHandler({
  fromLocation,
  toLocation,
  otherUsers,
}: FitBoundsHandlerProps) {
  const map = useMap();
  const lastFitRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map) return;

    const bounds = new google.maps.LatLngBounds();
    const points: GeoLocation[] = [];

    if (fromLocation) points.push(fromLocation);
    if (toLocation) points.push(toLocation);

    Object.values(otherUsers).forEach((u) => {
      if (u.location) points.push(u.location);
    });

    if (points.length === 0) return;

    // Create a hash to detect meaningful changes
    const hash = JSON.stringify(points.map((p) => [p.lat, p.lng]));
    if (hash === lastFitRef.current) return;

    lastFitRef.current = hash;

    points.forEach((p) => {
      bounds.extend(new google.maps.LatLng(p.lat, p.lng));
    });

    if (points.length === 1) {
      map.panTo(points[0]);
      map.setZoom(15);
      return;
    }

    map.fitBounds(bounds, {
      top: 120,
      bottom: 350, // space for bottom sheet (Uber UI)
      left: 120,
      right: 120,
    });
  }, [map, fromLocation, toLocation, otherUsers]);

  return null;
}
