import { create } from "zustand";
import { Announcement, AnnouncerStore } from "./types";

export const useAnnouncerStore = create<AnnouncerStore>((set) => ({
  announcements: [],
  lastActivity: Date.now(),
  pushDismissed: false,
  addAnnouncement: (msg, type = "info", userId) =>
    set((state) => {
      const newA: Announcement = {
        id: crypto.randomUUID(),
        message: msg,
        type,
        createdAt: Date.now(),
        userId,
      };

      return {
        announcements: [...state.announcements.slice(-3), newA], // limit size
        lastActivity: Date.now(),
      };
    }),

  removeAnnouncement: (id) =>
    set((state) => ({
      announcements: state.announcements.filter((a) => a.id !== id),
    })),
  clearAnnouncements: () =>
    set({
      announcements: [],
    }),

  resetActivity: () =>
    set({
      lastActivity: Date.now(),
    }),

    setPushDismissed: (pushDismissed) => {
      set({ pushDismissed });
    },
}));
