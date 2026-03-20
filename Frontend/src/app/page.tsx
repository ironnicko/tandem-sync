'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LandingPage() {

  const router = useRouter()
   return ( 
    <>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="hero flex flex-col gap-5">
          <h1 className="text-5xl font-extrabold text-gray-900">
            Welcome to TandemSync
          </h1>
          <p className="flex text-lg text-gray-600 items-center max-w-xl">
            Plan your trips effortlessly. Create a trip, invite friends, and explore new destinations.
          </p>
        </div>

        <Button
          className="cursor-pointer mt-4 bg-primary text-primary-foreground hover:text-secondary-foreground"
          onClick={() => router.push("/dashboard")}
        >
          Start a Trip!
        </Button>
    </div>
            <div className="flex justify-center text-gray-400 text-sm py-2">
              &copy; 2026 TandemSync. All rights reserved.
          </div>
    </>
    )

}
