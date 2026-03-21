import { useDashboard } from "@/stores/useDashboard";
import { useEffect, useState } from "react";

function getArrivalTime(durationStr: string): string {
  const seconds = parseInt(durationStr.replace("s", ""), 10);
  if (isNaN(seconds)) return "";

  const arrival = new Date(Date.now() + seconds * 1000);

  return arrival.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDistance(meters: number): string {
  if (!meters || isNaN(meters)) return "0 m";

  if (meters < 1000) return `${meters} m`;

  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

export default function Timer() {
  const { routeData, fitTrigger, updateDashboard } = useDashboard();
  const [arrival, setArrival] = useState("");
  const [distance, setDistance] = useState("");

  useEffect(() => {
    if (!routeData) return;

    setArrival(getArrivalTime(routeData.duration));
    setDistance(formatDistance(routeData.distance));
  }, [routeData]);

  return (
    <div className="px-4 py-2 bg-black text-white rounded-lg shadow-md font-mono flex gap-2 items-center">
      <span>{distance}</span>

      <button
        onClick={() =>
          updateDashboard({
            fitTrigger: (fitTrigger || 0) + 1,
          })
        }
        className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-black hover:scale-110 transition shadow-sm"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-black block"></span>
      </button>

      <span>{arrival}</span>
    </div>
  );
}
