import { Profile } from "@/components/Profile";
import Timer from "@/components/Timer";
import Announcer from "@/components/Announcer";
import { DashboardState } from "@/stores/types";
import { useOnGoingTrip } from "./useOnGoingTrip";
import SignalControls from "./SignalControls";

interface OnGoingTripProps {
  updateDashboard: (updates: Partial<DashboardState>) => void;
  dashboardState: DashboardState;
}

export const OnGoingTrip = ({ updateDashboard, dashboardState }: OnGoingTripProps) => {
  const { ride, loading, error, announcements, removeAnnouncement, handleSendSignal } =
    useOnGoingTrip(updateDashboard, dashboardState.userLocation);

  if (loading) return <p className="p-4">Loading Current Trip...</p>;
  if (error) return <p className="p-4 text-red-600">Error loading Current Trip: {error.message}</p>;

  return (
    <>
      <Announcer announcements={announcements} removeAnnouncement={removeAnnouncement} />
      <Profile className="absolute top-4 left-[12vw] flex flex-col items-center" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <Timer ride={ride} />
        <SignalControls onSignal={handleSendSignal} />
      </div>
    </>
  );
};
