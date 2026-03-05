// cms-strapi/src/api/site/controllers/custom-site.ts
export default {
  async findByDomain(ctx: any) {
    const { domain } = ctx.query as { domain?: string };

    if (!domain) {
      return ctx.badRequest('Missing domain query parameter');
    }

    const sites = await strapi.documents('api::site.site').findMany({
      populate: ['categories'],
    });

    const site = sites.find((s: any) => {
      const domains: string[] = Array.isArray(s.domains) ? s.domains : [];
      return domains.includes(domain);
    });

    if (!site) {
      return ctx.notFound(`No site found for domain: ${domain}`);
    }

    return ctx.send({
      data: {
        documentId: site.documentId,
        name: site.name,
        slug: site.slug,
        domains: site.domains,
        defaultLocale: site.defaultLocale,
        enabled: site.enabled,
        theme: site.theme,
        navConfig: site.navConfig,
        seoDefaults: site.seoDefaults,
        description: site.description,
      },
    });
  },
};
