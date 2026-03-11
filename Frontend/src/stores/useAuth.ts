import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthStore, storage } from "./types";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth";

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      user: null,

      login: async (email, password) => {
        try {
          const { data, error } = await authClient.signIn.email({
            email,
            password,
          });

          if (error) {
            toast.error(error.message || "Login failed");
            return false;
          }
          const user = { ...data.user, picture: data.user?.image! };

          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: true,
            user: user ?? null,
          });

          toast.success("Signed In Successfully!");
          return true;
        } catch (err) {
          set(useAuth.getInitialState());
          toast.error("Login failed");
          return false;
        }
      },

      signup: async (name, email, password) => {
        try {
          const { data, error } = await authClient.signUp.email({
            email,
            password,
            name,
          });

          if (error) {
            toast.error(error.message || "Signup failed");
            return false;
          }
          const user = { ...data.user, picture: data.user?.image! };
          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: true,
            user: user ?? null,
          });

          toast.success("Signed Up Successfully!");
          return true;
        } catch (err) {
          set(useAuth.getInitialState());
          toast.error("Signup failed");
          return false;
        }
      },

      loginWithGoogle: async () => {
        try {
          await authClient.signIn.social({
            provider: "google",
          });
        } catch (err) {
          toast.error("Google login failed");
          throw err;
        }
      },

      setUser: (user) => {
        set({ user });
      },

      logout: async () => {
        try {
          await authClient.signOut();
        } catch (err) {
          console.error(err);
        }

        set(useAuth.getInitialState());
      },
    }),
    {
      name: "auth-storage",
      storage,
    },
  ),
);
