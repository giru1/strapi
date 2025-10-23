export default ({ env }) => ({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            'connect-src': ["'self'", 'https:', 'http:'],
            'img-src': [
                "'self'",
                'data:',
                'blob:',
                'http://localhost:1337',
                'http://10.1.30.17:1337',
                'http://localhost:9000',
                'http://10.1.30.17:9000',
                'assets.orgma.ru'
            ],
            'media-src': [
                "'self'",
                'data:',
                'blob:',
                'http://localhost:1337',
                'http://10.1.30.17:1337',
                'http://localhost:9000',
                'http://10.1.30.17:9000',
                'assets.orgma.ru'
            ],
            'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            'style-src': ["'self'", "'unsafe-inline'"],
            upgradeInsecureRequests: null,
        },
    },
});