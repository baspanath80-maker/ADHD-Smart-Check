const CACHE_NAME = "adhd-smart-check-v1";

// รายการไฟล์ที่ต้องการ Caching ไว้ใช้แบบ Offline
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/180.png",
  "./icons/192.png",
  "./icons/512.png",
  // External CDNs (Font / Icons)
  "https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
];

// 1. INSTALL EVENT: ทำการ Cache ไฟล์ที่จำเป็นไว้ล่วงหน้า
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell & assets");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE EVENT: ลบ Cache เก่าที่ไม่ใช้งานแล้วออกเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH EVENT: ดึงข้อมูลจาก Cache ก่อน หากไม่มีเครือข่าย หรือโหลดใหม่หากมีอินเทอร์เน็ต (Network First with Cache Fallback)
self.addEventListener("fetch", (event) => {
  // ข้ามการทำ Cache สำหรับ Request ที่ไม่ใช่ GET
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // หากเชื่อมต่อเน็ตได้ ให้อัปเดต Cache ล่าสุดไว้เสมอ
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // หากไม่มีอินเทอร์เน็ต ให้ดึงข้อมูลจาก Cache มาแสดงผลแทน
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // กรณีเข้าหน้าหลักตอนไม่มีเน็ต
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
      })
  );
});
