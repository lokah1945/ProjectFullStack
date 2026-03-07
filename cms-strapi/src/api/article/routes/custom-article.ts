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
    {
      method: 'POST',
      path: '/articles/:documentId/view',
      handler: 'custom-article.recordView',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/articles/trending',
      handler: 'custom-article.trending',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/articles/featured',
      handler: 'custom-article.featured',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
