export default ({ env }) => ({
    enabled: true,
    origin: [
        'https://db.web.orgma.ru',
        'http://db.web.orgma.ru',

        'http://localhost:1337',
        'http://10.1.30.17:1337',

        'http://10.1.30.17:9000',
        'http://localhost:9000',

        'http://10.1.30.17:9001',
        'http://10.1.30.17:9001'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    keepHeadersOnError: true,
});