"use client";

import { useState, useEffect } from "react";
import { sendNotification } from "@/app/actions";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { useAuth } from "@/stores/useAuth";

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
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [localSubscription, setLocalSubscription] = useState<PushSubscription | null>(null);
  const { subscribeUser, unsubscribeUser } = useUserSubscription();

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setLocalSubscription(sub);
  }

  async function registerServiceWorker() {
    await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  }

  async function subscribeToPush() {
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
  }

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
    return <p>Push notifications are not supported in this browser.</p>;
  }

  if (!localSubscription)
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-gray-600 font-medium">
          Enable notifications on this device to stay updated!
        </p>

        <button
          onClick={subscribeToPush}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          Subscribe Now
        </button>
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-4 w-full">
        <p className="text-green-700 dark:text-green-400 text-sm font-bold flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Notifications Active for this device
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <input
          type="text"
          placeholder="Type a test message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
        />
        
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={sendTestNotification}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            Send Test
          </button>
          
          <button
            onClick={unsubscribeFromPush}
            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold px-4 py-3 rounded-xl transition-all"
          >
            Unsubscribe
          </button>
        </div>
      </div>
    </div>
  );
}
