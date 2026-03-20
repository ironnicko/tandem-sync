import { Profile } from "@/components/Profile";
import { TripLocationInputs } from "./TripLocationInputs";
import { TripSettingsInputs } from "./TripSettingsInputs";
import { DashboardState } from "@/stores/types";

interface BottomSectionProps{
      dashboardState: Partial<DashboardState>
      updateDashboard: (updates: Partial<DashboardState>) => void
}

export default function BottomSection({dashboardState, updateDashboard} : BottomSectionProps){
    const {formIndex} = dashboardState

    const renderFormInput = () => {
        switch (formIndex) {
        case 0:
            return (
            <TripLocationInputs
                dashboardState={dashboardState}
                updateDashboard={updateDashboard}
            />
            );
        case 1:
            return (
            <TripSettingsInputs
                dashboardState={dashboardState}
                updateDashboard={updateDashboard}
            />
            );
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