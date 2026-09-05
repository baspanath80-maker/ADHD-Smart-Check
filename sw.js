const CACHE_NAME = "adhd-smart-check-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./180.png",
  "./192.png",
  "./512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {

      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(response => {

        if (
          !response ||
          response.status !== 200 ||
          response.type !== "basic"
        ) {
          return response;
        }

        const responseClone =
          response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(
            event.request,
            responseClone
          );
        });

        return response;

      }).catch(() => {

        return caches.match("./index.html");

      });

    })
  );

});
