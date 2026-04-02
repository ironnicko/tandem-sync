import { PlaceAutocomplete } from "@/components/PlaceAutoComplete";
import { useDashboard } from "@/stores/useDashboard";

export const TripLocationInputs = () => {
  const {
    fromLocation,
    fromLocationName,
    toLocation,
    toLocationName,
    tripName,
    updateDashboard,
  } = useDashboard();

  const handleFromPlaceChanged = (
    place: google.maps.places.PlaceResult | null,
  ) => {
    if (place?.geometry?.location) {
      updateDashboard({
        fromLocation: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
      });
      updateDashboard({ fromLocationName: place.name!.toString() });
    } else {
      updateDashboard({ fromLocation: null, fromLocationName: null });
    }
  };

  const handleToPlaceChanged = (
    place: google.maps.places.PlaceResult | null,
  ) => {
    if (place?.geometry?.location) {
      updateDashboard({
        toLocation: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
      });
      updateDashboard({ toLocationName: place.name!.toString() });
    } else {
      updateDashboard({ toLocation: null, toLocationName: null });
    }
  };

  return (
    <>
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold">Plan Your Trip</h2>
        <p className="text-sm text-gray-500">
          Select your Start and Destination
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          value={tripName || ""}
          onChange={(e) => updateDashboard({ tripName: e.target.value })}
          placeholder="Trip Name..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* From Location Input */}
        <PlaceAutocomplete
          onPlaceSelect={handleFromPlaceChanged}
          defaultValue={fromLocationName}
          placeholder="Start..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* To Location Input */}
        <PlaceAutocomplete
          onPlaceSelect={handleToPlaceChanged}
          defaultValue={toLocationName}
          placeholder="Destination..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <button
        disabled={!(fromLocation && toLocation && tripName)}
        onClick={() => updateDashboard({ formIndex: 1 })}
        id="next-button"
        className={`mt-6 w-full px-6 py-3 rounded-lg
          ${
            fromLocation && toLocation
              ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
              : "bg-gray-300 text-gray-500"
          }`}
      >
        Next
      </button>
    </>
  );
};
