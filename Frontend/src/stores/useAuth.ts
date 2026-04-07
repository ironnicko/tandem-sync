import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthStore, storage, UserState } from "./types";
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
          let authToken: string | null = null;

          const { data: authData, error } = await authClient.signIn.email({
            email,
            password,
            fetchOptions: {
              onSuccess: (ctx) => {
                authToken = ctx.response.headers.get("set-auth-token");
              },
            },
          });

          if (error || !authData?.user) {
            toast.error(error?.message || "Login failed");
            return false;
          }

          const user = {
            ...authData.user,
          };

          set({
            accessToken: authToken,
            refreshToken: null,
            isAuthenticated: true,
            user,
          });

          toast.success("Signed In Successfully!");
          return true;
        } catch (err) {
          console.error(err);

          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            user: null,
          });

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

          if (error || !data?.user) {
            toast.error(error?.message || "Signup failed");
            return false;
          }

          const user = {
            ...data.user,
          };

          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: true,
            user,
          });

          toast.success("Signed Up Successfully!");
          return true;
        } catch (err) {
          console.error(err);

          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            user: null,
          });

          toast.error("Signup failed");
          return false;
        }
      },

      loginWithGoogle: async (redirect) => {
        try {
          await authClient.signIn.social({
            provider: "google",
            callbackURL: window.location.origin + redirect,
          });
        } catch (err) {
          console.error(err);
          toast.error("Google login failed");

          set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            user: null,
          });

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

        const { useSocket } = await import("./useSocket");
        useSocket.getState().disconnect();

        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          user: null,
        });
      },
    }),
    {
      name: "auth-storage",
      storage,
    },
  ),
);
