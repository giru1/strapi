export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'db.web.orgma.ru'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  proxy: env.bool('PROXY', false),
});
