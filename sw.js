// sw.js
const CACHE_NAME = "adhd-smart-check-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

// ติดตั้ง Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

// เปิดใช้งาน Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );

  self.clients.claim();
});

// ดักการเรียกไฟล์จากเว็บไซต์
self.addEventListener("fetch", (event) => {
  // ไม่ดัก API
  if (
    event.request.url.includes("generativelanguage.googleapis.com") ||
    event.request.url.includes("/api/")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // เก็บเฉพาะ response ที่ใช้งานได้
          if (
            response &&
            response.status === 200 &&
            response.type === "basic"
          ) {
            const responseClone = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // หากไม่มีอินเทอร์เน็ต ให้กลับหน้า index
          return caches.match("./index.html");
        });
    })
  );
});

// รับคำสั่งจากหน้าเว็บสำหรับอัปเดต Cache
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});