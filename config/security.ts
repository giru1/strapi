export default ( ) => ({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            'connect-src': ["'self'", 'https:', 'http:'],
            'img-src': [
                "'self'",
                'data:',
                'blob:',
                'http://db.web.orgma.ru',
                'http://s3.web.orgma.ru',
                'assets.orgma.ru'
            ],
            'media-src': [
                "'self'",
                'data:',
                'blob:',
                'http://db.web.orgma.ru',
                'http://s3.web.orgma.ru',
                'assets.orgma.ru'
            ],
            'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            upgradeInsecureRequests: null,
        },
    },
});