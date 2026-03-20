import { RideState, UserState } from "@/stores/types";
import { Loader } from "lucide-react";

interface RideParticipantsProps {
  ride: RideState | undefined;
  otherUsers: Record<string, UserState>;
}

export default function RideParticipants({
  ride,
  otherUsers,
}: RideParticipantsProps) {
  const participants = ride.participants
    .map((p) => ({ ...p, user: otherUsers[p.userId] }))
    .filter((p) => p.user && p.user.location);

  const middleSection = () => {
    return (
      <>
        {participants.length === 0 ? (
          <Loader className="animate-spin" />
        ) : (
          <>
            <h4 className="font-semibold mb-2 text-sm">
              ({participants.length})
            </h4>
            <div className="text-white space-y-2 max-h-48 overflow-y-auto">
              {participants.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center justify-between rounded text-sm"
                >
                  <div className="flex-1">
                    <p className="font-medium">{p.user?.name || "Unknown"}</p>
                    <p className="text-xs capitalize">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div className="bg-black text-white rounded-lg p-4 pt-10 shadow-md">
      {middleSection()}
    </div>
  );
}
