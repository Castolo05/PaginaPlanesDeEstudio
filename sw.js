// Service worker: permite abrir la página sin conexión.
// Estrategia "primero la red": si hay internet siempre se usa la versión más
// nueva (así los cambios se ven enseguida); si no hay, se usa la copia guardada.
// Al cambiar la lista de archivos, subir el número de VERSION.
const VERSION = 'pefce-v2.2.1';
const ARCHIVOS = [
    './',
    'index.html',
    'careers.json',
    'manifest.webmanifest',
    'css/styles.css',
    'js/app.js',
    'js/config.js',
    'js/reglas.js',
    'js/almacenamiento.js',
    'js/pdf.js',
    'LibreriasJS/jspdf.umd.min.js',
    'LibreriasJS/jspdf.plugin.autotable.js',
    'media/icono.ico',
    'media/enlace.png',
    'media/comunicarse.png',
    'media/modo_claro.png',
    'media/modo_oscuro.png',
    'media/pregunta.png',
    'media/iconos/icono-192.png',
];

self.addEventListener('install', (evento) => {
    evento.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (evento) => {
    evento.waitUntil(
        caches.keys()
            .then((claves) => Promise.all(claves.filter((c) => c !== VERSION).map((c) => caches.delete(c))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (evento) => {
    const { request } = evento;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
    // El video del tutorial usa pedidos parciales (Range): lo dejamos pasar directo
    if (request.headers.has('range')) return;

    evento.respondWith(
        fetch(request)
            .then((respuesta) => {
                if (respuesta.ok) {
                    const copia = respuesta.clone();
                    caches.open(VERSION).then((cache) => cache.put(request, copia));
                }
                return respuesta;
            })
            .catch(() =>
                caches.match(request, { ignoreSearch: true }).then(
                    (r) => r || (request.mode === 'navigate' ? caches.match('index.html') : Response.error())
                )
            )
    );
});
