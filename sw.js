const CACHE_NAME = "adhd-smart-check-v2";

// รายการไฟล์ที่ต้องการให้ Cache ไว้ทันทีที่ติดตั้ง (รวม External CDNs)
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/192.png",
  "./icons/512.png",
  "./icons/180.png",
  "https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
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

// เปิดใช้งานและลบ Cache เก่า
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

// ดักจับการขอข้อมูล (Network / Cache Strategy)
self.addEventListener("fetch", (event) => {
  // ข้ามการทำ Cache สำหรับ API หรือ Google AI
  if (
    event.request.url.includes("generativelanguage.googleapis.com") ||
    event.request.url.includes("/api/")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. ถ้ามีใน Cache ให้ดึงจาก Cache มาใช้ทันที
      if (cachedResponse) {

        return cachedResponse;
      }

      // 2. ถ้าไม่มี ให้ดึงจาก Network แล้วนำไปเก็บบันทึกใน Cache
      return fetch(event.request)
        .then((response) => {
          // ปรับเงื่อนไขให้รองรับทั้ง Response แบบปกติ (basic) และแบบ Cross-Origin (opaque)
          if (
            response &&
            response.status === 200 &&
            (response.type === "basic" || response.type === "cors" || response.type === "opaque")
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // หากไม่มีสัญญาณอินเทอร์เน็ต ให้แสดงหน้า index.html
          return caches.match("./index.html");
        });
    })
  );
});

// รับคำสั่ง Skip Waiting
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
