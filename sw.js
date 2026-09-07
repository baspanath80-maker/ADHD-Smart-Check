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


// ติดตั้งและบังคับใช้ทันที
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

// ลบ Cache เวอร์ชันเก่าออกทั้งหมด
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ดึงข้อมูลจาก Network ก่อน ถ้าไม่มีอินเทอร์เน็ตค่อยดึงจาก Cache
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
