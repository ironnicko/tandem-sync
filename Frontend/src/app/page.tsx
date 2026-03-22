"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function LandingPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center gap-12 py-10">
        <div className="hero flex flex-col gap-5 items-center text-center">
          <h1 className="text-5xl font-extrabold text-gray-900">
            Welcome to TandemSync
          </h1>
          <p className="flex text-lg text-gray-600 items-center max-w-xl">
            Plan your trips effortlessly. Create a trip, invite friends, and
            explore new destinations.
          </p>
          <Button
            className="cursor-pointer mt-4 bg-primary text-primary-foreground hover:text-secondary-foreground"
            onClick={() => router.push("/dashboard")}
          >
            Start a Trip!
          </Button>
        </div>

        {/* Video Section */}
        <div className="flex flex-col items-center gap-4 w-full max-w-3xl px-4">
          <h2 className="text-2xl font-bold text-gray-800">See It in Action</h2>
          <p className="text-gray-500 text-sm">
            Watch how TandemSync makes group trip planning seamless.
          </p>
          <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-black">
            <video
              ref={videoRef}
              className="w-full"
              src="https://github.com/user-attachments/assets/3ba68de9-3ff8-4ccd-8832-4ca4bce1fc8a"
              controls
              playsInline
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center text-gray-400 text-sm py-2">
        &copy; 2026 TandemSync. All rights reserved.
      </div>
    </>
  );
}
