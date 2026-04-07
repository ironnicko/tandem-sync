"use client";

import { useEffect, useState } from "react";
import { useAnnouncerStore } from "@/stores/useAnnoucer";
import { useAuth } from "@/stores/useAuth";
import BigIconOverlay from "./Announcer/BigIconOverlay";
import ActivityLog from "./Announcer/ActivityLog";

export default function Announcer() {
  const { user } = useAuth();
  const {
    announcements,
    removeAnnouncement,
    clearAnnouncements,
    lastActivity,
    resetActivity,
  } = useAnnouncerStore();

  const [isDimmed, setIsDimmed] = useState(false);
  const [showIcon, setShowIcon] = useState<{
    type: string;
    id: string;
  } | null>(null);

  const handleInteraction = () => {
    setIsDimmed(false);
    resetActivity();
  };


  useEffect(() => {
    if (announcements.length > 0) {
      handleInteraction();
      const latest = announcements[announcements.length - 1];
      
      // 🔹 Only show big icon for signals from other users, excluding join/leave noise
      if (latest.userId !== user?.id && latest.type !== "join" && latest.type !== "leave") {
        setShowIcon({ type: latest.type, id: latest.id });
      }

      const timer = setTimeout(() => setShowIcon(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [announcements]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsDimmed(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [lastActivity]);

  useEffect(() => {
    return () => {
      clearAnnouncements();
    };
  }, []);

  return (
    <>
      <BigIconOverlay showIcon={showIcon} />
      <ActivityLog
        announcements={announcements}
        removeAnnouncement={removeAnnouncement}
        clearAnnouncements={clearAnnouncements}
        isDimmed={isDimmed}
        handleInteraction={handleInteraction}
      />
    </>
  );
}
