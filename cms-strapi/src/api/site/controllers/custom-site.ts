// cms-strapi/src/api/site/controllers/custom-site.ts
export default {
  async findByDomain(ctx: any) {
    const { domain } = ctx.query as { domain?: string };

    if (!domain) {
      return ctx.badRequest('Missing domain query parameter');
    }

    const sites = await strapi.documents('api::site.site').findMany({
      populate: ['categories', 'logo', 'favicon', 'ogImage'],
    });

    const site = sites.find((s: any) => {
      const domains: string[] = Array.isArray(s.domains) ? s.domains : [];
      return domains.includes(domain);
    });

    if (!site) {
      return ctx.notFound(`No site found for domain: ${domain}`);
    }

    // Helper: extract media URL from populated Strapi media field
    const mediaUrl = (field: any): string | null => {
      if (!field) return null;
      // Strapi v5 media populate returns object with url
      if (typeof field === 'object' && field.url) return field.url;
      return null;
    };

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
        headCode: site.headCode,
        bodyCode: site.bodyCode,
        logo: site.logo ? { url: mediaUrl(site.logo), alternativeText: site.logo.alternativeText ?? null, width: site.logo.width ?? null, height: site.logo.height ?? null } : null,
        favicon: site.favicon ? { url: mediaUrl(site.favicon), alternativeText: site.favicon.alternativeText ?? null, width: site.favicon.width ?? null, height: site.favicon.height ?? null } : null,
        ogImage: site.ogImage ? { url: mediaUrl(site.ogImage), alternativeText: site.ogImage.alternativeText ?? null, width: site.ogImage.width ?? null, height: site.ogImage.height ?? null } : null,
      },
    });
  },
};
