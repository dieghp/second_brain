// 2do.cerebro — Service Worker v1
// Place this file at: /public/sw.js

const CACHE = "2do-cerebro-v1";

// ── Install ──────────────────────────────────────────────────────
self.addEventListener("install", (e) => {
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────
self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

// ── Push handler ─────────────────────────────────────────────────
self.addEventListener("push", (e) => {
  let data = { title: "2do.cerebro", body: "Tienes una notificación nueva.", icon: "/favicon.ico", badge: "/favicon.ico", tag: "default" };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch {}

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon  || "/favicon.ico",
      badge:   data.badge || "/favicon.ico",
      tag:     data.tag   || "default",
      data:    data.url   ? { url: data.url } : {},
      actions: data.actions || [],
      vibrate: [100, 50, 100],
      renotify: true,
    })
  );
});

// ── Notification click ───────────────────────────────────────────
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.postMessage({ type: "NOTIFICATION_CLICK", url });
          return;
        }
      }
      clients.openWindow(url);
    })
  );
});

// ── Background sync (future use) ─────────────────────────────────
self.addEventListener("sync", (e) => {
  if (e.tag === "sync-habits") {
    // Future: sync offline habit logs
    console.log("[SW] Background sync: habits");
  }
});
