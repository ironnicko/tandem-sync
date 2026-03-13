const TARGET_URL = "https://nikhilivannan.live"; // your app URL

self.addEventListener("push", async function (event) {
  if (!event.data) return;

  const data = event.data.json();

  // Check if any client (tab) is already focused on your app
  const clientList = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  const isAppInFocus = clientList.some(
    (client) => client.focused
  );

  // If app is open and focused, skip showing notification
  if (isAppInFocus) {
    return;
  }

  // Otherwise, show notification
  const options = {
    body: data.body,
    icon: data.icon || "/icon.png",
    badge: "/badge.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: TARGET_URL,
      primaryKey: data.primaryKey || "1",
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data.url || TARGET_URL;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
