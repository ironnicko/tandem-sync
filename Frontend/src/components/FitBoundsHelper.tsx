"use client";
import { GeoLocation, UserState } from "@/stores/types";
import { useEffect, useRef, useCallback } from "react";
import { useMap } from "@vis.gl/react-google-maps";

interface FitBoundsHandlerProps {
  fromLocation: GeoLocation | null;
  toLocation: GeoLocation | null;
  otherUsers: Record<string, UserState>;
  trigger?: number;
}

const isValidLocation = (loc: GeoLocation): loc is GeoLocation => {
  return Number.isFinite(loc.lat) && Number.isFinite(loc.lng);
};

const USER_INTERACTION_GRACE_MS = 5_000; // 10s after user touches map
const DEBOUNCE_MS = 3_000; // wait 3s after last change before fitting

export function FitBoundsHandler({
  fromLocation,
  toLocation,
  otherUsers,
  trigger,
}: FitBoundsHandlerProps) {
  const map = useMap();
  const lastFitRef = useRef<string | null>(null);
  const lastTriggerRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userInteractedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map) return;
    const markInteraction = () => {
      userInteractedAtRef.current = Date.now();
    };

    const dragListener = map.addListener("dragstart", markInteraction);
    const zoomListener = map.addListener("zoom_changed", markInteraction);

    return () => {
      dragListener.remove();
      zoomListener.remove();
    };
  }, [map]);

  const fitBounds = useCallback(
    (manual: boolean = false) => {
      if (!map) return;

      // Don't fit if user interacted within the grace period
      if (
        !manual &&
        userInteractedAtRef.current &&
        Date.now() - userInteractedAtRef.current < USER_INTERACTION_GRACE_MS
      ) {
        return;
      }

      const points: GeoLocation[] = [];
      if (fromLocation && isValidLocation(fromLocation))
        points.push(fromLocation);
      Object.values(otherUsers).forEach((u) => {
        if (u.location && isValidLocation(u.location)) points.push(u.location);
      });

      if (points.length === 0) return;

      const hash = JSON.stringify(points.map((p) => [p.lat, p.lng]));

      // Skip if nothing meaningful changed (and it's not a manual trigger)
      if (lastTriggerRef.current === trigger && hash === lastFitRef.current)
        return;

      lastFitRef.current = hash;
      lastTriggerRef.current = trigger;

      const bounds = new google.maps.LatLngBounds();
      points.forEach((p) =>
        bounds.extend(new google.maps.LatLng(p.lat, p.lng)),
      );

      if (manual || points.length === 1) {
        map.panTo(points[0]);
        map.setZoom(17);
        return;
      }
      map.panToBounds(bounds);
      map.fitBounds(bounds, {
        top: 120,
        bottom: 350,
        left: 120,
        right: 120,
      });
    },
    [map, fromLocation, otherUsers, trigger],
  );

  useEffect(() => {
    // Manual triggers (trigger prop change) bypass debounce but still
    // respect the user interaction grace period
    if (lastTriggerRef.current !== trigger) {
      fitBounds(true);
      return;
    }

    // All other changes (location updates, other users) are debounced
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(fitBounds, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [fitBounds, trigger]);

  return null;
}
