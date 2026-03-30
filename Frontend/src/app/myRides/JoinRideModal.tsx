"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  onJoin: (code: string) => void;
}

export default function JoinRideModal({ onClose, onJoin }: Props) {
  const [rideCode, setRideCode] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Join Ride</h2>

        <input
          value={rideCode}
          onChange={(e) => setRideCode(e.target.value)}
          placeholder="Ride Code or Invite Link"
          className="w-full border rounded-md px-3 py-2 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded cursor-pointer bg-gray-200">
            Cancel
          </button>

          <button
            onClick={() => {
              let input = rideCode.trim();
              let code = input;
              
              try {
                // If it's a URL, extract all query parameters
                if (input.startsWith("http")) {
                  const url = new URL(input);
                  const searchParams = new URLSearchParams(url.search);
                  const mainCode = searchParams.get("rideCode");
                  
                  if (mainCode) {
                    searchParams.delete("rideCode");
                    const otherParams = searchParams.toString();
                    code = otherParams ? `${mainCode}&${otherParams}` : mainCode;
                  }
                }
              } catch (e) {
                // Fail-safe: fallback to original input if URL parsing fails
              }
              
              onJoin(code);
            }}
            className="px-3 py-2 rounded cursor-pointer bg-black text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
