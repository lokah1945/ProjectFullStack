// cms-strapi/src/api/health/controllers/health.ts
export default {
  async check(ctx: any) {
    return ctx.send({
      status: 'ok',
      timestamp: Date.now(),
    });
  },
};
