"use client";
import { FormEvent, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import GoogleSignInButton from "@/app/signin/signInWithGoogle";
import { useAuth } from "@/stores/useAuth";

export default function SignUp() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { signup } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const isLoggedIn = await signup(name, email, password);
      if (isLoggedIn == true) {
        debugger;
        router.replace(redirectUrl);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to Sign Up");
    }
  };

  const isSignUpDisabled =
    !name ||
    !email ||
    !password ||
    !confirmPassword ||
    password !== confirmPassword;

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
      <h2 className="text-center text-2xl font-bold text-gray-900">
        Create your account
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              onChange={(e) => setName(e.target.value)}
              id="name"
              name="name"
              type="text"
              placeholder="Your Name"
              required
              className="mt-1 w-full"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="mt-1 w-full"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              name="password"
              type="password"
              placeholder="********"
              required
              className="mt-1 w-full"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              onChange={(e) => setConfirmPassword(e.target.value)}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="********"
              required
              className="mt-1 w-full"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
          </div>
        </div>

        <Button className="w-full mt-4" disabled={isSignUpDisabled}>
          Sign Up
        </Button>
      </form>

      <div className="flex items-center my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="px-2 text-gray-400">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <div className="mt-4">
        <GoogleSignInButton />
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <a 
          href={`/signin?redirect=${encodeURIComponent(redirectUrl)}`} 
          className="text-blue-600 hover:underline"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
