"use client";

import { X, Info, CheckCircle2, UserPlus, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAnnouncerStore } from "@/stores/useAnnoucer";

const iconMap = {
  success: <CheckCircle2 className="text-green-600" size={18} />,
  join: <UserPlus className="text-blue-600" size={18} />,
  leave: <LogOut className="text-red-500" size={18} />,
  info: <Info className="text-gray-500" size={18} />,
};

export default function Announcer() {
  const {
    announcements,
    removeAnnouncement,
    clearAnnouncements,
    lastActivity,
    resetActivity,
  } = useAnnouncerStore();

  const [isDimmed, setIsDimmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🔹 Restore visibility on interaction
  const handleInteraction = () => {
    setIsDimmed(false);
    resetActivity();
  };

  // 🔹 Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [announcements]);

  // 🔹 Wake up UI when new announcement comes
  useEffect(() => {
    if (announcements.length > 0) {
      handleInteraction();
    }
  }, [announcements.length]);

  // 🔹 Dim after 5s inactivity (NO polling)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsDimmed(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [lastActivity]);

  useEffect(() => {
    return clearAnnouncements;
  }, []);

  if (announcements.length === 0) return null;

  return (
    <motion.div
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
      className={`fixed top-4 right-4 z-[9999] w-80 transition-opacity duration-500 ${
        isDimmed ? "opacity-40" : "opacity-100"
      }`}
    >
      <h2 className="text-sm font-semibold text-gray-800 mb-2">Activity Log</h2>

      <div
        ref={containerRef}
        className="flex flex-col gap-2 max-h-[10vh] overflow-y-auto"
      >
        <AnimatePresence>
          {announcements.map((a) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 rounded-md p-3 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Icon */}
              <div className="mt-0.5">{iconMap[a.type]}</div>

              {/* Message */}
              <div className="flex-1 text-sm text-gray-800 leading-snug">
                {a.message}
              </div>

              {/* Close */}
              <button
                onClick={() => removeAnnouncement(a.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
