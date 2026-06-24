/* DISTRIVIA Workspace — Service Worker (PWA)
   Permet l'installation comme application et un fonctionnement de base hors-ligne. */
const CACHE = "distrivia-ws-v1";
const SHELL = ["index.html", "index.html", "index.html"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.filter(Boolean))).catch(()=>{}));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Ne pas intercepter Firebase / Google (temps réel) — laisser passer au réseau
  const url = new URL(req.url);
  if (/firebaseio|googleapis|gstatic|firebaseapp|google\.com/.test(url.hostname)) return;
  // Réseau d'abord, cache en secours (utile hors-ligne)
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("workspace.html")))
  );
});
