// cms-strapi/config/api.ts
export default ({ env }: { env: (key: string, fallback?: string) => string }) => ({
  rest: {
    maxLimit: 250,
    defaultLimit: 25,
    withCount: true,
  },
});
