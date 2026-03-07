// cms-strapi/src/api/ad-group/routes/custom-ad-group.ts
// Custom route for fetching ad groups by site slug — reliable manyToMany filter
// Separated from core router per R2.7
export default {
  routes: [
    {
      method: 'GET',
      path: '/ad-groups/by-site',
      handler: 'custom-ad-group.findBySite',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
