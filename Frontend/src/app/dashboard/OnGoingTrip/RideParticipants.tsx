import { RideState, UserState } from "@/stores/types";
import { MapPin } from "lucide-react";

interface RideParticipantsProps {
  ride: RideState | undefined;
  otherUsers: Record<string, UserState>;
}

export default function RideParticipants({ ride, otherUsers }: RideParticipantsProps) {
  if (!ride?.participants) return null;

  const participants = ride.participants
    .map((p) => ({ ...p, user: otherUsers[p.userId] }))
    .filter((p) => p.user && p.user.location);

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <h4 className="font-semibold mb-3 text-sm">Current ({participants.length})</h4>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {participants.map((p) => (
          <div
            key={p.userId}
            className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 text-sm"
          >
            <div className="flex-1">
              <p className="font-medium">{p.user?.name || "Unknown"}</p>
              <p className="text-xs text-gray-500 capitalize">{p.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
