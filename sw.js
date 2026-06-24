/* DISTRIVIA Workspace — Service Worker (PWA)
   À placer dans le MÊME dépôt que l'index.html du Workspace. */
const CACHE = "distrivia-ws-v2";
const SHELL = ["./", "index.html"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(()=>{}));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Laisser passer Firebase / Google (temps réel) directement au réseau
  if (/firebaseio|googleapis|gstatic|firebaseapp|google\.com/.test(url.hostname)) return;
  // Réseau d'abord, cache en secours (utile hors-ligne)
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("index.html")))
  );
});
