// Tombstone for Craft Rush's former service worker at this path.
// Keep this file so an existing registration can update, clean up, and retire.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('craftrush-')) await caches.delete(key);
    }
    await self.registration.unregister();
  })());
});

// Deliberately no fetch handler: requests go straight to the network.
