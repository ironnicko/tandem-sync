"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, BellRing } from "lucide-react";
import { sendNotification } from "@/app/actions";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useAuth } from "@/stores/useAuth";
import { useAnnouncerStore } from "@/stores/useAnnoucer";


function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [message, setMessage] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [localSubscription, setLocalSubscription] = useState<PushSubscription | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { user } = useAuth();
  const { pushDismissed, setPushDismissed } = useAnnouncerStore();
  const { subscribeUser, unsubscribeUser } = useUserSubscription();


  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      (async () => {
        await registerServiceWorker();
        await checkSubscription();
        setIsSupported(true);
      })();
    }
  }, []);

  useEffect(() => {
    if (isSupported && (!user.pushSubscriptions || user.pushSubscriptions.length === 0) && !pushDismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, user, pushDismissed]);

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setLocalSubscription(sub);
    if (sub && (!user.pushSubscriptions || user.pushSubscriptions.length === 0)) {
      await subscribeUser(JSON.parse(JSON.stringify(sub)));
    }
  }

  async function registerServiceWorker() {
    await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  }

  async function subscribeToPush() {
    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      const serializedSub = JSON.parse(JSON.stringify(sub));
      await subscribeUser(serializedSub);

      setLocalSubscription(sub);
      setShowPrompt(false);
    } catch (err) {
      console.error("Failed to subscribe:", err);
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false);
    setPushDismissed(true);
  };

  async function unsubscribeFromPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();

    await Promise.allSettled([sub?.unsubscribe(), unsubscribeUser()]);
    setLocalSubscription(null);
  }

  async function sendTestNotification() {
    if (!localSubscription) return;
    const serializedSub = JSON.parse(JSON.stringify(localSubscription));
    await sendNotification(serializedSub, message);
    setMessage("");
  }

  if (!isSupported) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {showPrompt && !localSubscription && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 100, opacity: 0, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 w-[92%] max-w-md pointer-events-none"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:bg-zinc-900/90 dark:border-zinc-800 pointer-events-auto">
              {/* Background Glow */}
              <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl transition-opacity pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute right-3 top-3 rounded-full p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
                    <BellRing className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="flex-1 pr-6 text-left">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Stay Connected
                  </h3>
                  <p className="mt-1 text-sm font-medium leading-snug text-zinc-600 dark:text-zinc-400">
                    Enable push notifications to receive real-time updates on your trips and shared rides.
                  </p>

                  <div className="mt-4">
                    <button
                      onClick={subscribeToPush}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-[0.98]"
                    >
                      <Bell size={16} />
                      Subscribe Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {localSubscription && process.env.NEXT_PUBLIC_MODE === "dev" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4">
          <div className="flex flex-col items-center gap-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-3 w-full">
              <p className="text-green-700 dark:text-green-400 text-xs font-bold flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Notifications Active
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <input
                type="text"
                placeholder="Test message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />

              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  onClick={sendTestNotification}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  Send Test
                </button>

                <button
                  onClick={unsubscribeFromPush}
                  className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-bold px-3 py-2.5 rounded-xl transition-all"
                >
                  Unsubscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
