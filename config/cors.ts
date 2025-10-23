export default ({ env }) => ({
    enabled: true,
    origin: [
        'http://localhost:1337',
        'http://127.0.0.1:1337',
        'http://10.1.30.17:1337',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://10.1.30.17:8000'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
    keepHeadersOnError: true,
    credentials: true
});