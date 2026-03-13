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
  const { subscribeUser, unsubscribeUser } = useUserSubscription();

  const subscription = user?.pushSubscription ?? null;

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

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
  }

  async function unsubscribeFromPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();

    await Promise.allSettled([sub?.unsubscribe(), unsubscribeUser()]);
  }

  async function sendTestNotification() {
    if (!subscription) return;
    await sendNotification(subscription, message);
    setMessage("");
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  if (!subscription)
    return (
      <>
        <p className="text-gray-600">
          You are not subscribed to push notifications.
        </p>

        <button
          onClick={subscribeToPush}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          Subscribe
        </button>
      </>
    );

  // return (
  //   <>
  //     <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
  //       <button
  //         onClick={unsubscribeFromPush}
  //         className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition"
  //       >
  //         Unsubscribe
  //       </button>

  //       <button
  //         onClick={sendTestNotification}
  //         className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
  //       >
  //         Send Test
  //       </button>
  //     </div>

  //     <div className="flex flex-col items-center gap-2 mt-4">
  //       <input
  //         type="text"
  //         placeholder="Enter notification message"
  //         value={message}
  //         onChange={(e) => setMessage(e.target.value)}
  //         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
  //       />
  //     </div>
  //   </>
  // );
}
