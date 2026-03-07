// cms-strapi/src/api/ad-group/content-types/ad-group/lifecycles.ts
// Auto-fill empty ad slots with visual placeholder HTML when a new Ad Group is created.
// Each slot gets a "paste your ad code here" placeholder with recommended size info.

// Slot definitions: field name → display label + recommended sizes + default height
const SLOT_DEFAULTS: Record<string, { label: string; size: string; heightField: string; height: number }> = {
  headerBanner:      { label: 'Header Banner',       size: '728×90 | 468×60 | 320×50',    heightField: 'headerBannerHeight',      height: 90  },
  footerBanner:      { label: 'Footer Banner',       size: '728×90 | 468×60 | 320×50',    heightField: 'footerBannerHeight',      height: 90  },
  sidebarBanner:     { label: 'Sidebar Banner',      size: '300×250 | 160×600 | 160×300', heightField: 'sidebarBannerHeight',     height: 250 },
  inArticleBanner:   { label: 'In-Article Banner',   size: '300×250 | 468×60',             heightField: 'inArticleBannerHeight',   height: 250 },
  inArticleNative:   { label: 'In-Article Native',   size: 'Native Ad (auto-size)',         heightField: 'inArticleNativeHeight',   height: 250 },
  betweenListBanner: { label: 'Between-List Banner', size: '728×90 | 468×60 | 320×50',    heightField: 'betweenListBannerHeight', height: 90  },
  stickyBottom:      { label: 'Sticky Bottom',       size: '320×50',                        heightField: 'stickyBottomHeight',      height: 50  },
};

function buildPlaceholder(label: string, size: string): string {
  return `<div style="background:#f8f9fa;display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-family:sans-serif;color:#999;border:1px dashed #ccc;border-radius:4px;padding:8px;text-align:center;">Paste ad code here — ${label} — Recommended: ${size}</div>`;
}

export default {
  beforeCreate(event: { params: { data: Record<string, unknown> } }) {
    const { data } = event.params;

    for (const [fieldName, defaults] of Object.entries(SLOT_DEFAULTS)) {
      // Only fill if the code field is empty/null/undefined
      const currentCode = data[fieldName];
      if (!currentCode || (typeof currentCode === 'string' && currentCode.trim() === '')) {
        data[fieldName] = buildPlaceholder(defaults.label, defaults.size);
      }

      // Set default height if not provided
      const currentHeight = data[defaults.heightField];
      if (currentHeight === null || currentHeight === undefined) {
        data[defaults.heightField] = defaults.height;
      }
    }
  },
};
