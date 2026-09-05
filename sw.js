const CACHE_NAME = "adhd-smart-screen-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache =>
        cache.addAll(APP_FILES)
      )
      .then(() =>
        self.skipWaiting()
      )

  );

});

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys =>

        Promise.all(

          keys
            .filter(
              key => key !== CACHE_NAME
            )
            .map(
              key => caches.delete(key)
            )

        )

      )
      .then(() =>
        self.clients.claim()
      )

  );

});

self.addEventListener("fetch", event => {

  event.respondWith(

    caches.match(event.request)
      .then(cached => {

        if(cached){
          return cached;
        }

        return fetch(event.request)
          .then(response => {

            if(
              !response ||
              response.status !== 200
            ){

              return response;

            }

            const copy =
              response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  event.request,
                  copy
                );

              });

            return response;

          })
          .catch(() =>
            caches.match("./index.html")
          );

      })

  );

});
