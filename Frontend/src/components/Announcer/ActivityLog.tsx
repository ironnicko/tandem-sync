"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";
import { iconMap } from "./constants";
import { Announcement } from "@/stores/types";
import { useOtherUsers } from "@/stores/useOtherUsers";
import { useAuth } from "@/stores/useAuth";

interface ActivityLogProps {
  announcements: Announcement[];
  removeAnnouncement: (id: string) => void;
  clearAnnouncements: () => void;
  isDimmed: boolean;
  handleInteraction: () => void;
}

export default function ActivityLog({
  announcements,
  removeAnnouncement,
  clearAnnouncements,
  isDimmed,
  handleInteraction,
}: ActivityLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { users } = useOtherUsers();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [announcements]);

  if (announcements.length === 0) return null;

  return (
    <motion.div
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
      className={`fixed top-4 right-4 z-[9999] w-80 transition-all duration-500 ${
        isDimmed ? "opacity-40 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[28px] p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            Activity Log
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearAnnouncements();
            }}
            className="text-[10px] cursor-pointer uppercase tracking-widest font-black text-blue-600 hover:text-blue-800 transition-all active:scale-90"
          >
            Clear All
          </button>
        </div>

        <div
          ref={containerRef}
          className="flex flex-col gap-2.5 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar scroll-smooth"
        >
        <AnimatePresence initial={false}>
          {announcements.map((a) => {
            const user = a.userId === currentUser?.id ? currentUser : users[a.userId as string];
            const userImage = user?.image;

            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 rounded-xl p-2.5 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative shrink-0">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={user?.name || "User"}
                      className="w-9 h-9 rounded-full object-cover border border-gray-100"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 font-bold text-xs text-gray-400">
                      {user?.name?.[0] || "?"}
                    </div>
                  )}
                  <div className="absolute -bottom-0.25 -right-0.25 bg-white rounded-full p-0.25 shadow-sm border border-gray-100">
                    <div className="scale-70 origin-center flex items-center justify-center">
                      {iconMap[a.type] || iconMap.info}
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-sm text-gray-800 leading-tight font-semibold py-1">
                  {a.message}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAnnouncement(a.id);
                  }}
                  className="text-gray-300 hover:text-gray-500 transition-colors px-1"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
    </motion.div>
  );
}
