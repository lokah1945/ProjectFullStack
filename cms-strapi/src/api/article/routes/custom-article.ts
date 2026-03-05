// cms-strapi/src/api/article/routes/custom-article.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/articles/search',
      handler: 'custom-article.search',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
