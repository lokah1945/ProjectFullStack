// cms-strapi/src/api/article/controllers/custom-article.ts
// Custom endpoints: search, record-view, trending, featured

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export default {
  /**
   * GET /api/articles/search
   * Full-text search across article title + excerpt
   */
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

  /**
   * POST /api/articles/:documentId/view
   * Records a page view for the given article.
   * Rate-limited: max 1 view per IP per article per 5 minutes.
   */
  async recordView(ctx: any) {
    const { documentId } = ctx.params as { documentId: string };

    if (!documentId) {
      return ctx.badRequest('Missing documentId');
    }

    // Verify article exists
    const article = await strapi.documents('api::article.article').findOne({
      documentId,
      fields: ['id', 'title'],
    });

    if (!article) {
      return ctx.notFound('Article not found');
    }

    const ip = (ctx.request.ip || ctx.ip || 'unknown') as string;
    const userAgent = (ctx.request.headers?.['user-agent'] || '') as string;
    const now = new Date();

    // Rate limit: check if same IP viewed this article in last 5 minutes
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const recentViews = await strapi.db.query('api::article-view.article-view').findMany({
      where: {
        article: { documentId },
        ip,
        viewedAt: { $gte: fiveMinAgo.toISOString() },
      },
      limit: 1,
    });

    if (recentViews && recentViews.length > 0) {
      return ctx.send({ data: { recorded: false, reason: 'rate_limited' } });
    }

    // Record the view
    await strapi.documents('api::article-view.article-view').create({
      data: {
        article: { documentId },
        viewedAt: now.toISOString(),
        ip,
        userAgent: userAgent.substring(0, 255),
      },
    });

    return ctx.send({ data: { recorded: true } });
  },

  /**
   * GET /api/articles/trending
   * Returns articles sorted by view velocity (avg views/hour) in last 3 days.
   * Query: ?site=<siteSlug>&limit=6&locale=en
   */
  async trending(ctx: any) {
    const {
      site: siteSlug,
      limit: limitStr = '6',
      locale = 'en',
    } = ctx.query as {
      site?: string;
      limit?: string;
      locale?: string;
    };

    const limit = Math.min(20, Math.max(1, parseInt(limitStr, 10) || 6));
    const threeDaysAgo = new Date(Date.now() - THREE_DAYS_MS);

    // Raw SQL for view velocity: count views / hours elapsed, grouped by article
    // Using knex from Strapi's database connection
    const knex = strapi.db.connection;

    // Build the query:
    // 1. Count views per article in last 3 days
    // 2. Calculate hours elapsed = 72 (3 days)
    // 3. velocity = view_count / 72
    // 4. Order by velocity DESC
    const hoursInWindow = 72;

    let viewsQuery = knex('article_views')
      .select('article_id')
      .count('* as view_count')
      .where('viewed_at', '>=', threeDaysAgo.toISOString())
      .groupBy('article_id')
      .orderByRaw('count(*) DESC')
      .limit(limit * 3); // fetch extra to filter by site later

    const viewRows: Array<{ article_id: number; view_count: string }> =
      await viewsQuery;

    if (!viewRows || viewRows.length === 0) {
      // Fallback: return latest published articles if no views yet
      return await this._fallbackArticles(ctx, siteSlug, limit, locale, 'publishedAt:desc');
    }

    // Get article documentIds from the view results
    const articleIds = viewRows.map((r) => r.article_id);

    // Fetch articles with those IDs
    const articles = await strapi.documents('api::article.article').findMany({
      filters: {
        id: { $in: articleIds },
        ...(siteSlug ? { site: { slug: { $eq: siteSlug } } } : {}),
      },
      status: 'published',
      locale,
      populate: ['site', 'category', 'author', 'tags', 'coverImage'],
      limit: limit * 2,
    });

    // Sort articles by view velocity (matching the order from SQL)
    const articleMap = new Map(articles.map((a: any) => [a.id, a]));
    const sorted: any[] = [];
    for (const row of viewRows) {
      const art = articleMap.get(row.article_id);
      if (art && sorted.length < limit) {
        const velocity = Number(row.view_count) / hoursInWindow;
        (art as any)._viewCount = Number(row.view_count);
        (art as any)._velocity = Math.round(velocity * 100) / 100;
        sorted.push(art);
      }
    }

    // If not enough results, pad with latest
    if (sorted.length < limit) {
      const existingIds = new Set(sorted.map((a: any) => a.documentId));
      const padding = await strapi.documents('api::article.article').findMany({
        filters: {
          documentId: { $notIn: Array.from(existingIds) },
          ...(siteSlug ? { site: { slug: { $eq: siteSlug } } } : {}),
        },
        status: 'published',
        locale,
        populate: ['site', 'category', 'author', 'tags', 'coverImage'],
        sort: 'publishedAt:desc' as any,
        limit: limit - sorted.length,
      });
      sorted.push(...padding);
    }

    return ctx.send({
      data: sorted.slice(0, limit),
      meta: {
        pagination: { page: 1, pageSize: limit, pageCount: 1, total: sorted.length },
        windowHours: hoursInWindow,
      },
    });
  },

  /**
   * GET /api/articles/featured
   * Returns articles with most total views in last 3 days.
   * Query: ?site=<siteSlug>&limit=5&locale=en
   */
  async featured(ctx: any) {
    const {
      site: siteSlug,
      limit: limitStr = '5',
      locale = 'en',
    } = ctx.query as {
      site?: string;
      limit?: string;
      locale?: string;
    };

    const limit = Math.min(20, Math.max(1, parseInt(limitStr, 10) || 5));
    const threeDaysAgo = new Date(Date.now() - THREE_DAYS_MS);

    const knex = strapi.db.connection;

    const viewRows: Array<{ article_id: number; view_count: string }> =
      await knex('article_views')
        .select('article_id')
        .count('* as view_count')
        .where('viewed_at', '>=', threeDaysAgo.toISOString())
        .groupBy('article_id')
        .orderByRaw('count(*) DESC')
        .limit(limit * 3);

    if (!viewRows || viewRows.length === 0) {
      return await this._fallbackArticles(ctx, siteSlug, limit, locale, 'publishedAt:desc');
    }

    const articleIds = viewRows.map((r) => r.article_id);

    const articles = await strapi.documents('api::article.article').findMany({
      filters: {
        id: { $in: articleIds },
        ...(siteSlug ? { site: { slug: { $eq: siteSlug } } } : {}),
      },
      status: 'published',
      locale,
      populate: ['site', 'category', 'author', 'tags', 'coverImage'],
      limit: limit * 2,
    });

    const articleMap = new Map(articles.map((a: any) => [a.id, a]));
    const sorted: any[] = [];
    for (const row of viewRows) {
      const art = articleMap.get(row.article_id);
      if (art && sorted.length < limit) {
        (art as any)._viewCount = Number(row.view_count);
        sorted.push(art);
      }
    }

    if (sorted.length < limit) {
      const existingIds = new Set(sorted.map((a: any) => a.documentId));
      const padding = await strapi.documents('api::article.article').findMany({
        filters: {
          documentId: { $notIn: Array.from(existingIds) },
          ...(siteSlug ? { site: { slug: { $eq: siteSlug } } } : {}),
        },
        status: 'published',
        locale,
        populate: ['site', 'category', 'author', 'tags', 'coverImage'],
        sort: 'publishedAt:desc' as any,
        limit: limit - sorted.length,
      });
      sorted.push(...padding);
    }

    return ctx.send({
      data: sorted.slice(0, limit),
      meta: {
        pagination: { page: 1, pageSize: limit, pageCount: 1, total: sorted.length },
        windowDays: 3,
      },
    });
  },

  /**
   * Fallback: return latest articles when no view data exists yet.
   */
  async _fallbackArticles(ctx: any, siteSlug: string | undefined, limit: number, locale: string, sort: string) {
    const articles = await strapi.documents('api::article.article').findMany({
      filters: siteSlug ? { site: { slug: { $eq: siteSlug } } } : {},
      status: 'published',
      locale,
      populate: ['site', 'category', 'author', 'tags', 'coverImage'],
      sort: sort as any,
      limit,
    });

    return ctx.send({
      data: articles,
      meta: {
        pagination: { page: 1, pageSize: limit, pageCount: 1, total: articles.length },
        fallback: true,
      },
    });
  },
};
