"use client";
import { RideState, UserState } from "@/stores/types";
import { Bike, OctagonX, PenSquareIcon, Save, Share2 } from "lucide-react";
import { memo, useCallback, useState } from "react";

interface RideControlsCardProps {
  ride: RideState;
  user: UserState;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  buttonBusy: boolean;
  handleStartRide: () => void;
  handleEndRide: () => void;
  handleSetCurrentRide: () => void;
  handleRemoveCurrentRide: () => void;
  handleSave: () => void;
}

export default function RideControlsCard({
  ride,
  user,
  isEditing,
  setIsEditing,
  buttonBusy,
  handleStartRide,
  handleEndRide,
  handleSetCurrentRide,
  handleRemoveCurrentRide,
  handleSave,
}: RideControlsCardProps) {
  const leader = ride.participants?.some(
    (p) => p.userId === user.id && p.role === "leader",
  );
  const isCurrentRide = user?.currentRide === ride.rideCode;
  const rideHasEnded = !!ride.endedAt;

  if (!leader && rideHasEnded) return null;

  return (
    <div className="w-full max-w-2xl bg-white/80 rounded-xl p-6 flex flex-wrap justify-center gap-10 shadow-lg border border-white/20">
      {leader && (
        <OwnerControls
          ride={ride}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          buttonBusy={buttonBusy}
          handleStartRide={handleStartRide}
          handleEndRide={handleEndRide}
          handleSave={handleSave}
        />
      )}

      <NonOwnerControls
        ride={ride}
        isEditing={isEditing}
        isCurrentRide={isCurrentRide}
        handleSetCurrentRide={handleSetCurrentRide}
        handleRemoveCurrentRide={handleRemoveCurrentRide}
        userId={user.id}
      />
    </div>
  );
}

interface ControlButtonProps {
  onClick: () => void;
  busy?: boolean;
  color: "green" | "red" | "blue" | "purple" | "yellow";
  Icon: any;
  label: string;
}

const ControlButton = memo(
  ({ onClick, busy, color, Icon, label }: ControlButtonProps) => {
    const colors: Record<string, string> = {
      green: "text-green-600 hover:text-green-800",
      red: "text-red-600 hover:text-red-800",
      blue: "text-blue-600 hover:text-blue-800",
      purple: "text-purple-600 hover:text-purple-800",
      yellow: "text-yellow-600 hover:text-yellow-800",
    };

    return (
      <button
        onClick={onClick}
        disabled={busy}
        className={`flex flex-col items-center cursor-pointer transition-all ${colors[color]} ${
          busy ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Icon size={28} />
        <span className="text-xs mt-1">{label}</span>
      </button>
    );
  },
);
ControlButton.displayName = "ControlButton";

interface OwnerControlsProps {
  ride: RideState;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  buttonBusy: boolean;
  handleStartRide: () => void;
  handleEndRide: () => void;
  handleSave: () => void;
}

const OwnerControls = memo(
  ({
    ride,
    isEditing,
    setIsEditing,
    buttonBusy,
    handleStartRide,
    handleEndRide,
    handleSave,
  }: OwnerControlsProps) => (
    <>
      {ride.status === "not started" && !isEditing && (
        <ControlButton
          onClick={handleStartRide}
          busy={buttonBusy}
          color="green"
          Icon={Bike}
          label="Start Ride"
        />
      )}
      {ride.status === "started" && !isEditing && (
        <ControlButton
          onClick={handleEndRide}
          busy={buttonBusy}
          color="red"
          Icon={OctagonX}
          label="End Ride"
        />
      )}
      <ControlButton
        onClick={() => (isEditing ? handleSave() : setIsEditing(!isEditing))}
        color="blue"
        Icon={isEditing ? Save : PenSquareIcon}
        label={isEditing ? "Save" : "Edit"}
      />
    </>
  ),
);
OwnerControls.displayName = "OwnerControls";

interface NonOwnerControlsProps {
  isEditing: boolean;
  isCurrentRide: boolean;
  handleSetCurrentRide: () => void;
  handleRemoveCurrentRide: () => void;
  ride: RideState;
  userId: string;
}

const NonOwnerControls = memo(
  ({
    isEditing,
    isCurrentRide,
    handleSetCurrentRide,
    handleRemoveCurrentRide,
    ride,
    userId,
  }: NonOwnerControlsProps) => {
    const [copied, setCopied] = useState(false);

    const handleShareRide = useCallback(() => {
      const link = `${window.location.origin}/joinRide?rideCode=${ride.rideCode}&invitedBy=${userId}`;
      navigator.clipboard.writeText(link).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }, [ride.rideCode, userId]);

    return (
      <>
        {!ride.endedAt &&
          ride.startedAt &&
          (!isCurrentRide ? (
            <ControlButton
              onClick={handleSetCurrentRide}
              color="green"
              Icon={Bike}
              label="Set Current Ride"
            />
          ) : (
            <ControlButton
              onClick={handleRemoveCurrentRide}
              color="yellow"
              Icon={OctagonX}
              label="Remove Current Ride"
            />
          ))}

        {!isEditing && ride.settings.maxRiders > ride.participants.length && (
          <ControlButton
            onClick={handleShareRide}
            color="purple"
            Icon={Share2}
            label={copied ? "Copied!" : "Invite"}
          />
        )}
      </>
    );
  },
);
NonOwnerControls.displayName = "NonOwnerControls";
