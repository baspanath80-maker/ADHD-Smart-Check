const CACHE_NAME = 'adhd-smart-screen-v1';

// รายการไฟล์ที่ต้องการให้ทำ Cache เพื่อใช้งานแบบ Offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// ขั้นตอน Install Service Worker และทำการ Cache ทรัพยากร
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ขั้นตอน Activate เพื่อจัดการลบ Cache เวอร์ชั่นเก่าออก
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ขั้นตอน Fetch ดึงข้อมูลจาก Cache ก่อน หากไม่มีจึงไปดึงผ่าน Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // ตรวจสอบความถูกต้องของ Response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Clone Response เก็บไว้ใน Cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }).catch(() => {
      // สามารถใส่ Offline Page สำรองไว้กรณีเกิดข้อผิดพลาดได้
    })
  );
});
