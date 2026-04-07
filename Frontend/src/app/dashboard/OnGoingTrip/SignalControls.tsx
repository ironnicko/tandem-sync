import { useState } from "react";
import {
  Fuel,
  Square,
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
  PlusCircle,
} from "lucide-react";

interface SignalControlsProps {
  onSignal: (type: string) => void;
}

export default function SignalControls({ onSignal }: SignalControlsProps) {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [showCustomOptions, setShowCustomOptions] = useState(false);

  const customSignalOptions = [
    { label: "Medic Help", color: "text-red-600", icon: "🚑" },
    { label: "Machine Issue", color: "text-orange-600", icon: "🔧" },
    { label: "Police Alert", color: "text-blue-600", icon: "🚔" },
    { label: "Accident Ahead", color: "text-slate-600", icon: "⚠️" },
  ];

  const handleSignal = (label: string) => {
    if (label === "Custom" && !showCustomOptions) {
      setShowCustomOptions(true);
      return;
    }
    
    onSignal(label);
    setActiveLabel(label);
    setShowCustomOptions(false);
    setTimeout(() => setActiveLabel(null), 1000);
  };

  const buttons = [
    {
      label: "Left" as const,
      icon: ArrowLeft,
      color: "text-green-600 hover:text-green-800",
    },
    {
      label: "U-Turn" as const,
      icon: RefreshCcw,
      color: "text-purple-600 hover:text-purple-800",
    },
    {
      label: "Right" as const,
      icon: ArrowRight,
      color: "text-red-600 hover:text-red-800",
    },
    {
      label: "Refuel" as const,
      icon: Fuel,
      color: "text-blue-600 hover:text-blue-800",
    },
    {
      label: "Stop" as const,
      icon: Square,
      color: "text-gray-600 hover:text-black",
    },
    {
      label: "Custom" as const,
      icon: PlusCircle,
      color: "text-yellow-600 hover:text-yellow-800",
      disabled: false,
    },
  ];

  return (
    <div className="relative p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-60">
      {/* Dropdown Section */}
      {showCustomOptions && (
        <>
          {/* Backdrop to close on click outside */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowCustomOptions(false)} 
          />
          
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[calc(100vw-48px)] max-w-[220px] bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 z-50">
            <div className="p-2 space-y-1">
              {customSignalOptions.map((opt) => (
                <button
                  key={opt.label}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all hover:bg-gray-50 active:scale-95 ${opt.color}`}
                  onClick={() => handleSignal(opt.label)}
                >
                  <span className="text-xl bg-gray-50 p-2 rounded-lg leading-none">
                    {opt.icon}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-3 gap-4 justify-items-center">
        {buttons.map(({ label, icon: Icon, color, disabled }) => (
          <button
            key={label}
            title={label}
            disabled={disabled || activeLabel === label}
            className={`flex flex-col cursor-pointer items-center transition-all duration-300 ${color} ${
              activeLabel === label
                ? "scale-125 drop-shadow-[0_0_8px_currentColor] brightness-125 z-10"
                : "opacity-100"
            } ${disabled ? "opacity-30 cursor-not-allowed" : ""} ${
              activeLabel === label ? "cursor-not-allowed" : ""
            }`}
            onClick={() => !disabled && activeLabel === null && handleSignal(label)}
          >
            <Icon className="w-7 h-7" />
            {/*<span className="text-xs mt-1">{label}</span>*/}
          </button>
        ))}
      </div>
    </div>
  );
}
