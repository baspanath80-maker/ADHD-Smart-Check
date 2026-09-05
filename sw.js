const CACHE_NAME = "adhd-smart-v1";

const FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./18.png",
    "./19.png",
    "./5.png"
];

/* =====================================================
   INSTALL
===================================================== */

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(

        caches
            .open(CACHE_NAME)
            .then(cache => cache.addAll(FILES))

    );

});


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches
            .keys()
            .then(keys =>

                Promise.all(

                    keys
                        .filter(key =>
                            key !== CACHE_NAME
                        )
                        .map(key =>
                            caches.delete(key)
                        )

                )

            )
            .then(() =>
                self.clients.claim()
            )

    );

});


/* =====================================================
   FETCH
===================================================== */

self.addEventListener("fetch", event => {

    event.respondWith(

        fetch(event.request)

            .then(networkResponse => {

                if (
                    networkResponse &&
                    networkResponse.status === 200
                ) {

                    const responseToCache =
                        networkResponse.clone();

                    caches
                        .open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                event.request,
                                responseToCache
                            );

                        });

                }

                return networkResponse;

            })

            .catch(() => {

                return caches.match(
                    event.request
                );

            })

    );

});
