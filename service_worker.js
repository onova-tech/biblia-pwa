const applicationVersion = 'v1.1.2';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(applicationVersion).then(cache => {
      return cache.addAll([
        '/biblia-pwa/index.html',
        '/biblia-pwa/pages/book_selection.html',
        '/biblia-pwa/pages/chapter_read.html',
        '/biblia-pwa/pages/chapter_selection.html',
        '/biblia-pwa/pages/js/book_selection.js',
        '/biblia-pwa/pages/js/chapter_read.js',
        '/biblia-pwa/pages/js/chapter_selection.js',
        '/biblia-pwa/fav/bible.32.png',
        '/biblia-pwa/fav/bible.128.png',
        '/biblia-pwa/fav/bible.512.png',
        '/biblia-pwa/css/styles.css',
        '/biblia-pwa/css/materialize.css',
        '/biblia-pwa/js/materialize.js'
      ]);
    }),
  );

  caches.keys().then(function(cacheNames) {
    for(const cacheName of cacheNames) {
      if(cacheName != applicationVersion){
        console.log("Deletando cache antigo: ", cacheName);
        caches.delete(cacheName);
      }
    }
  });
});

async function fromCacheOrAdd(url, cache){
  let r = cache.match(url);

  if(!r) {
    await cache.add(url);
    r = cache.match(url);
  }
  return r;
}

self.addEventListener("fetch", (e) => {
  e.respondWith(
    (async () => {
      const cache = await caches.open(applicationVersion);
      const url = e.request.url;

      const chapterReadURL = "/biblia-pwa/pages/chapter_read.html";
      const chapterSelectionURL = "/biblia-pwa/pages/chapter_selection.html";

      if(url.includes(chapterReadURL)) {
        return await fromCacheOrAdd(chapterReadURL, cache);
      }

      if(url.includes(chapterSelectionURL)) {
        return await fromCacheOrAdd(chapterSelectionURL, cache);
      }

      const r = await cache.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (r) {
        return r;
      }
      const response = await fetch(e.request);

      if(response.ok) {
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
      }
      return response;
    })(),
  );
});