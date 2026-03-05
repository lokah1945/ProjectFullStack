// cms-strapi/src/api/site/routes/custom-site.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/sites/by-domain',
      handler: 'custom-site.findByDomain',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
