"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/stores/useAuth";
import { useSearchParams } from "next/navigation";

export default function GoogleSignInButton() {
  const searchParams = useSearchParams();
  const [busyButton, setBusyButton] = useState(false);
  const { loginWithGoogle } = useAuth();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const handleGoogleLogin = async () => {
    try {
      setBusyButton(true);
      await loginWithGoogle(`/google-redirect?redirect=${encodeURIComponent(redirectUrl)}`);
    } finally {
      setBusyButton(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full flex items-center cursor-pointer justify-center gap-2"
      onClick={handleGoogleLogin}
      disabled={busyButton}
    >
      <FcGoogle size={20} />
      Sign in with Google
    </Button>
  );
}
