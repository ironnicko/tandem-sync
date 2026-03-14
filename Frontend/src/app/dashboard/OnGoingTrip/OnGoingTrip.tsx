import { Profile } from "@/components/Profile";
import Timer from "@/components/Timer";
import Announcer from "@/components/Announcer";
import { DashboardState } from "@/stores/types";
import { useOnGoingTrip } from "./useOnGoingTrip";
import SignalControls from "./SignalControls";
import CurrentTripInfo from "./CurrentTripInfo";
import RideParticipants from "./RideParticipants";
import { useState } from "react";
import { Users } from "lucide-react";

interface OnGoingTripProps {
  updateDashboard: (updates: Partial<DashboardState>) => void;
  dashboardState: DashboardState;
}

export const OnGoingTrip = ({ updateDashboard, dashboardState }: OnGoingTripProps) => {
  const { ride, loading, error, announcements, removeAnnouncement, handleSendSignal, otherUsers } =
    useOnGoingTrip(updateDashboard, dashboardState.userLocation);
  const [showTripInfo, setShowTripInfo] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  if (loading) return <p className="p-4">Loading Current Trip...</p>;
  if (error) return <p className="p-4 text-red-600">Error loading Current Trip: {error.message}</p>;

  return (
    <>
      <Announcer announcements={announcements} removeAnnouncement={removeAnnouncement} />
      <Profile className="absolute top-4 left-[12vw] flex flex-col items-center" />

      <div className="absolute top-4 right-6 max-w-sm space-y-3">
        {showTripInfo && <CurrentTripInfo ride={ride} />}
        {showParticipants && <RideParticipants ride={ride} otherUsers={otherUsers} />}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <Timer ride={ride} />
        <SignalControls onSignal={handleSendSignal} />

        <div className="flex gap-2">
          <button
            onClick={() => setShowTripInfo(!showTripInfo)}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition"
          >
            {showTripInfo ? "Hide Trip Info" : "Show Trip Info"}
          </button>

          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition"
          >
            <Users className="w-4 h-4" />
            {showParticipants ? "Hide Participants" : "Show Participants"}
          </button>
        </div>
      </div>
    </>
  );
};
