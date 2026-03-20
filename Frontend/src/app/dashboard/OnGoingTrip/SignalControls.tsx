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
      disabled: true,
    },
  ];

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl border border-gray-200 w-60">
      <div className="grid grid-cols-3 gap-4 justify-items-center">
        {buttons.map(({ label, icon: Icon, color, disabled }) => (
          <button
            key={label}
            title={label}
            className={`flex flex-col cursor-pointer items-center ${color}`}
            onClick={() => !disabled && onSignal(label)}
          >
            <Icon className="w-7 h-7" />
            {/*<span className="text-xs mt-1">{label}</span>*/}
          </button>
        ))}
      </div>
    </div>
  );
}
