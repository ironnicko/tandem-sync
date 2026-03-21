import { Profile } from "@/components/Profile";
import { TripLocationInputs } from "./TripLocationInputs";
import { TripSettingsInputs } from "./TripSettingsInputs";
import { useDashboard } from "@/stores/useDashboard";

export default function BottomSection() {
  const { formIndex } = useDashboard();

  const renderFormInput = () => {
    switch (formIndex) {
      case 0:
        return <TripLocationInputs />;
      case 1:
        return <TripSettingsInputs />;
    }
  };
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
      {/* Profile + Menu */}
      <Profile className="relative top-4 flex flex-col items-center"></Profile>

      {/* Ride Form */}
      <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-80">
        {renderFormInput()}
      </div>
    </div>
  );
}
