import { ArrowLeft } from "lucide-react";
import { RideState } from "@/stores/types";
import { useMutation } from "@apollo/client/react";
import { CREATE_RIDE } from "@/lib/graphql/mutation";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useRides } from "@/stores/useRides";
import { useRef } from "react";
import { useDashboard } from "@/stores/useDashboard";

export const TripSettingsInputs = () => {
  const {
    formIndex,
    maxRiders,
    visibility,
    fromLocation,
    fromLocationName,
    tripName,
    toLocation,
    toLocationName,
    updateDashboard,
  } = useDashboard();
  const [createRide] = useMutation<{ createRide: RideState }>(CREATE_RIDE);
  const buttonBoolean = useRef<boolean>(false);

  const { rides, setRides } = useRides();
  const router = useRouter();

  const CreateRide = async () => {
    if (buttonBoolean.current) return;
    buttonBoolean.current = true;
    try {
      const { data, error } = await createRide({
        variables: {
          maxRiders,
          visibility,
          startLat: fromLocation!.lat,
          startLng: fromLocation!.lng,
          startName: fromLocationName,
          destinationLat: toLocation!.lat,
          destinationLng: toLocation!.lng,
          destinationName: toLocationName,
          tripName: tripName,
        },
      });

      if (error) throw error;
      updateDashboard({
        formIndex: 0,
        maxRiders: 0,
        visibility: "public",
        fromLocation: null,
        fromLocationName: null,
        toLocation: null,
        toLocationName: null,
        tripName: null,
      });
      setRides([...rides, data!.createRide]);
      toast.success("Successfully Created Ride!");
      router.push("/myRides");
    } catch (err) {
      toast.error("Failed to Create Ride!");
      console.error(err);
      buttonBoolean.current = false;
    }
  };

  return (
    <>
      <div className="mb-3 text-center">
        <h2 className="flex flex-row gap-4 text-2xl font-bold">
          {formIndex > 0 ? (
            <button
              onClick={() =>
                updateDashboard({ formIndex: Math.max(0, formIndex - 1) })
              }
              className="flex items-center rounded-full gap-1 px-4 py-2 bg-white cursor-pointer"
            >
              <ArrowLeft size={18} />
              {/* <span className="text-sm font-medium">Back</span> */}
            </button>
          ) : (
            <></>
          )}
          Trip Settings
        </h2>
        <p className="text-sm text-gray-500">
          Set maximum riders and choose visibility
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {/* Max Riders Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Max Riders</label>
          <input
            type="number"
            min={1}
            max={50}
            value={Math.min(50, maxRiders)}
            onChange={(e) =>
              updateDashboard({ maxRiders: Number(e.target.value) })
            }
            className="w-3/4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Enter number of riders"
          />
        </div>

        {/* Visibility Selection */}
        <div>
          {/* <label className="block text-sm font-medium mb-1">Visibility</label> */}
          <div className="flex gap-4 justify-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="public"
                checked={visibility === "public"}
                onChange={() => updateDashboard({ visibility: "public" })}
              />
              <span>Public</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="private"
                checked={visibility === "private"}
                onChange={() => updateDashboard({ visibility: "private" })}
              />
              <span>Private</span>
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={CreateRide}
        disabled={buttonBoolean.current}
        id="create-button"
        className="cursor-pointer mt-6 w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
      >
        Create
      </button>
    </>
  );
};
