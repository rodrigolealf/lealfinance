// Service worker mínimo, só para o Chrome/Android considerarem o app "instalável".
// De propósito NÃO guarda cache agressivo — sempre busca da rede primeiro.
// Isso evita repetir o problema de versão antiga presa em cache que já tivemos.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
