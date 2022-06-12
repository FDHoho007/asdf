const cacheVersion = "01";
const assets = [
    "/",
    "/assets/manifest.json",
    "/assets/css/app.css",
    "/assets/js/app.js",
    "/assets/js/browser.js",
    "/assets/js/utils.js",
    "/assets/icons/android-icon-36x36.png",
    "/assets/icons/android-icon-48x48.png",
    "/assets/icons/android-icon-72x72.png",
    "/assets/icons/android-icon-96x96.png",
    "/assets/icons/android-icon-144x144.png",
    "/assets/icons/android-icon-192x192.png",
    "/assets/icons/apple-icon.png",
    "/assets/icons/apple-icon-57x57.png",
    "/assets/icons/apple-icon-60x60.png",
    "/assets/icons/apple-icon-72x72.png",
    "/assets/icons/apple-icon-76x76.png",
    "/assets/icons/apple-icon-114x114.png",
    "/assets/icons/apple-icon-120x120.png",
    "/assets/icons/apple-icon-144x144.png",
    "/assets/icons/apple-icon-152x152.png",
    "/assets/icons/apple-icon-180x180.png",
    "/assets/icons/apple-icon-precomposed.png",
    "/assets/icons/favicon.ico",
    "/assets/icons/favicon-16x16.png",
    "/assets/icons/favicon-32x32.png",
    "/assets/icons/favicon-96x96.png",
    "/assets/icons/ms-icon-70x70.png",
    "/assets/icons/ms-icon-144x144.png",
    "/assets/icons/ms-icon-150x150.png",
    "/assets/icons/ms-icon-310x310.png",
];

function formatNumber(number, digitCount) {
    while (digitCount > ("" + number).length)
        number = "0" + number;
    return number;
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

self.addEventListener('install', (e) => {
    e.waitUntil((async () => {
        const assetsCache = await caches.open("assets-v" + cacheVersion);
        await assetsCache.addAll(assets);
        let media = [];
        for (let i = 0; i < await (await fetch("/clips/count")).text(); i++) {
            let meta = await (await fetch("/clips/" + formatNumber(i, 2) + "/meta.json")).json();
            for (let lang of Object.keys(meta))
                for (let j of Object.keys(meta[lang])) {
                    media.push("/clips/" + formatNumber(i, 2) + "/" + lang + "/" + j + ".mp4");
                    media.push("/clips/" + formatNumber(i, 2) + "/" + j + ".webp");
                }
        }
        media = media.filter(onlyUnique);
        const mediaCache = await caches.open("media-v" + cacheVersion);
        await mediaCache.addAll(media);
    })());
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(async () => {
        if ("navigationPreload" in self.registration) await self.registration.navigationPreload.enable();
        // Delete all old caches
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                let m;
                // check if cache matches version number
                if ((m = key.match(/^(assets|media)-v(\d{2})$/)) && m[2] === cacheVersion)
                    return;
                return caches.delete(key);
            }))
        })
    });
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith((async () => {
        let cachedResponse = await caches.match(e.request);
        if (e.request.headers.get('range')) {
            if (cachedResponse) {
                let pos = Number(/^bytes\=(\d+)\-$/g.exec(e.request.headers.get('range'))[1]);
                let ab = await cachedResponse.arrayBuffer();
                return new Response(ab.slice(pos), {
                    status: 206, statusText: 'Partial Content', headers: [// ['Content-Type', 'video/webm'],
                        ['Content-Range', 'bytes ' + pos + '-' + (ab.byteLength - 1) + '/' + ab.byteLength]]
                });
            }
        } else {
            if (cachedResponse) return cachedResponse;
            else if (e.request.url.startsWith("https://asdf.fdhoho007.de/?")) {
                cachedResponse = await caches.match("/");
                if (cachedResponse) return cachedResponse;
            }
        }
        const response = await e.preloadResponse;
        if (response) return response;
        return fetch(e.request);
    })());
});
