import { create } from "zustand";
import { DashboardState } from "./types";

export const useDashboard = create<Partial<DashboardState>>()((set) => ({
  formIndex: 0,
  fitTrigger: 0,
  maxRiders: 5,
  visibility: "private",
  updateDashboard: (update: Partial<DashboardState>) =>
    set((prev) => ({
      ...prev,
      ...update,
    })),
}));
