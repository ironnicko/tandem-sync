import { Profile } from "@/components/Profile";
import Timer from "@/components/Timer";
import { useOnGoingTrip } from "./useOnGoingTrip";
import SignalControls from "./SignalControls";
import CurrentTripInfo from "./CurrentTripInfo";
import RideParticipants from "./RideParticipants";
import { useState } from "react";
import { Users, Info } from "lucide-react";

export const OnGoingTrip = () => {
  const { ride, loading, error, handleSendSignal, otherUsers } = useOnGoingTrip();
  const [showTripInfo, setShowTripInfo] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  if (loading) return <p className="p-4">Loading Current Trip...</p>;
  if (error)
    return (
      <p className="p-4 text-red-600">
        Error loading Current Trip: {error.message}
      </p>
    );

  return (
    <>
      <Profile className="absolute top-4 left-[12vw] flex flex-col items-center" />

      <div className="absolute top-4 right-6 flex gap-2 max-w-sm">
        {showTripInfo && <CurrentTripInfo ride={ride} />}
        {showParticipants && (
          <RideParticipants ride={ride} otherUsers={otherUsers} />
        )}
      </div>

      <div className="absolute flex gap-2 top-6 right-10">
        {/* Trip Info Button */}
        <button
          onClick={() => setShowTripInfo(!showTripInfo)}
          className={`flex items-center justify-center px-4 py-2 border rounded-lg transition ${
            showTripInfo
              ? "bg-white text-black"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Participants Button */}
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className={`flex items-center justify-center px-3 py-2 border rounded-lg transition ${
            showParticipants
              ? "bg-white text-black"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          <Users className="w-4 h-4" />
        </button>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <Timer/>
        <SignalControls onSignal={handleSendSignal} />
      </div>
    </>
  );
};
