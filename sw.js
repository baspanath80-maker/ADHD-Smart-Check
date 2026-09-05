const CACHE_NAME = "adhd-smart-check-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./180.png",
  "./192.png",
  "./512.png"
];

// ติดตั้ง Service Worker และบันทึกไฟล์ลง Cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// เคลียร์ Cache เก่าเมื่อมีการอัปเดตเวอร์ชัน
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

// ดึงข้อมูลจาก Cache ก่อน หากไม่มีจึงเรียกจาก Network
self.addEventListener("fetch", event => {
  // ข้ามการทำ Cache สำหรับคำขอที่ไม่ใช่ GET (เช่น POST ไปยัง Google Apps Script)
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then(response => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // หากไม่มีการเชื่อมต่ออินเทอร์เน็ต ให้ส่งหน้า index.html
          return caches.match("./index.html");
        });
    })
  );
});
