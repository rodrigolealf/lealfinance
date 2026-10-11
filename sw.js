// Service worker: sempre tenta a rede primeiro (nunca mostra versão antiga por engano
// enquanto tiver internet — foi exatamente esse problema que já tivemos e corrigimos antes).
// Só usa o que ficou guardado quando a rede falhar de verdade (sem internet) — é isso que
// deixa o app abrir mesmo offline, e os dados (Firestore) sincronizam sozinhos depois.
const CACHE = 'lealfinance-shell-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // só cacheia leitura — escrita (Firestore) nem passa por aqui
  // SEGURANÇA: só o "casco" do app (mesma origem) fica no cache. Respostas de OUTRAS origens — Firestore, Storage
  // (recibos/anexos), Auth, Functions — nunca são guardadas: seriam dados financeiros num cache sem senha.
  if (new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((resposta) => {
        if (resposta && resposta.ok) {
          const copia = resposta.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copia));
        }
        return resposta;
      })
      .catch(() => caches.match(req).then((cacheado) => cacheado || Promise.reject('offline-sem-cache')))
  );
});
