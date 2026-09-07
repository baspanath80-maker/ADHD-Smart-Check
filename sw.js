const CACHE_NAME = 'adhd-smart-check-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/192.png',
  './icons/512.png'
];

// ติดตั้ง Service Worker และดึงไฟล์ลง Cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// จัดการลบ Cache เก่าเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// ดึงข้อมูลจาก Cache มาแสดงผลเมื่อออฟไลน์
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // หากเจอไฟล์ใน Cache ให้ส่งกลับไป
        if (response) {
          return response;
        }
        // หากไม่เจอ ให้ไปดึงจาก Network
        return fetch(event.request);
      })
  );
});
