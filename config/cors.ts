export default ({ env }) => ({
    enabled: true,
    origin: ['*'], // ← временно разрешить все
    methods: ['*'],
    headers: ['*'],
    keepHeadersOnError: true,
    credentials: true
});