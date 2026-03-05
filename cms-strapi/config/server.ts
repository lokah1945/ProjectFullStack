// cms-strapi/config/server.ts
export default ({ env }: { env: (key: string, fallback?: string) => string }) => ({
  host: env('HOST', '0.0.0.0'),
  port: Number(env('PORT', '3200')),
  app: {
    keys: env('APP_KEYS', '').split(','),
  },
  webhooks: {
    populateRelations: env('WEBHOOKS_POPULATE_RELATIONS', 'false') === 'true',
  },
});
