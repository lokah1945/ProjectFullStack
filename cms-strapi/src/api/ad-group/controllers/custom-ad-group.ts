// cms-strapi/src/api/ad-group/controllers/custom-ad-group.ts
// Custom controller: fetch all enabled ad groups for a specific site slug.
// Uses Document Service API (R2.1) with proper manyToMany populate.
// Pattern matches custom-site.ts (proven working).
export default {
  async findBySite(ctx: any) {
    const { site: siteSlug } = ctx.query as { site?: string };

    if (!siteSlug) {
      return ctx.badRequest('Missing site query parameter');
    }

    try {
      // Fetch ALL ad groups with sites populated (Document Service returns array directly — R2.2)
      const allGroups = await strapi.documents('api::ad-group.ad-group').findMany({
        populate: {
          sites: {
            fields: ['documentId', 'slug', 'name'],
          },
        },
        limit: 100,
      } as any);

      // Filter in JS: only enabled groups that are linked to the requested site slug
      const filtered = (allGroups as any[]).filter((group: any) => {
        if (!group.enabled) return false;
        if (!group.sites || !Array.isArray(group.sites)) return false;
        return group.sites.some((s: any) => s.slug === siteSlug);
      });

      // Return in standard Strapi REST format
      return ctx.send({
        data: filtered.map((group: any) => ({
          documentId: group.documentId,
          name: group.name,
          enabled: group.enabled,
          headerBanner: group.headerBanner,
          footerBanner: group.footerBanner,
          sidebarBanner: group.sidebarBanner,
          inArticleBanner: group.inArticleBanner,
          inArticleNative: group.inArticleNative,
          betweenListBanner: group.betweenListBanner,
          stickyBottom: group.stickyBottom,
          sites: group.sites,
        })),
      });
    } catch (err) {
      strapi.log.error('ad-group findBySite error:', err);
      return ctx.internalServerError('Failed to fetch ad groups');
    }
  },
};
