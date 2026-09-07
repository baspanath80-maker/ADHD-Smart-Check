// sw.js - Service Worker สำหรับ ADHD Smart Check (SNAP-IV)
const CACHE_NAME = 'adhd-smart-check-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/192.png',
  './icons/512.png',
  'https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 1. Install Event - บันทึก Cache ไฟล์ที่จำเป็นสำหรับ Offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event - ลบ Cache เก่าที่ไม่ได้ใช้
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event - ดึงข้อมูลจาก Cache เมื่ออยู่ในโหมด Offline (Network First with Cache Fallback)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ถ้าเชื่อมต่อเน็ตได้ ให้บันทึกข้อมูลอัปเดตลง Cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // ถ้าไม่มีเน็ต ให้ไปดึงไฟล์จาก Cache มาแสดงแทน
        return caches.match(event.request);
      })
  );
});
