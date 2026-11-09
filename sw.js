// Smart Fix AI - Service Worker v1
const CACHE = 'smartfix-v1';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  if(e.request.url.includes('supabase.co')) return;
  if(e.request.url.includes('script.google.com')) return;
  e.respondWith(
    caches.match(e.request).then(r=>{
      const net = fetch(e.request).then(res=>{
        if(res.ok && res.type==='basic'){
          const clone = res.clone();
          caches.open(CACHE).then(c=>c.put(e.request, clone));
        }
        return res;
      }).catch(()=>r);
      return r || net;
    })
  );
});

self.addEventListener('notificationclick', e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(list=>{
    if(list.length) return list[0].focus();
    return clients.openWindow('./');
  }));
});
