module.exports = ({ env }) => (
    [
      "strapi::logger",
      "strapi::errors",
      "strapi::cors",
      "strapi::poweredBy",
      "strapi::query",
      "strapi::body",
      "strapi::session",
      "strapi::favicon",
      "strapi::public",
      {
        name: 'strapi::security',
        config: {
          contentSecurityPolicy: {
            useDefaults: true,
            directives: {
              'connect-src': ["'self'", 'http:'],
              'img-src': [
                "'self'",
                'data:',
                'blob:',
                  'http://localhost',               // ← добавь это
                  'http://localhost/assets.orgma.ru', // ← и это
                  'http://localhost:9000',          // ← если ходишь напрямую на minio
                  'http://localhost:9000/assets.orgma.ru',
                  'https://localhost',               // ← добавь это
                  'https://localhost/assets.orgma.ru', // ← и это
                  'https://localhost:9000',          // ← если ходишь напрямую на minio
                  'https://localhost:9000/assets.orgma.ru'
              ],
              'media-src': [
                "'self'",
                'data:',
                'blob:',
                  'http://localhost',               // ← добавь это
                  'http://localhost/assets.orgma.ru', // ← и это
                  'http://localhost:9000',          // ← если ходишь напрямую на minio
                  'http://localhost:9000/assets.orgma.ru',
                  'https://localhost',               // ← добавь это
                  'https://localhost/assets.orgma.ru', // ← и это
                  'https://localhost:9000',          // ← если ходишь напрямую на minio
                  'https://localhost:9000/assets.orgma.ru'
              ],
              upgradeInsecureRequests: null,
            },
          },
        },
      }
    ]
);