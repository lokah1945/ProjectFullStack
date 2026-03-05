// cms-strapi/src/api/article/controllers/custom-article.ts
export default {
  async search(ctx: any) {
    const {
      site: siteSlug,
      q,
      locale = 'en',
      page: pageStr = '1',
      pageSize: pageSizeStr = '10',
    } = ctx.query as {
      site?: string;
      q?: string;
      locale?: string;
      page?: string;
      pageSize?: string;
    };

    if (!q || !q.trim()) {
      return ctx.badRequest('Missing search query parameter: q');
    }

    const page = Math.max(1, parseInt(pageStr, 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(pageSizeStr, 10) || 10));
    const start = (page - 1) * pageSize;

    const filters: any = {
      $or: [
        { title: { $containsi: q } },
        { excerpt: { $containsi: q } },
      ],
    };

    if (siteSlug) {
      filters.site = { slug: { $eq: siteSlug } };
    }

    const [items, total] = await Promise.all([
      strapi.documents('api::article.article').findMany({
        filters,
        limit: pageSize,
        start,
        status: 'published',
        locale,
        populate: ['site', 'category', 'author', 'tags', 'coverImage'],
      }),
      strapi.documents('api::article.article').count({
        filters,
        status: 'published',
        locale,
      }),
    ]);

    const pageCount = Math.ceil(total / pageSize);

    return ctx.send({
      data: items,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount,
          total,
        },
      },
    });
  },
};
