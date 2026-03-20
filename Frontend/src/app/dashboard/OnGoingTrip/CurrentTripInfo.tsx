import { RideState } from "@/stores/types";
import { MapPin, Clock, Users } from "lucide-react";

interface CurrentTripInfoProps {
  ride: RideState | undefined;
}

export default function CurrentTripInfo({ ride }: CurrentTripInfoProps) {
  if (!ride) return null;

  const formatTime = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  return (
    <div className="bg-black text-white rounded-lg p-4 shadow-md">
      <div className="flex justify-start">
        <h3 className="text-lg font-semibold mb-3">{ride.tripName}</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4  text-red-600" />
          <span className="font-medium">{ride.startName || "Unknown"}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="font-medium">
            {ride.destinationName || "Unknown"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{formatTime(ride.startedAt)}</span>
        </div>
      </div>
    </div>
  );
}
