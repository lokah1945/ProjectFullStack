// cms-strapi/src/admin/app.tsx
import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['en', 'id'],
  },
  bootstrap(app: StrapiApp) {
    // Additional admin bootstrap configuration
  },
};
