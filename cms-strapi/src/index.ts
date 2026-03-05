// cms-strapi/src/index.ts
// Bootstrap seed — idempotent, runs only if no sites exist

export default {
  async bootstrap({ strapi }: { strapi: any }) {
    // R2.2: findMany returns Document[] directly
    const existingSites = await strapi.documents('api::site.site').findMany({});
    if (existingSites.length > 0) {
      strapi.log.info('[Seed] Data already exists — skipping seed.');
      return;
    }

    strapi.log.info('[Seed] Starting seed...');

    // ─────────────────────────────────────────────
    // CREATE LOCALE 'id' (Indonesian)
    // In Strapi v5, i18n is core. We need to create the locale via the i18n API.
    // ─────────────────────────────────────────────
    try {
      const localeService = strapi.plugin('i18n')?.service('locales');
      if (localeService) {
        const existingLocales = await localeService.find();
        const hasId = existingLocales?.some((l: any) => l.code === 'id');
        if (!hasId) {
          await localeService.create({ code: 'id', name: 'Indonesian' });
          strapi.log.info('[Seed] Created locale: id (Indonesian)');
        } else {
          strapi.log.info('[Seed] Locale id already exists.');
        }
      } else {
        strapi.log.warn('[Seed] i18n locale service not available — skipping locale creation.');
      }
    } catch (err) {
      strapi.log.warn('[Seed] Could not create locale id — it may need to be created manually in admin.');
    }

    // ─────────────────────────────────────────────
    // HELPER: slugify
    // ─────────────────────────────────────────────
    function slugify(text: string): string {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    // ─────────────────────────────────────────────
    // AD CODE HELPERS
    // ─────────────────────────────────────────────
    const adCode = (label: string, slot: string, type = 'banner') =>
      `<div class="ad-placeholder" style="background:#f0f0f0;display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-family:sans-serif;color:#999;min-height:90px;"><span>Ad Unit — ${label} Slot #${slot}</span></div><script>console.log("${type} ad loaded: ${label} ${slot}");</script>`;

    // ─────────────────────────────────────────────
    // STEP 3A: SITES
    // R2.4: draftAndPublish:false → NEVER pass status
    // ─────────────────────────────────────────────
    strapi.log.info('[Seed] Creating sites...');

    const glimpseitSite = await strapi.documents('api::site.site').create({
      data: {
        name: 'GlimpseIt',
        slug: 'glimpseit',
        domains: ['glimpseit.online', 'www.glimpseit.online'],
        defaultLocale: 'en',
        enabled: true,
        theme: {
          logoUrl: '/logos/glimpseit-logo.svg',
          faviconUrl: '/favicons/glimpseit-favicon.ico',
          primaryColor: '#0F4C81',
        },
        navConfig: {
          showLatest: true,
          showFeatured: true,
          showTrending: true,
          maxCategoriesInNav: 6,
        },
        seoDefaults: {
          title: 'GlimpseIt — Smart Navigation in the Financial World',
          description: 'GlimpseIt.online is a leading financial information portal covering stock market analysis, investment recommendations, economic news, and financial literacy — designed to help investors make rational, safe, and profitable decisions.',
          ogImageUrl: '/og/glimpseit-og.jpg',
        },
        description: 'GlimpseIt.online hadir sebagai portal informasi terdepan bagi Anda yang ingin menguasai dinamika pasar modal dan literasi keuangan. Mulai dari berita ekonomi terkini, analisis pasar saham, hingga rekomendasi investasi yang tajam dan berbasis data. Sesuai dengan nama kami, kami menyajikan "glimpse" (sekilas pandang) dan wawasan mendalam yang dirancang untuk membantu investor pemula maupun profesional membuat keputusan finansial yang rasional, aman, dan menguntungkan.',
      },
    });

    const cryptoniceSite = await strapi.documents('api::site.site').create({
      data: {
        name: 'Cryptonice',
        slug: 'cryptonice',
        domains: ['cryptonice.online', 'www.cryptonice.online'],
        defaultLocale: 'en',
        enabled: true,
        theme: {
          logoUrl: '/logos/cryptonice-logo.svg',
          faviconUrl: '/favicons/cryptonice-favicon.ico',
          primaryColor: '#6C3CE1',
        },
        navConfig: {
          showLatest: true,
          showFeatured: true,
          showTrending: true,
          maxCategoriesInNav: 6,
        },
        seoDefaults: {
          title: 'Cryptonice — Your Trusted Crypto Intelligence Hub',
          description: 'Cryptonice.online is a comprehensive crypto education and information gateway covering cryptocurrency markets, blockchain technology, DeFi, NFTs, Web3, and digital wallet security — making crypto accessible for everyone.',
          ogImageUrl: '/og/cryptonice-og.jpg',
        },
        description: 'Cryptonice.online adalah gerbang edukasi dan informasi terlengkap yang mengupas tuntas ekosistem cryptocurrency dan teknologi blockchain. Kami menerjemahkan kompleksitas dunia kripto menjadi informasi yang mudah dipahami oleh siapa saja. Dari update harga koin terbaru, ulasan proyek smart contract, tren DeFi dan NFT, hingga panduan keamanan dompet digital. Tujuan kami adalah mendampingi perjalanan investasi digital Anda agar lebih cerdas, aman, dan memuaskan.',
      },
    });

    const healthSite = await strapi.documents('api::site.site').create({
      data: {
        name: 'Health & Beauty',
        slug: 'healthandbeauty',
        domains: ['healthandbeauty.my.id', 'www.healthandbeauty.my.id'],
        defaultLocale: 'en',
        enabled: true,
        theme: {
          logoUrl: '/logos/healthandbeauty-logo.svg',
          faviconUrl: '/favicons/healthandbeauty-favicon.ico',
          primaryColor: '#D4436C',
        },
        navConfig: {
          showLatest: true,
          showFeatured: true,
          showTrending: true,
          maxCategoriesInNav: 6,
        },
        seoDefaults: {
          title: 'Health & Beauty — Harmony of Inner Wellness and Outer Beauty',
          description: 'Healthandbeauty.my.id is your daily wellness destination dedicated to holistic well-being — covering fitness tips, nutrition, skincare routines, beauty trends, and mental health for a confident and empowered you.',
          ogImageUrl: '/og/healthandbeauty-og.jpg',
        },
        description: 'Healthandbeauty.my.id adalah destinasi gaya hidup harian yang didedikasikan untuk kesejahteraan dan penampilan paripurna Anda. Kami percaya bahwa kecantikan sejati bermula dari tubuh yang sehat. Oleh karena itu, kami menyuguhkan paduan artikel informatif seputar tips kebugaran fisik, nutrisi, rutinitas skincare (perawatan kulit), hingga tren kecantikan terkini. Temukan panduan praktis dan terpercaya di sini untuk tampil percaya diri dan merasa maksimal setiap hari.',
      },
    });

    strapi.log.info('[Seed] Sites created.');

    // ─────────────────────────────────────────────
    // STEP 3B: AUTHORS
    // R2.4: draftAndPublish:false → NEVER pass status
    // ─────────────────────────────────────────────
    strapi.log.info('[Seed] Creating authors...');

    const authorSarah = await strapi.documents('api::author.author').create({
      data: {
        name: 'Sarah Mitchell',
        slug: 'sarah-mitchell',
        bio: 'Award-winning financial journalist with 10+ years covering global markets, investment strategies, and economic policy for leading publications.',
      },
    });

    const authorDavid = await strapi.documents('api::author.author').create({
      data: {
        name: 'David Chen',
        slug: 'david-chen',
        bio: 'Blockchain researcher and tech writer specializing in cryptocurrency ecosystems, DeFi protocols, and Web3 innovations. Former software engineer at a Fortune 500.',
      },
    });

    const authorAmara = await strapi.documents('api::author.author').create({
      data: {
        name: 'Amara Putri',
        slug: 'amara-putri',
        bio: 'Certified nutritionist and beauty editor passionate about holistic wellness, skincare science, and empowering readers to live healthier lives.',
      },
    });

    strapi.log.info('[Seed] Authors created.');

    // ─────────────────────────────────────────────
    // STEP 3C: CATEGORIES — GlimpseIt
    // R2.4: draftAndPublish:true → status: 'published'
    // ─────────────────────────────────────────────
    strapi.log.info('[Seed] Creating categories...');

    const glimpseitCategories: any = {};
    const glimpseitCatData = [
      { name: 'Stock Market', slug: 'stock-market', isInNav: true, navOrder: 1 },
      { name: 'Investing', slug: 'investing', isInNav: true, navOrder: 2 },
      { name: 'Economy', slug: 'economy', isInNav: true, navOrder: 3 },
      { name: 'Personal Finance', slug: 'personal-finance', isInNav: true, navOrder: 4 },
      { name: 'Commodities', slug: 'commodities', isInNav: true, navOrder: 5 },
      { name: 'Forex', slug: 'forex', isInNav: true, navOrder: 6 },
      { name: 'Mutual Funds', slug: 'mutual-funds', isInNav: false, navOrder: null },
      { name: 'Insurance', slug: 'insurance', isInNav: false, navOrder: null },
      { name: 'Retirement', slug: 'retirement', isInNav: false, navOrder: null },
      { name: 'Financial Literacy', slug: 'financial-literacy', isInNav: false, navOrder: null },
    ];
    for (const cat of glimpseitCatData) {
      const created = await strapi.documents('api::category.category').create({
        data: {
          name: cat.name,
          slug: cat.slug,
          isInNav: cat.isInNav,
          navOrder: cat.navOrder,
          site: glimpseitSite.documentId,
        },
        status: 'published',
      });
      glimpseitCategories[cat.slug] = created;
    }

    // Categories — Cryptonice
    const cryptoniceCategories: any = {};
    const cryptoniceCatData = [
      { name: 'Bitcoin', slug: 'bitcoin', isInNav: true, navOrder: 1 },
      { name: 'Altcoins', slug: 'altcoins', isInNav: true, navOrder: 2 },
      { name: 'DeFi', slug: 'defi', isInNav: true, navOrder: 3 },
      { name: 'NFT & Metaverse', slug: 'nft-metaverse', isInNav: true, navOrder: 4 },
      { name: 'Blockchain Tech', slug: 'blockchain-tech', isInNav: true, navOrder: 5 },
      { name: 'Web3', slug: 'web3', isInNav: true, navOrder: 6 },
      { name: 'Trading & Analysis', slug: 'trading-analysis', isInNav: false, navOrder: null },
      { name: 'Regulation', slug: 'regulation', isInNav: false, navOrder: null },
      { name: 'Security', slug: 'security', isInNav: false, navOrder: null },
      { name: 'Crypto Education', slug: 'crypto-education', isInNav: false, navOrder: null },
    ];
    for (const cat of cryptoniceCatData) {
      const created = await strapi.documents('api::category.category').create({
        data: {
          name: cat.name,
          slug: cat.slug,
          isInNav: cat.isInNav,
          navOrder: cat.navOrder,
          site: cryptoniceSite.documentId,
        },
        status: 'published',
      });
      cryptoniceCategories[cat.slug] = created;
    }

    // Categories — Health & Beauty
    const healthCategories: any = {};
    const healthCatData = [
      { name: 'Skincare', slug: 'skincare', isInNav: true, navOrder: 1 },
      { name: 'Fitness', slug: 'fitness', isInNav: true, navOrder: 2 },
      { name: 'Nutrition', slug: 'nutrition', isInNav: true, navOrder: 3 },
      { name: 'Mental Health', slug: 'mental-health', isInNav: true, navOrder: 4 },
      { name: 'Beauty Trends', slug: 'beauty-trends', isInNav: true, navOrder: 5 },
      { name: 'Wellness', slug: 'wellness', isInNav: true, navOrder: 6 },
      { name: 'Hair Care', slug: 'hair-care', isInNav: false, navOrder: null },
      { name: 'Health Conditions', slug: 'health-conditions', isInNav: false, navOrder: null },
      { name: 'Natural Remedies', slug: 'natural-remedies', isInNav: false, navOrder: null },
      { name: 'Product Reviews', slug: 'product-reviews', isInNav: false, navOrder: null },
    ];
    for (const cat of healthCatData) {
      const created = await strapi.documents('api::category.category').create({
        data: {
          name: cat.name,
          slug: cat.slug,
          isInNav: cat.isInNav,
          navOrder: cat.navOrder,
          site: healthSite.documentId,
        },
        status: 'published',
      });
      healthCategories[cat.slug] = created;
    }

    strapi.log.info('[Seed] Categories created.');

    // ─────────────────────────────────────────────
    // STEP 3D: TAGS
    // R2.4: draftAndPublish:true → status: 'published'
    // ─────────────────────────────────────────────
    strapi.log.info('[Seed] Creating tags...');

    const glimpseitTags: any = {};
    const glimpseitTagData = [
      { name: 'Breaking News', slug: 'breaking-news' },
      { name: 'Market Analysis', slug: 'market-analysis' },
      { name: 'Expert Opinion', slug: 'expert-opinion' },
      { name: 'Investment Tips', slug: 'investment-tips' },
      { name: 'Economic Report', slug: 'economic-report' },
    ];
    for (const tag of glimpseitTagData) {
      const created = await strapi.documents('api::tag.tag').create({
        data: { name: tag.name, slug: tag.slug, site: glimpseitSite.documentId },
        status: 'published',
      });
      glimpseitTags[tag.slug] = created;
    }

    const cryptoniceTags: any = {};
    const cryptoniceTagData = [
      { name: 'Breaking News', slug: 'breaking-news-crypto' },
      { name: 'Price Alert', slug: 'price-alert' },
      { name: 'Project Review', slug: 'project-review' },
      { name: 'Tutorial', slug: 'tutorial' },
      { name: 'Market Insight', slug: 'market-insight' },
    ];
    for (const tag of cryptoniceTagData) {
      const created = await strapi.documents('api::tag.tag').create({
        data: { name: tag.name, slug: tag.slug, site: cryptoniceSite.documentId },
        status: 'published',
      });
      cryptoniceTags[tag.slug] = created;
    }

    const healthTags: any = {};
    const healthTagData = [
      { name: "Editor's Pick", slug: 'editors-pick' },
      { name: 'How-To Guide', slug: 'how-to-guide' },
      { name: 'Expert Advice', slug: 'expert-advice' },
      { name: 'Trending Now', slug: 'trending-now' },
      { name: 'Product Spotlight', slug: 'product-spotlight' },
    ];
    for (const tag of healthTagData) {
      const created = await strapi.documents('api::tag.tag').create({
        data: { name: tag.name, slug: tag.slug, site: healthSite.documentId },
        status: 'published',
      });
      healthTags[tag.slug] = created;
    }

    strapi.log.info('[Seed] Tags created.');

    // ─────────────────────────────────────────────
    // STEP 3E: ARTICLES — GlimpseIt (Finance)
    // ─────────────────────────────────────────────
    strapi.log.info('[Seed] Creating GlimpseIt articles...');

    // Helper: create paragraph block
    const p = (text: string) => ({ type: 'paragraph', children: [{ type: 'text', text }] });
    const h2 = (text: string) => ({ type: 'heading', level: 2, children: [{ type: 'text', text }] });
    const h3 = (text: string) => ({ type: 'heading', level: 3, children: [{ type: 'text', text }] });

    // Article helper
    async function createArticle(data: any) {
      return strapi.documents('api::article.article').create({ data, status: 'published' });
    }

    // ── GlimpseIt Article 1 (FEATURED, long content) ──
    await createArticle({
      title: 'How to Build a Diversified Investment Portfolio in 2026',
      slug: 'how-to-build-a-diversified-investment-portfolio-in-2026',
      excerpt: 'Building a diversified investment portfolio is the cornerstone of long-term wealth creation. Learn the strategies professionals use to balance risk and reward across multiple asset classes.',
      isFeatured: true,
      isTrending: false,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['investing'].documentId,
      author: authorSarah.documentId,
      tags: [glimpseitTags['investment-tips'].documentId, glimpseitTags['expert-opinion'].documentId],
      content: [
        p('Portfolio diversification is not just a strategy — it is the bedrock of sound investing. In 2026, with global markets more interconnected than ever and macroeconomic uncertainty running high, building a well-diversified portfolio has never been more important.'),
        h2('What Is Portfolio Diversification?'),
        p('Diversification means spreading your investments across different asset classes, sectors, and geographies so that the poor performance of any single investment does not devastate your entire portfolio. The classic rule of thumb: "Don\'t put all your eggs in one basket."'),
        p('Modern portfolio theory, developed by Harry Markowitz in 1952, mathematically demonstrated that combining assets with low correlations reduces overall portfolio risk without necessarily sacrificing return. In practice, this means owning stocks, bonds, real estate, commodities, and alternative assets simultaneously.'),
        h2('Asset Classes to Consider in 2026'),
        h3('1. Equities (Stocks)'),
        p('Stocks remain the highest long-term return asset class. In 2026, technology, clean energy, and healthcare sectors are showing robust growth. Allocate broadly across large-cap, mid-cap, and small-cap stocks. Geographic diversification is equally important — U.S. equities should be balanced with emerging market exposure.'),
        h3('2. Fixed Income (Bonds)'),
        p('Bonds provide stability and income, especially during equity market downturns. With interest rates stabilizing after the 2022–2024 hiking cycles, investment-grade corporate bonds and government treasuries offer attractive yields with moderate risk. Duration management is key — consider short to medium duration bonds if rate cuts are anticipated.'),
        h3('3. Real Estate (REITs)'),
        p('Real Estate Investment Trusts (REITs) offer exposure to property markets without direct ownership. They typically provide steady dividends and act as an inflation hedge. Commercial, residential, and data center REITs all present different risk-return profiles worth exploring.'),
        h3('4. Commodities'),
        p('Gold, oil, and agricultural commodities offer diversification benefits because they often move independently of stocks and bonds. Gold, in particular, has historically served as a safe haven during market turmoil and inflation spikes. Limit commodity exposure to 5–10% of your portfolio.'),
        h3('5. Alternative Investments'),
        p('Private equity, hedge funds, and digital assets (for higher risk tolerance investors) can further diversify a portfolio. Be cautious of liquidity constraints and higher fees associated with alternatives.'),
        h2('How to Allocate: A Sample Framework'),
        p('A common starting framework for a moderate-risk investor: 50–60% equities, 25–30% bonds, 10–15% alternatives and real estate, and 5% cash/equivalents. Adjust according to your age, risk tolerance, time horizon, and financial goals.'),
        h2('Rebalancing: The Discipline That Protects Gains'),
        p('Diversification alone is not enough — you must rebalance periodically. As markets move, your allocations drift. Rebalancing (quarterly or annually) forces you to sell high and buy low systematically, maintaining your target risk profile.'),
        h2('Common Diversification Mistakes'),
        p('Owning many stocks in the same sector creates false diversification. Investing only in your home country creates geographic concentration risk. Ignoring correlation during market stress — assets that appear uncorrelated often move together in a crisis — is another pitfall. Always stress-test your portfolio.'),
        h2('Conclusion'),
        p('Building a diversified portfolio in 2026 requires deliberate planning, consistent execution, and periodic review. Start with a clear investment goal, choose a diversified mix of assets, and resist the urge to chase short-term performance. Your future self will thank you.'),
      ],
    });

    // ── GlimpseIt Article 2 (FEATURED, long content) ──
    await createArticle({
      title: 'Understanding Bull and Bear Markets: A Complete Guide',
      slug: 'understanding-bull-and-bear-markets-a-complete-guide',
      excerpt: 'Bull and bear markets define the rhythm of investing. Understanding what drives each phase — and how to position your portfolio accordingly — is essential for every investor.',
      isFeatured: true,
      isTrending: false,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['stock-market'].documentId,
      author: authorSarah.documentId,
      tags: [glimpseitTags['market-analysis'].documentId, glimpseitTags['expert-opinion'].documentId],
      content: [
        p('The terms "bull market" and "bear market" are among the most frequently used in financial journalism, yet many investors have only a surface-level understanding of what they mean and, more importantly, how to navigate them successfully.'),
        h2('Defining Bull and Bear Markets'),
        p('A bull market is characterized by rising asset prices, typically defined as a 20% or more gain from recent lows sustained over at least two months. It is generally accompanied by strong economic fundamentals, low unemployment, rising corporate profits, and investor optimism.'),
        p('A bear market, conversely, is a decline of 20% or more from recent highs, typically lasting at least two months. Bear markets are often triggered by economic recessions, rising interest rates, geopolitical shocks, or loss of investor confidence.'),
        h2('Historical Context: How Long Do They Last?'),
        p('Historically, bull markets last significantly longer than bear markets. Since 1928, the average bull market for the S&P 500 has lasted approximately 2.7 years, while the average bear market lasted about 9.6 months. This asymmetry underscores the importance of staying invested through cycles.'),
        h2('What Drives Each Phase?'),
        h3('Bull Market Drivers'),
        p('Economic expansion, low interest rates, strong corporate earnings, fiscal stimulus, and technological innovation all fuel bull markets. Investor sentiment — the so-called "animal spirits" — plays a crucial amplifying role. FOMO (fear of missing out) can push valuations well above fundamentals during late-stage bull markets.'),
        h3('Bear Market Drivers'),
        p('Conversely, bear markets are driven by economic contraction, rising rates that squeeze borrowing, corporate earnings disappointments, financial system stress, or external shocks like pandemics or wars. Fear, margin calls, and forced selling create self-reinforcing downward spirals.'),
        h2('Investing Strategy in Each Phase'),
        p('In a bull market: let your winners run, maintain your target allocation, and resist over-concentrating in high-flying sectors. In a bear market: avoid panic selling, consider dollar-cost averaging to buy quality assets at discount, and hold cash to deploy at market lows. The disciplined investor treats bear markets as sales events, not disasters.'),
        h2('The Role of Valuations'),
        p('The Shiller P/E ratio (CAPE) has historically been a reliable predictor of long-term returns. High valuations at the end of a bull market signal lower expected future returns; depressed valuations during a bear market signal higher future returns. Use valuation metrics as a guide — not a timing tool.'),
        h2('Key Takeaways'),
        p('Successful navigation of bull and bear markets requires emotional discipline, a long investment horizon, and a clear strategy. Avoid making major portfolio changes based on short-term noise. Instead, use market cycles to systematically buy quality assets at better prices.'),
      ],
    });

    // ── GlimpseIt Article 3 (FEATURED) ──
    await createArticle({
      title: 'Top 10 Stock Market Indicators Every Investor Should Know',
      slug: 'top-10-stock-market-indicators-every-investor-should-know',
      excerpt: 'From the VIX to the yield curve, stock market indicators provide crucial signals about market health and future direction. Master these 10 essential indicators.',
      isFeatured: true,
      isTrending: false,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['stock-market'].documentId,
      author: authorDavid.documentId,
      tags: [glimpseitTags['market-analysis'].documentId, glimpseitTags['breaking-news'].documentId],
      content: [
        p('Stock market indicators are quantitative tools that help investors assess market conditions, measure investor sentiment, and predict potential turning points. Understanding these indicators gives you an analytical edge in a world where most investors react on emotion.'),
        h2('1. The VIX (Volatility Index)'),
        p('Often called the "fear index," the VIX measures expected market volatility over the next 30 days. A VIX above 30 signals high fear and potential market bottoms. A VIX below 15 suggests complacency — historically a warning sign for corrections.'),
        h2('2. The Yield Curve'),
        p('The spread between 10-year and 2-year Treasury yields is one of the most reliable recession predictors. An inverted yield curve (short rates > long rates) has preceded every U.S. recession in the past 50 years, typically by 12–18 months.'),
        h2('3. Price-to-Earnings (P/E) Ratio'),
        p('The P/E ratio compares a company\'s stock price to its earnings per share. High P/E ratios suggest elevated valuations; low P/E ratios suggest value. The Shiller CAPE (cyclically adjusted P/E) smooths out earnings cycles for a clearer long-term picture.'),
        h2('4. Moving Averages (50-day and 200-day)'),
        p('When price is above the 200-day moving average, the long-term trend is bullish. The "golden cross" (50-day crosses above 200-day) signals potential bull markets; the "death cross" (opposite) signals bearish trends.'),
        h2('5. Advance-Decline Line'),
        p('This breadth indicator tracks how many stocks are advancing versus declining. A rising market with a falling A/D line suggests narrowing breadth — a warning that the rally may not be sustainable.'),
        h2('6. Put/Call Ratio'),
        p('High put/call ratios indicate bearish sentiment (potential contrarian buy signal); low ratios indicate bullish complacency (potential sell signal). It measures options market positioning.'),
        h2('7. Consumer Confidence Index'),
        p('Published monthly, this survey measures consumer optimism about the economy. High confidence supports consumer spending and GDP growth; collapsing confidence often precedes economic slowdowns.'),
        h2('8. ISM Manufacturing PMI'),
        p('The Purchasing Managers\' Index above 50 indicates manufacturing sector expansion; below 50 indicates contraction. It is a leading indicator of economic activity and corporate earnings.'),
        h2('9. Insider Buying/Selling'),
        p('When company executives buy their own stock, it is a bullish signal — they know the business intimately. Heavy insider selling, however, is not necessarily bearish, as executives sell for many personal reasons.'),
        h2('10. Short Interest Ratio'),
        p('High short interest (shares sold short as % of float) can fuel massive short squeezes. Tracking short interest helps identify potential catalysts for rapid price movements.'),
        p('Mastering these 10 indicators does not guarantee success, but it significantly improves your ability to contextualize market conditions and make more informed investment decisions.'),
      ],
    });

    // ── GlimpseIt Article 4 (FEATURED) ──
    await createArticle({
      title: 'The Impact of Federal Reserve Policy on Global Markets',
      slug: 'the-impact-of-federal-reserve-policy-on-global-markets',
      excerpt: 'When the Fed speaks, global markets listen. Explore how Federal Reserve monetary policy decisions ripple through equities, bonds, currencies, and emerging markets worldwide.',
      isFeatured: true,
      isTrending: false,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['economy'].documentId,
      author: authorSarah.documentId,
      tags: [glimpseitTags['economic-report'].documentId, glimpseitTags['market-analysis'].documentId],
      content: [
        p('The Federal Reserve is the world\'s most influential central bank. Its decisions on interest rates and monetary policy send shockwaves across every financial market on the planet. Understanding how Fed policy works — and how to position for it — is a critical skill for any serious investor.'),
        h2('The Fed\'s Dual Mandate'),
        p('The Federal Reserve operates under a dual mandate: maximum employment and price stability (typically targeting 2% annual inflation). Balancing these two objectives drives all major policy decisions.'),
        h2('How Rate Hikes Impact Markets'),
        p('When the Fed raises rates, borrowing costs increase across the economy. Mortgage rates rise, corporate bond yields increase, and equity valuations — which are based on discounted future cash flows — compress. Growth stocks and high-multiple tech companies are especially sensitive to rate hikes.'),
        h2('How Rate Cuts Stimulate Economies'),
        p('Rate cuts lower borrowing costs, stimulate consumer spending and business investment, and typically boost equity markets. They also weaken the U.S. dollar, which benefits commodity prices and emerging market assets.'),
        h2('The Global Transmission Mechanism'),
        p('Because many global assets are priced in dollars and dollar-denominated debt is widespread, Fed policy affects markets far beyond U.S. borders. When the Fed tightens, capital flows out of emerging markets back into dollar assets, causing EM currency depreciation and capital outflows. In 2022–2023, the aggressive Fed hiking cycle triggered currency crises in several emerging economies.'),
        h2('Watching the Fed: Key Signals'),
        p('Investors should closely follow FOMC meeting minutes, the Fed\'s dot plot (projections for future rates), Fed Chair press conferences, and speeches by Fed governors. The language used — "data dependent," "higher for longer," "soft landing" — carries enormous market-moving significance.'),
        p('In 2026, monitoring Fed policy remains as critical as ever, particularly as the global economy navigates elevated debt levels, demographic challenges, and energy transition costs.'),
      ],
    });

    // ── GlimpseIt Article 5 (FEATURED) ──
    await createArticle({
      title: 'Gold vs Stocks: Where Should You Invest During Inflation?',
      slug: 'gold-vs-stocks-where-should-you-invest-during-inflation',
      excerpt: 'As inflation fears rise, investors debate the merits of gold versus equities. We examine the historical evidence and what data says about allocating during inflationary periods.',
      isFeatured: true,
      isTrending: false,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['commodities'].documentId,
      author: authorSarah.documentId,
      tags: [glimpseitTags['investment-tips'].documentId, glimpseitTags['market-analysis'].documentId],
      content: [
        p('Inflation has returned as a central concern for investors after decades of dormancy. The 2021–2023 inflationary surge was a wake-up call: asset allocation decisions must explicitly account for inflation risk. The gold-versus-stocks debate has never been more relevant.'),
        h2('Gold: The Traditional Inflation Hedge'),
        p('Gold has been used as a store of value for thousands of years. Its appeal during inflation stems from its finite supply and its inverse relationship with the purchasing power of paper currencies. When central banks print money, gold prices tend to rise.'),
        p('However, the evidence is mixed. Gold performs well in periods of very high inflation (above 5%), but its real returns during moderate inflation are inconsistent. From 1980 to 2000, gold lost most of its value even as inflation persisted.'),
        h2('Stocks: Long-Term Inflation Beaters'),
        p('Equities have historically outperformed inflation over long periods. Companies can raise prices, increasing revenues and profits in nominal terms. However, short-term, stocks often fall when inflation rises because of rate hike fears and margin compression.'),
        p('Sectors like energy, materials, and utilities tend to outperform during inflationary periods, while tech and consumer discretionary underperform.'),
        h2('The Practical Allocation'),
        p('For most investors, a modest gold allocation (5–10%) within a diversified portfolio makes sense as an insurance policy. The bulk of inflation protection should come from equities, inflation-protected bonds (TIPS), real estate, and commodities. Neither gold nor stocks alone is the optimal answer.'),
        p('In 2026, with inflation moderating but structural pressures remaining, maintaining some gold exposure while staying primarily invested in diversified equities remains the prudent approach.'),
      ],
    });

    // ── GlimpseIt Article 6 (FEATURED) ──
    await createArticle({
      title: 'Forex Trading Strategies: A Comprehensive Beginner\'s Guide',
      slug: 'forex-trading-strategies-a-comprehensive-beginners-guide',
      excerpt: 'The foreign exchange market is the world\'s largest financial market, trading over $7 trillion daily. This comprehensive guide helps beginners understand forex trading strategies from the ground up.',
      isFeatured: true,
      isTrending: false,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['forex'].documentId,
      author: authorDavid.documentId,
      tags: [glimpseitTags['investment-tips'].documentId, glimpseitTags['expert-opinion'].documentId],
      content: [
        p('The forex (foreign exchange) market operates 24 hours a day, five days a week, and processes over $7 trillion in daily transactions. For beginners, this vast, decentralized market can seem overwhelming. This guide breaks down the core strategies you need to start trading intelligently.'),
        h2('Understanding Currency Pairs'),
        p('Forex trading involves simultaneously buying one currency and selling another. The "major" pairs (EUR/USD, GBP/USD, USD/JPY) are the most liquid and have the tightest spreads. "Cross" pairs (EUR/GBP, AUD/JPY) exclude the USD.'),
        h2('Core Forex Strategies'),
        h3('1. Trend Following'),
        p('Identify the prevailing trend using moving averages (50 EMA, 200 EMA) and trade in its direction. Enter on pullbacks to support (in uptrends) or resistance (in downtrends). Use trailing stops to lock in profits.'),
        h3('2. Range Trading'),
        p('When markets are consolidating, buy at identified support levels and sell at resistance. This strategy works best in low-volatility environments and on higher timeframes to reduce noise.'),
        h3('3. Breakout Trading'),
        p('Enter trades when price breaks above resistance or below support with increased volume. False breakouts are common — use a confirmation candle or retest of the broken level to increase trade reliability.'),
        h2('Risk Management: The Non-Negotiable'),
        p('Never risk more than 1–2% of your trading capital on any single trade. Always use stop-loss orders. Leverage amplifies both gains and losses — high leverage kills most retail traders. Start with low leverage (1:5 to 1:10) until you develop consistent skill.'),
        p('The forex market offers tremendous opportunity, but consistent profitability requires discipline, a systematic approach, and continuous education. Paper-trade for at least three months before risking real capital.'),
      ],
    });

    // ── GlimpseIt Articles 7-12 (TRENDING) ──
    await createArticle({
      title: 'Personal Finance 101: Budgeting Strategies That Actually Work',
      slug: 'personal-finance-101-budgeting-strategies-that-actually-work',
      excerpt: 'Managing personal finances starts with a solid budget. Discover proven budgeting strategies from the 50/30/20 rule to zero-based budgeting that will transform your financial health.',
      isFeatured: false,
      isTrending: true,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['personal-finance'].documentId,
      author: authorSarah.documentId,
      tags: [glimpseitTags['investment-tips'].documentId, glimpseitTags['expert-opinion'].documentId],
      content: [
        p('A budget is not a restriction on your freedom — it is the foundation of your financial freedom. The difference between people who achieve their financial goals and those who don\'t often comes down to whether they have and follow a budget.'),
        h2('The 50/30/20 Rule'),
        p('Popularized by Senator Elizabeth Warren, this simple framework allocates 50% of after-tax income to needs (housing, food, utilities, transportation), 30% to wants (dining, entertainment, subscriptions), and 20% to savings and debt repayment. It is flexible, easy to follow, and effective.'),
        h2('Zero-Based Budgeting'),
        p('Every dollar is assigned a specific purpose, with income minus expenses equaling zero. This method, popularized by Dave Ramsey, provides granular control over every dollar. It requires more effort but delivers more accountability.'),
        h2('Pay Yourself First'),
        p('Automatically transfer a fixed percentage of your income to savings or investments on payday, before spending anything. This removes the temptation to spend first and save what\'s left (which is usually nothing).'),
        p('Whichever method you choose, consistency is the key. Start today, adjust as you learn, and let compound interest do the heavy lifting over time.'),
      ],
    });

    await createArticle({
      title: 'Best Dividend Stocks for Long-Term Income in 2026',
      slug: 'best-dividend-stocks-for-long-term-income-in-2026',
      excerpt: 'Dividend investing offers a powerful combination of regular income and capital appreciation. Discover the criteria for selecting dividend stocks that can fund your retirement.',
      isFeatured: false,
      isTrending: true,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['investing'].documentId,
      author: authorSarah.documentId,
      tags: [glimpseitTags['investment-tips'].documentId, glimpseitTags['market-analysis'].documentId],
      content: [
        p('Dividend investing has funded generations of retirements. Companies that consistently pay and grow dividends tend to be disciplined, financially sound, and shareholder-focused — exactly the qualities you want in a long-term investment.'),
        h2('What Makes a Quality Dividend Stock?'),
        p('Look for: a payout ratio below 65% (earnings comfortably cover dividends), 10+ years of consecutive dividend payments, consistent dividend growth (Dividend Aristocrats have 25+ years of consecutive increases), strong free cash flow generation, and manageable debt levels.'),
        h2('Sectors to Focus On in 2026'),
        p('Consumer staples, utilities, healthcare, and financial companies typically offer reliable dividends. In 2026, infrastructure companies benefiting from energy transition spending and healthcare companies riding demographic tailwinds look particularly attractive.'),
        h2('Dividend Reinvestment (DRIP)'),
        p('Reinvesting dividends accelerates compounding dramatically. A portfolio yielding 3% annually with 7% dividend growth could double roughly every 7 years through DRIP alone. Patience and time are your greatest allies.'),
      ],
    });

    await createArticle({
      title: 'Understanding Commodity Markets: Oil, Gold, and Agriculture',
      slug: 'understanding-commodity-markets-oil-gold-and-agriculture',
      excerpt: 'Commodity markets are the backbone of the global economy. Understanding the forces that drive oil, gold, and agricultural prices is essential for any well-rounded investor.',
      isFeatured: false,
      isTrending: true,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['commodities'].documentId,
      author: authorDavid.documentId,
      tags: [glimpseitTags['market-analysis'].documentId, glimpseitTags['economic-report'].documentId],
      content: [
        p('Commodities form the physical foundation of the global economy. Energy powers our cities, metals build our infrastructure, and agricultural commodities feed the world. Understanding what drives commodity prices helps investors protect their portfolios and find opportunities.'),
        h2('Oil Markets'),
        p('Crude oil prices are driven by supply (OPEC+ production decisions, shale output, geopolitical disruptions) and demand (economic growth, transportation trends, energy transition). The energy transition is creating structural headwinds for long-term oil demand, but near-term supply constraints keep prices volatile.'),
        h2('Gold Markets'),
        p('Gold serves as a monetary metal, safe haven, and inflation hedge. Key price drivers: U.S. dollar strength (inverse relationship), real interest rates (high real rates hurt gold), central bank buying (particularly from BRICS nations), and geopolitical risk premium.'),
        h2('Agricultural Commodities'),
        p('Wheat, corn, soybeans, and coffee prices are driven by weather patterns, crop yields, global trade policies, and energy costs (fertilizers). Climate change is increasing agricultural price volatility, creating both risk and opportunity.'),
        p('Commodity exposure through ETFs, futures, or commodity producer stocks can provide meaningful diversification and inflation protection in a balanced portfolio.'),
      ],
    });

    await createArticle({
      title: 'The Rise of ESG Investing: What You Need to Know',
      slug: 'the-rise-of-esg-investing-what-you-need-to-know',
      excerpt: 'Environmental, Social, and Governance investing has grown from a niche strategy to a mainstream movement. Understand what ESG means, how it works, and whether it belongs in your portfolio.',
      isFeatured: false,
      isTrending: true,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['investing'].documentId,
      author: authorSarah.documentId,
      tags: [glimpseitTags['expert-opinion'].documentId, glimpseitTags['market-analysis'].documentId],
      content: [
        p('ESG investing has transformed from a fringe concept into a multi-trillion dollar industry. Whether you are a values-driven investor or purely profit-motivated, understanding ESG is no longer optional — it increasingly shapes capital allocation across global markets.'),
        h2('What is ESG?'),
        p('ESG stands for Environmental, Social, and Governance. Environmental criteria examine how a company manages climate risk, carbon emissions, and resource efficiency. Social criteria assess labor practices, supply chain ethics, and community relationships. Governance evaluates board composition, executive compensation, and shareholder rights.'),
        h2('The Performance Debate'),
        p('Critics argue ESG sacrifices returns by excluding certain sectors. Proponents counter that companies with strong ESG profiles have lower regulatory risk, better talent retention, and more resilient business models. The evidence suggests ESG portfolios perform comparably to traditional portfolios over long periods.'),
        h2('Practical Application'),
        p('You can access ESG investing through dedicated ESG ETFs, mutual funds, or by screening individual stocks using ESG data providers. Be aware of "greenwashing" — companies that market themselves as ESG-compliant without substantive changes. Due diligence remains essential.'),
      ],
    });

    await createArticle({
      title: 'Retirement Planning in Your 30s: Start Now or Pay Later',
      slug: 'retirement-planning-in-your-30s-start-now-or-pay-later',
      excerpt: 'Your 30s are the most critical decade for retirement planning. The compound interest advantage available in your 30s can never be fully recovered if you wait until your 40s or 50s.',
      isFeatured: false,
      isTrending: true,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['retirement'].documentId,
      author: authorSarah.documentId,
      tags: [glimpseitTags['investment-tips'].documentId, glimpseitTags['expert-opinion'].documentId],
      content: [
        p('If you are in your 30s and haven\'t started serious retirement planning, this article is your wake-up call. Time is the most powerful force in investing, and every year you delay has an exponential cost.'),
        h2('The Compound Interest Imperative'),
        p('A 30-year-old who invests $500/month at 8% average annual return will have approximately $1.7 million at age 65. A 40-year-old making the same investment will accumulate only about $745,000. That 10-year head start is worth nearly $1 million.'),
        h2('Maximize Tax-Advantaged Accounts'),
        p('Your 401(k) or employer-sponsored retirement plan should be your first stop — especially if your employer matches contributions (that\'s free money). Next, fund a Roth IRA for tax-free growth. If you are self-employed, a SEP-IRA or Solo 401(k) offers high contribution limits.'),
        h2('The 4% Rule and Retirement Number'),
        p('A common benchmark: you need 25x your annual retirement expenses saved to sustain a 30-year retirement with 4% annual withdrawals. If you plan to spend $60,000/year in retirement, you need $1.5 million. Work backward from this number to set monthly savings targets.'),
        p('Start now. Automate your contributions. Increase them annually. The math is unforgiving — but it rewards those who begin early.'),
      ],
    });

    await createArticle({
      title: 'How Interest Rates Affect Your Investment Portfolio',
      slug: 'how-interest-rates-affect-your-investment-portfolio',
      excerpt: 'Interest rates are the single most important macro variable affecting asset prices. Understanding the mechanisms through which rates impact every part of your portfolio is essential knowledge.',
      isFeatured: false,
      isTrending: true,
      site: glimpseitSite.documentId,
      category: glimpseitCategories['economy'].documentId,
      author: authorDavid.documentId,
      tags: [glimpseitTags['market-analysis'].documentId, glimpseitTags['economic-report'].documentId],
      content: [
        p('Interest rates are the price of money. When the cost of money changes, the value of virtually every financial asset changes with it. Understanding these relationships is fundamental to portfolio management.'),
        h2('Bonds: Inverse Relationship with Rates'),
        p('Bond prices and interest rates move in opposite directions. When rates rise, existing bonds with lower coupons become less attractive, so their prices fall. Duration measures this sensitivity — longer-duration bonds fall more when rates rise.'),
        h2('Equities: Complex but Predictable'),
        p('Higher rates increase the discount rate used in valuation models, reducing the present value of future earnings. Growth stocks (which earn far in the future) are most sensitive. Value stocks and financial companies benefit from higher rates. Dividend stocks become less attractive relative to bonds.'),
        h2('Real Estate: Mortgage Rate Sensitivity'),
        p('Higher mortgage rates directly reduce housing affordability, slowing home price appreciation and transaction volumes. Commercial real estate valuations compress when cap rates (closely linked to long-term rates) rise.'),
        p('In 2026, with the rate cycle potentially turning, understanding how your portfolio is positioned for rate changes is more important than ever. Ensure your allocation reflects your interest rate view.'),
      ],
    });

    // ── GlimpseIt Articles 13-24 (REGULAR) ──
    const glimpseitRegularArticles = [
      {
        title: 'Stock Market Basics: A Complete Beginner\'s Guide',
        slug: 'stock-market-basics-a-complete-beginners-guide',
        excerpt: 'New to investing? This comprehensive primer covers everything you need to know about how stock markets work, from IPOs to market orders to understanding financial statements.',
        category: 'stock-market',
        tags: ['investment-tips', 'expert-opinion'],
      },
      {
        title: 'How to Read Financial Statements Like a Pro',
        slug: 'how-to-read-financial-statements-like-a-pro',
        excerpt: 'Balance sheets, income statements, and cash flow statements — these three documents tell the true story of any business. Master them to invest with confidence.',
        category: 'financial-literacy',
        tags: ['investment-tips', 'expert-opinion'],
      },
      {
        title: 'Mutual Funds vs ETFs: Which Is Right for You?',
        slug: 'mutual-funds-vs-etfs-which-is-right-for-you',
        excerpt: 'Both mutual funds and ETFs offer diversified exposure at low cost. But key differences in how they trade, their fee structures, and tax efficiency matter for your returns.',
        category: 'mutual-funds',
        tags: ['investment-tips', 'market-analysis'],
      },
      {
        title: 'Index Investing: Why Passive Beats Active Most of the Time',
        slug: 'index-investing-why-passive-beats-active-most-of-the-time',
        excerpt: 'Decades of data show that index funds outperform the majority of actively managed funds over time. Here\'s why, and how to build an index-based portfolio.',
        category: 'investing',
        tags: ['investment-tips', 'expert-opinion'],
      },
      {
        title: 'Understanding Market Capitalization: Small, Mid, and Large Cap Stocks',
        slug: 'understanding-market-capitalization-small-mid-and-large-cap-stocks',
        excerpt: 'Market cap is one of the first things investors look at. Understanding the risk-return profiles of small, mid, and large cap stocks helps build a better-balanced portfolio.',
        category: 'stock-market',
        tags: ['market-analysis', 'investment-tips'],
      },
      {
        title: 'The Basics of Technical Analysis for Stock Traders',
        slug: 'the-basics-of-technical-analysis-for-stock-traders',
        excerpt: 'Technical analysis uses price charts and patterns to predict future market moves. Learn the core concepts: support, resistance, moving averages, RSI, and MACD.',
        category: 'stock-market',
        tags: ['market-analysis', 'investment-tips'],
      },
      {
        title: 'Building an Emergency Fund: How Much Is Enough?',
        slug: 'building-an-emergency-fund-how-much-is-enough',
        excerpt: 'Financial experts universally agree on one thing: an emergency fund is non-negotiable. Find out how much you need, where to keep it, and how to build it fast.',
        category: 'personal-finance',
        tags: ['investment-tips', 'expert-opinion'],
      },
      {
        title: 'Insurance as a Financial Planning Tool: What You Actually Need',
        slug: 'insurance-as-a-financial-planning-tool-what-you-actually-need',
        excerpt: 'Insurance protects the wealth you\'ve worked to build. Understanding which policies you actually need — and which are unnecessary — can save thousands of dollars annually.',
        category: 'insurance',
        tags: ['expert-opinion', 'investment-tips'],
      },
      {
        title: 'Cryptocurrency as an Investment: Weighing the Risks and Rewards',
        slug: 'cryptocurrency-as-an-investment-weighing-the-risks-and-rewards',
        excerpt: 'Digital assets have moved from the fringes to institutional portfolios. Understand the genuine risks and potential rewards before allocating to crypto in your investment mix.',
        category: 'investing',
        tags: ['market-analysis', 'breaking-news'],
      },
      {
        title: 'Macroeconomic Indicators Every Investor Must Track',
        slug: 'macroeconomic-indicators-every-investor-must-track',
        excerpt: 'GDP growth, inflation, unemployment, and trade data paint the picture of economic health. Learn which macro indicators matter most for market performance.',
        category: 'economy',
        tags: ['economic-report', 'market-analysis'],
      },
      {
        title: 'Dollar Cost Averaging vs Lump Sum Investing: The Data',
        slug: 'dollar-cost-averaging-vs-lump-sum-investing-the-data',
        excerpt: 'Should you invest all at once or spread purchases over time? Research on dollar cost averaging versus lump sum investing reveals a clear winner — and important caveats.',
        category: 'investing',
        tags: ['investment-tips', 'expert-opinion'],
      },
      {
        title: 'The Psychology of Investing: Overcoming Behavioral Biases',
        slug: 'the-psychology-of-investing-overcoming-behavioral-biases',
        excerpt: 'Loss aversion, confirmation bias, herding behavior — cognitive biases cost investors dearly. Learn to identify and overcome the psychological traps that destroy portfolio returns.',
        category: 'financial-literacy',
        tags: ['expert-opinion', 'investment-tips'],
      },
    ];

    for (const art of glimpseitRegularArticles) {
      await createArticle({
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        isFeatured: false,
        isTrending: false,
        site: glimpseitSite.documentId,
        category: glimpseitCategories[art.category].documentId,
        author: [authorSarah, authorDavid][Math.floor(art.title.length % 2)].documentId,
        tags: art.tags.map((t: string) => glimpseitTags[t].documentId),
        content: [
          p(art.excerpt),
          h2('Overview'),
          p(`This comprehensive guide explores ${art.title.toLowerCase()} in detail, providing actionable insights for investors at every level. Understanding this topic is essential for building long-term wealth and making informed financial decisions.`),
          h2('Key Concepts'),
          p('Financial markets are complex ecosystems driven by supply and demand, investor sentiment, macroeconomic conditions, and regulatory frameworks. Navigating them successfully requires both knowledge and discipline.'),
          h2('Practical Application'),
          p('Apply these principles systematically rather than reactively. The most successful investors combine deep knowledge with emotional discipline, following their strategy through market cycles without deviation.'),
          h2('Final Thoughts'),
          p('Continue to educate yourself, stay informed about market developments, and always align your investment decisions with your personal financial goals and risk tolerance.'),
        ],
      });
    }

    strapi.log.info('[Seed] GlimpseIt articles created.');

    // ─────────────────────────────────────────────
    // STEP 3F: ARTICLES — Cryptonice (Crypto)
    // ─────────────────────────────────────────────
    strapi.log.info('[Seed] Creating Cryptonice articles...');

    // ── Cryptonice Article 1 (FEATURED, long content) ──
    await createArticle({
      title: 'Bitcoin Halving 2024: What History Tells Us About Price Action',
      slug: 'bitcoin-halving-2024-what-history-tells-us-about-price-action',
      excerpt: 'Bitcoin\'s fourth halving has historical precedent pointing to explosive price action in the 12–18 months that follow. We analyze every halving cycle and what it means for 2025–2026.',
      isFeatured: true,
      isTrending: false,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['bitcoin'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['price-alert'].documentId, cryptoniceTags['market-insight'].documentId],
      content: [
        p('Every four years, Bitcoin undergoes a programmatic supply reduction event known as the "halving" — the block reward paid to miners is cut in half. This mechanism, baked into Bitcoin\'s code by Satoshi Nakamoto, is one of the most anticipated events in all of crypto. The April 2024 halving cut the block reward from 6.25 BTC to 3.125 BTC, setting the stage for what history suggests could be a significant bull market through 2025–2026.'),
        h2('Understanding the Halving Mechanism'),
        p('Bitcoin\'s supply is capped at 21 million coins, with new supply issued as block rewards to miners who secure the network. The halving occurs every 210,000 blocks (approximately every 4 years), progressively slowing the rate at which new Bitcoin enters circulation. This deflationary design creates programmatic supply shocks.'),
        h2('Historical Halving Cycles'),
        h3('First Halving (November 2012)'),
        p('Block reward reduced from 50 to 25 BTC. In the 12 months following the halving, Bitcoin\'s price increased from approximately $12 to over $1,000 — a roughly 8,000% gain. This established the pattern: halving → supply shock → price discovery.'),
        h3('Second Halving (July 2016)'),
        p('Block reward reduced from 25 to 12.5 BTC. Price at halving: approximately $650. By December 2017, Bitcoin reached nearly $20,000 — a 3,000% gain from the halving price. The cycle lasted approximately 18 months from halving to peak.'),
        h3('Third Halving (May 2020)'),
        p('Block reward reduced from 12.5 to 6.25 BTC. Price at halving: approximately $8,600. By November 2021, Bitcoin reached $69,000 — an 800% gain from halving. Diminishing returns are evident but the directional signal remains strong.'),
        h2('2024 Halving: What\'s Different This Time'),
        p('The 2024 halving occurs in a fundamentally different market landscape. The approval of Bitcoin spot ETFs in the U.S. in January 2024 opened institutional floodgates, with BlackRock, Fidelity, and others attracting billions in inflows. This structural demand increase coincides with the supply shock, potentially amplifying the historical pattern.'),
        h2('Post-Halving Price Catalysts for 2025–2026'),
        p('Beyond the supply shock mechanism, several catalysts support a sustained bull market: continued ETF inflows from institutional allocators, potential Federal Reserve rate cuts increasing risk appetite, growing sovereign wealth fund and pension fund allocations, and maturing Bitcoin derivatives markets providing deeper liquidity.'),
        h2('Risk Factors to Watch'),
        p('Not all halvings are created equal. Regulatory actions, macroeconomic shocks, mining industry stress (low-cost producers surviving, high-cost miners exiting), and black swan events can disrupt historical patterns. Diversification within the crypto space remains essential.'),
        h2('Conclusion'),
        p('The 2024 halving, combined with historic ETF-driven institutional adoption, sets up what could be Bitcoin\'s most significant cycle yet. Historical precedent, while not a guarantee, provides a compelling framework for the 2025–2026 outlook. Position accordingly, manage risk carefully, and think in terms of cycles, not months.'),
      ],
    });

    // ── Cryptonice Article 2 (FEATURED, long content) ──
    await createArticle({
      title: 'The Complete Guide to DeFi Yield Farming for Beginners',
      slug: 'the-complete-guide-to-defi-yield-farming-for-beginners',
      excerpt: 'Yield farming has transformed DeFi into a multi-billion dollar ecosystem. This comprehensive beginner\'s guide explains how yield farming works, the risks involved, and how to start safely.',
      isFeatured: true,
      isTrending: false,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['defi'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['tutorial'].documentId, cryptoniceTags['market-insight'].documentId],
      content: [
        p('Yield farming — also called liquidity mining — is the practice of putting your crypto assets to work in DeFi protocols to earn rewards. In its simplest form, you deposit assets into a protocol, and in return you receive fees, interest, or governance tokens. At its peak in 2021, DeFi protocols offered returns that made traditional finance look like a savings account. In 2024–2026, more mature and sustainable yield opportunities have emerged.'),
        h2('The Mechanics of Yield Farming'),
        p('DeFi protocols need liquidity to function. Decentralized exchanges (DEXs) like Uniswap need liquidity pools to facilitate token swaps. Lending protocols like Aave and Compound need deposits to fund borrowing. They attract this liquidity by paying yields to providers.'),
        p('When you provide liquidity to a DEX pool, you receive LP (Liquidity Provider) tokens representing your share of the pool. These LP tokens can often be staked in yield farms to earn additional rewards. This creates multi-layered yields — sometimes called "stacking" or "compounding" strategies.'),
        h2('Key DeFi Platforms for Yield Farming'),
        h3('Uniswap v3'),
        p('The leading DEX on Ethereum. Concentrated liquidity allows LPs to allocate liquidity within specific price ranges, dramatically increasing capital efficiency and fee earnings. However, it requires active management and exposes LPs to impermanent loss risk.'),
        h3('Aave and Compound'),
        p('Lending protocols where you deposit assets to earn interest from borrowers. Simple, audited, and battle-tested. Interest rates fluctuate based on supply and demand. Safety scores: some of the highest in DeFi.'),
        h3('Curve Finance'),
        p('Optimized for stablecoin swaps with minimal slippage. Curve pools offer lower risk (minimal impermanent loss with stablecoin pairs) with decent yields, making them popular for risk-averse yield farmers.'),
        h2('Understanding Impermanent Loss'),
        p('Impermanent loss is the opportunity cost of providing liquidity in a DEX pool versus simply holding the assets. When the price ratio of your deposited tokens changes significantly, you end up with fewer of the better-performing asset. IL is "impermanent" because it reverses if prices revert to entry levels, but if you withdraw at an unfavorable time, the loss becomes permanent.'),
        h2('Risk Management in Yield Farming'),
        p('Smart contract risk: DeFi code can contain exploitable bugs. Only use audited protocols with battle-tested code and significant TVL (Total Value Locked). Avoid unaudited forks of popular protocols.'),
        p('Rug pull risk: In newer projects, developers can drain liquidity pools. Research team backgrounds, check if contracts are immutable or have time locks on admin functions.'),
        p('Systemic risk: DeFi protocols are interconnected — a failure in one can cascade through the ecosystem. Diversify across protocols and blockchains.'),
        h2('How to Start Safely'),
        p('Begin with lending on established protocols (Aave, Compound) with a small amount. Learn how transactions work, gas fee management, and wallet security before moving to more complex strategies. Never invest more than you can afford to lose, and always do your own research.'),
      ],
    });

    // ── Cryptonice Article 3 (FEATURED) ──
    await createArticle({
      title: 'Ethereum vs Solana: A Deep Technical Comparison',
      slug: 'ethereum-vs-solana-a-deep-technical-comparison',
      excerpt: 'Ethereum and Solana are the two dominant smart contract platforms. Their architectural differences create fundamentally different trade-offs in security, decentralization, and performance.',
      isFeatured: true,
      isTrending: false,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['altcoins'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['project-review'].documentId, cryptoniceTags['market-insight'].documentId],
      content: [
        p('The blockchain trilemma — the challenge of simultaneously achieving scalability, security, and decentralization — defines the design choices of every smart contract platform. Ethereum and Solana represent two fundamentally different architectural philosophies in solving this challenge.'),
        h2('Ethereum: Security and Decentralization First'),
        p('Ethereum is the original programmable blockchain, launched in 2015. Its transition to Proof of Stake in 2022 (The Merge) reduced energy consumption by 99.9% while maintaining its unparalleled decentralization. With over 500,000 validators, Ethereum\'s security model is battle-tested and highly decentralized.'),
        p('Ethereum processes ~15 TPS on the base layer, but Layer 2 solutions (Arbitrum, Optimism, Base) extend this to thousands of TPS while inheriting Ethereum\'s security. The ecosystem boasts the highest TVL in DeFi and the most developer activity of any blockchain.'),
        h2('Solana: Performance First'),
        p('Solana, launched in 2020, uses a novel Proof of History (PoH) consensus mechanism combined with Proof of Stake to achieve ~65,000 TPS with sub-second finality at fractions of a cent in fees. This performance makes Solana the dominant platform for high-frequency trading, gaming, and consumer applications.'),
        p('The trade-off: Solana\'s validator hardware requirements (high-spec servers) limit the number of validators (~2,000), resulting in greater centralization compared to Ethereum. Solana has also experienced several network outages, raising concerns about reliability.'),
        h2('Ecosystem Comparison'),
        p('Ethereum: $50B+ TVL in DeFi, the NFT standard (ERC-721), the majority of institutional DeFi activity, and the widest developer tooling ecosystem. Solana: fastest-growing NFT ecosystem by transaction count, dominant in meme coins and consumer DeFi, and rapidly expanding institutional presence.'),
        h2('The Verdict'),
        p('Neither platform is objectively superior — they serve different use cases. Ethereum remains the gold standard for institutional DeFi, high-value settlements, and applications requiring maximum security. Solana excels for consumer applications demanding high throughput and low fees. A diversified approach holding both makes strategic sense.'),
      ],
    });

    // ── Cryptonice Article 4 (FEATURED) ──
    await createArticle({
      title: 'How to Secure Your Crypto Wallet Against Common Threats',
      slug: 'how-to-secure-your-crypto-wallet-against-common-threats',
      excerpt: 'Crypto security is not optional — one mistake can wipe out your entire portfolio. This comprehensive guide covers hardware wallets, seed phrase management, phishing prevention, and advanced OpSec.',
      isFeatured: true,
      isTrending: false,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['security'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['tutorial'].documentId, cryptoniceTags['breaking-news-crypto'].documentId],
      content: [
        p('Billions of dollars in cryptocurrency have been lost to hacks, scams, and user error. Unlike traditional finance, there is no FDIC insurance, no customer support to call, and no transaction reversal. When crypto is gone, it is gone. Security is not a feature — it is the foundation of everything.'),
        h2('Hardware Wallets: Non-Negotiable for Large Holdings'),
        p('A hardware wallet (Ledger, Trezor) is a physical device that stores your private keys offline, away from internet-connected devices. Even if your computer is completely compromised, a hardware wallet keeps your funds safe. For any holding above $1,000, a hardware wallet is essential.'),
        h2('The Sacred Seed Phrase'),
        p('Your seed phrase (12 or 24 words) is the master key to your wallet — whoever has it, owns your crypto. Never photograph it, type it into any website, share it with anyone, or store it digitally. Write it on paper (multiple copies) and store in separate, secure physical locations. Metal backup plates (Cryptosteel, Bilodeau) protect against fire and water damage.'),
        h2('Phishing: The #1 Threat'),
        p('Most crypto theft occurs through phishing — fake websites that steal your seed phrase or private keys. Always verify URLs carefully (cryptosecuritynews.com vs. cryptosecuritynews.com). Bookmark official sites. Never click links from Discord, Telegram, or email claiming urgent action needed.'),
        h2('Exchange Security Best Practices'),
        p('Use a strong, unique password for each exchange. Enable two-factor authentication (2FA) — but use an authenticator app (Google Authenticator, Authy), NOT SMS (SIM swap vulnerable). Whitelist withdrawal addresses. Keep the majority of funds in self-custody (not on exchanges).'),
        p('The Golden Rule: if you don\'t hold your keys, you don\'t hold your coins. Apply rigorous security practices from day one.'),
      ],
    });

    // ── Cryptonice Article 5 (FEATURED) ──
    await createArticle({
      title: 'Understanding Smart Contracts: From Theory to Practice',
      slug: 'understanding-smart-contracts-from-theory-to-practice',
      excerpt: 'Smart contracts are self-executing programs on the blockchain that automate agreements without intermediaries. Understand how they work, their limitations, and real-world applications.',
      isFeatured: true,
      isTrending: false,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['blockchain-tech'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['tutorial'].documentId, cryptoniceTags['project-review'].documentId],
      content: [
        p('Smart contracts are perhaps the most transformative innovation in blockchain technology. First theorized by Nick Szabo in 1994 — before Bitcoin existed — and first implemented at scale on Ethereum in 2015, smart contracts are rewriting the rules of how agreements, transactions, and organizations operate.'),
        h2('What is a Smart Contract?'),
        p('A smart contract is a program stored on a blockchain that automatically executes when predetermined conditions are met. It is "smart" because it self-executes without human intervention, and a "contract" because it encodes the terms of an agreement. Think of it as a vending machine: insert the right input, get the predefined output — automatically, without a cashier.'),
        h2('How They Work on Ethereum'),
        p('Smart contracts on Ethereum are written in Solidity (or Vyper), compiled to bytecode, and deployed on the Ethereum Virtual Machine (EVM). Once deployed, they are immutable (cannot be changed) and their code is publicly visible. Gas fees compensate validators for executing the computations.'),
        h2('Real-World Applications'),
        p('DeFi: Uniswap\'s smart contracts manage billions in liquidity autonomously without a company or employees. NFTs: ERC-721 contracts define ownership, transfer rules, and creator royalties for digital assets. DAOs: Governance smart contracts allow token holders to vote on protocol changes. Insurance: Parametric insurance contracts that automatically pay out when oracle-verified conditions are met.'),
        h2('Limitations and Risks'),
        p('Smart contracts are only as good as their code. Bugs in contract code have led to hundreds of millions in losses (The DAO hack, various DeFi exploits). They cannot access real-world data without oracles (Chainlink, Band Protocol). And "code is law" means incorrect logic is executed exactly as written, with no recourse.'),
        p('Despite limitations, smart contracts represent a fundamental shift in how humans coordinate and transact. The technology is still young, and its full impact is yet to be realized.'),
      ],
    });

    // ── Cryptonice Article 6 (FEATURED) ──
    await createArticle({
      title: 'NFT Market Evolution: Beyond Digital Art',
      slug: 'nft-market-evolution-beyond-digital-art',
      excerpt: 'NFTs exploded as digital art collectibles but their utility extends far beyond JPEGs. Explore how NFTs are evolving into infrastructure for gaming, ticketing, identity, and real-world asset tokenization.',
      isFeatured: true,
      isTrending: false,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['nft-metaverse'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['market-insight'].documentId, cryptoniceTags['project-review'].documentId],
      content: [
        p('The NFT market\'s 2021 frenzy — $25 billion in trading volume for digital art and profile picture collections — gave way to a brutal correction. But beneath the speculative excess, real utility use cases were maturing. In 2024–2026, the NFT narrative has fundamentally shifted from "art speculation" to "programmable ownership infrastructure."'),
        h2('Gaming: True Ownership of In-Game Assets'),
        p('Traditional games lock items in walled gardens — your skins, weapons, and characters belong to the game company. NFT-based games give players genuine ownership of in-game assets they can trade, sell, or take to compatible games. Projects like Illuvium, Guild of Guardians, and Gods Unchained are pioneering this model.'),
        h2('Ticketing and Event Access'),
        p('NFT tickets eliminate fraud (provable authenticity on chain), enable programmable royalties for artists on secondary sales, and create unique collectible experiences for attendees. Ticketmaster, Live Nation, and smaller venues are actively experimenting with blockchain ticketing.'),
        h2('Real-World Asset (RWA) Tokenization'),
        p('Tokenizing real estate, art, commodities, and bonds as NFTs enables fractional ownership, 24/7 trading, and programmable governance. BlackRock\'s BUIDL tokenized money market fund and various tokenized real estate platforms signal mainstream institutional adoption of this concept.'),
        h2('Digital Identity and Credentials'),
        p('Soulbound tokens (non-transferable NFTs) can represent academic credentials, professional certifications, and identity attributes — creating a new paradigm for verifiable, self-sovereign digital identity.'),
        p('The NFT technology stack is becoming infrastructure. Dismiss it as a fad at your peril — the underlying programmable ownership primitive is here to stay.'),
      ],
    });

    // ── Cryptonice Articles 7-12 (TRENDING) ──
    await createArticle({
      title: 'Web3 Social Media: Can Decentralization Fix the Internet?',
      slug: 'web3-social-media-can-decentralization-fix-the-internet',
      excerpt: 'Centralized social media platforms control your data, censor content, and monetize your attention. Web3 social platforms promise user ownership, censorship resistance, and creator monetization.',
      isFeatured: false,
      isTrending: true,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['web3'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['market-insight'].documentId, cryptoniceTags['project-review'].documentId],
      content: [
        p('Facebook, Twitter/X, YouTube, and TikTok have billions of users but are built on a fundamentally exploitative model: they own your data, can silence your voice, and extract your attention for advertising revenue. Web3 social media proposes a radical alternative.'),
        h2('The Web3 Social Promise'),
        p('Lens Protocol, Farcaster, and Nostr are building social graphs on decentralized infrastructure. Your profile, followers, and content exist on chain — not inside any company\'s servers. If a platform builds a bad product, you can migrate to a competing app while keeping your social graph intact.'),
        h2('Creator Economy Revolution'),
        p('Web3 enables direct monetization without platform intermediaries. Creators can token-gate content, sell NFTs to superfans, receive crypto tips, and build subscription models with smart contracts — keeping far more revenue than traditional platform models allow.'),
        h2('Current Limitations'),
        p('User experience is still complex, gas fees create friction, and network effects heavily favor incumbents. The mass migration from centralized platforms has not yet occurred. But the infrastructure is maturing rapidly.'),
        p('Web3 social is a long-term bet on a more open, user-owned internet. Early adopters are building the foundation today.'),
      ],
    });

    await createArticle({
      title: 'Crypto Trading Psychology: Mastering Fear and Greed',
      slug: 'crypto-trading-psychology-mastering-fear-and-greed',
      excerpt: 'Crypto markets are extreme amplifiers of human emotion. Fear and greed destroy more crypto portfolios than bad projects do. Learn the psychological disciplines that separate profitable traders from the rest.',
      isFeatured: false,
      isTrending: true,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['trading-analysis'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['tutorial'].documentId, cryptoniceTags['market-insight'].documentId],
      content: [
        p('The crypto market\'s 24/7 nature, extreme volatility, and social media amplification create a psychological battlefield. Studies show that emotional decision-making is the primary reason most retail crypto traders lose money. Mastering trading psychology is not optional — it is the precondition for any edge.'),
        h2('The Fear and Greed Cycle'),
        p('The Crypto Fear and Greed Index tracks market sentiment from 0 (extreme fear) to 100 (extreme greed). Historically, extreme fear marks market bottoms (buying opportunities) and extreme greed marks tops (selling opportunities). The contrarian discipline of "buying when others are fearful" is simple in theory, devastatingly hard in practice.'),
        h2('FOMO: The Portfolio Killer'),
        p('Fear of missing out drives investors to buy assets at peak prices after they have already rallied 10x. FOMO buying consistently produces losses. The antidote: a pre-defined entry strategy based on price levels, not social media sentiment.'),
        h2('Building a Trading Plan'),
        p('Define: entry criteria, exit criteria (both profit taking and stop loss), position sizing rules, and maximum portfolio risk. Stick to your plan. Review performance weekly. Adjust strategy quarterly based on data, not emotion.'),
        p('The most profitable crypto investors are not the most intelligent — they are the most disciplined. Build your process, follow it, and let the edge compound over time.'),
      ],
    });

    await createArticle({
      title: 'Layer 2 Solutions Explained: Scaling Ethereum for Mass Adoption',
      slug: 'layer-2-solutions-explained-scaling-ethereum-for-mass-adoption',
      excerpt: 'Ethereum\'s base layer cannot handle the transaction volume required for global adoption. Layer 2 scaling solutions are the answer — here\'s how they work and which are leading the race.',
      isFeatured: false,
      isTrending: true,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['blockchain-tech'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['tutorial'].documentId, cryptoniceTags['project-review'].documentId],
      content: [
        p('Ethereum processes approximately 15 transactions per second on its base layer — far too few for global financial infrastructure. Layer 2 (L2) networks process transactions off-chain and batch them onto Ethereum, inheriting its security while offering dramatically higher throughput and lower fees.'),
        h2('Optimistic Rollups: Arbitrum and Optimism'),
        p('Optimistic rollups assume transactions are valid by default (optimistically) and allow a challenge period for fraud proofs. Arbitrum and Optimism are the dominant optimistic rollup chains, supporting the full Ethereum Virtual Machine (EVM) and boasting multi-billion dollar DeFi ecosystems.'),
        h2('ZK-Rollups: The Future Standard'),
        p('Zero-knowledge rollups use cryptographic proofs (ZK-SNARKs or ZK-STARKs) to mathematically verify transaction validity without re-executing all computations. This enables faster finality and greater scalability. zkSync Era, Starknet, and Polygon zkEVM are leading ZK rollup implementations.'),
        h2('Base: Coinbase\'s L2'),
        p('Built on the Optimism tech stack (OP Stack), Base is Coinbase\'s L2 that onboards millions of Coinbase retail users to DeFi and Web3. Its integration with the largest U.S. crypto exchange gives it unique user acquisition advantages.'),
        p('Layer 2 adoption is accelerating. Ethereum\'s future is a multi-L2 ecosystem where the base layer serves as the settlement and security layer, and L2s serve as the execution environments.'),
      ],
    });

    await createArticle({
      title: 'Bitcoin ETFs: The Institutional Revolution in Crypto',
      slug: 'bitcoin-etfs-the-institutional-revolution-in-crypto',
      excerpt: 'The approval of Bitcoin spot ETFs in the U.S. in January 2024 was a watershed moment. Understand what ETFs mean for Bitcoin\'s market structure, price dynamics, and long-term trajectory.',
      isFeatured: false,
      isTrending: true,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['bitcoin'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['breaking-news-crypto'].documentId, cryptoniceTags['market-insight'].documentId],
      content: [
        p('The SEC\'s approval of spot Bitcoin ETFs from BlackRock (iShares Bitcoin Trust), Fidelity, and other major asset managers in January 2024 marked the most significant development in Bitcoin\'s institutionalization journey. Within weeks, Bitcoin ETFs attracted billions in inflows, validating crypto as a legitimate asset class for traditional finance.'),
        h2('Why ETFs Matter'),
        p('ETFs provide regulated, familiar exposure to Bitcoin for institutional investors (pension funds, endowments, RIAs) and retail investors who prefer not to manage self-custody. They remove the complexity barrier and fit within existing portfolio management frameworks.'),
        h2('Market Structure Impact'),
        p('ETF inflows create systematic, price-insensitive buying demand that differs fundamentally from speculative retail demand. This structural change supports price floors and reduces the extreme drawdowns that characterized earlier Bitcoin cycles.'),
        h2('Custody and Counterparty Considerations'),
        p('ETF shares are not the same as self-custodied Bitcoin — you don\'t control the keys. For long-term holders with a personal freedom ethos, self-custody remains preferred. ETFs are a tool for financial advisors and institutions, not a replacement for direct ownership.'),
        p('Bitcoin ETFs are the bridge between traditional finance and the crypto economy. Their long-term significance for adoption and price discovery cannot be overstated.'),
      ],
    });

    await createArticle({
      title: 'DAO Governance: Decentralized Organizations and Their Challenges',
      slug: 'dao-governance-decentralized-organizations-and-their-challenges',
      excerpt: 'Decentralized Autonomous Organizations (DAOs) promise democratic, transparent governance of protocols and organizations. But the reality of DAO governance reveals both promise and significant challenges.',
      isFeatured: false,
      isTrending: true,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['web3'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['project-review'].documentId, cryptoniceTags['market-insight'].documentId],
      content: [
        p('A DAO (Decentralized Autonomous Organization) is an organization governed by smart contracts and token voting rather than traditional management hierarchies. MakerDAO, Uniswap, Compound, and Aave are among the most prominent examples, collectively managing billions in protocol assets.'),
        h2('How DAO Governance Works'),
        p('Token holders submit and vote on governance proposals covering: protocol parameter changes, treasury spending, product roadmap decisions, and partnership approvals. Voting power is typically proportional to token holdings, though some DAOs experiment with quadratic voting to reduce plutocracy.'),
        h2('The Voter Apathy Problem'),
        p('Most DAOs struggle with participation — less than 10% of token holders typically vote on proposals. Large holders ("whales") disproportionately influence outcomes. This creates a de facto centralization that contradicts the decentralization ideal.'),
        h2('Delegation and Liquid Democracy'),
        p('Delegation allows passive token holders to delegate their voting power to engaged, expert delegates. Compound and ENS have adopted delegate systems that improve participation rates and governance quality.'),
        p('DAO governance is evolving rapidly. The organizations that solve participation and plutocracy challenges while maintaining decentralization will define the future of on-chain coordination.'),
      ],
    });

    await createArticle({
      title: 'Crypto Regulation in 2026: Global Policy Landscape',
      slug: 'crypto-regulation-in-2026-global-policy-landscape',
      excerpt: 'Regulatory clarity — or lack thereof — remains the biggest wildcard for crypto markets. We survey the regulatory landscape across the U.S., EU, Asia, and emerging markets heading into 2026.',
      isFeatured: false,
      isTrending: true,
      site: cryptoniceSite.documentId,
      category: cryptoniceCategories['regulation'].documentId,
      author: authorDavid.documentId,
      tags: [cryptoniceTags['breaking-news-crypto'].documentId, cryptoniceTags['market-insight'].documentId],
      content: [
        p('Regulatory clarity is simultaneously the most anticipated and most feared development in crypto. Clear rules enable institutional adoption and retail confidence; poorly designed regulations stifle innovation. In 2026, the global regulatory landscape is a patchwork of approaches.'),
        h2('United States'),
        p('The U.S. continues to navigate a complex jurisdictional battle between the SEC and CFTC over crypto asset classification. Post-ETF approval, legislative progress on comprehensive crypto regulation (similar to the FIT21 bill) has gained momentum, with clearer commodity vs. security distinctions emerging.'),
        h2('European Union'),
        p('The EU\'s MiCA (Markets in Crypto Assets) regulation — the world\'s first comprehensive crypto regulatory framework — came into full effect in 2024. It provides crypto businesses with clear licensing requirements and consumer protection rules, making the EU a leading jurisdiction for compliant crypto operations.'),
        h2('Asia'),
        p('Singapore maintains its status as Asia\'s crypto-friendly hub with clear MAS guidelines. Hong Kong has opened to retail crypto trading with licensed exchanges. Japan\'s FSA provides one of the most mature regulatory frameworks for crypto assets. China maintains its ban.'),
        p('The trend toward regulatory clarity, while uneven globally, is net positive for long-term crypto adoption. Compliant projects operating in clear jurisdictions will benefit most.'),
      ],
    });

    // ── Cryptonice Articles 13-24 (REGULAR) ──
    const cryptoniceRegularArticles = [
      {
        title: 'What Is Blockchain Technology? A Plain-English Explanation',
        slug: 'what-is-blockchain-technology-a-plain-english-explanation',
        excerpt: 'Blockchain technology is the foundation of cryptocurrencies and Web3. This plain-English explanation breaks down how blockchains work, why they matter, and where they are headed.',
        category: 'blockchain-tech',
        tags: ['tutorial', 'market-insight'],
      },
      {
        title: 'How to Buy Your First Bitcoin: Step-by-Step Guide 2026',
        slug: 'how-to-buy-your-first-bitcoin-step-by-step-guide-2026',
        excerpt: 'Buying Bitcoin for the first time can feel overwhelming. This step-by-step guide walks you through choosing an exchange, verifying your identity, and making your first purchase safely.',
        category: 'crypto-education',
        tags: ['tutorial', 'breaking-news-crypto'],
      },
      {
        title: 'Altcoin Season: How to Identify and Profit From the Next Wave',
        slug: 'altcoin-season-how-to-identify-and-profit-from-the-next-wave',
        excerpt: 'Altcoin seasons — periods when altcoins dramatically outperform Bitcoin — are cyclical phenomena driven by BTC dominance shifts. Learn how to spot and ride the next altcoin wave.',
        category: 'altcoins',
        tags: ['price-alert', 'market-insight'],
      },
      {
        title: 'Crypto Portfolio Management: Balancing Risk and Reward',
        slug: 'crypto-portfolio-management-balancing-risk-and-reward',
        excerpt: 'Managing a crypto portfolio requires a different approach than traditional investing. Learn position sizing, rebalancing strategies, and risk management tailored to crypto\'s unique volatility.',
        category: 'trading-analysis',
        tags: ['tutorial', 'market-insight'],
      },
      {
        title: 'Stablecoins Explained: USDT, USDC, DAI, and How They Work',
        slug: 'stablecoins-explained-usdt-usdc-dai-and-how-they-work',
        excerpt: 'Stablecoins are the backbone of the crypto ecosystem. Understanding the differences between fiat-backed, crypto-backed, and algorithmic stablecoins is essential for every crypto user.',
        category: 'crypto-education',
        tags: ['tutorial', 'market-insight'],
      },
      {
        title: 'The Metaverse Investment Thesis: Hype vs. Reality in 2026',
        slug: 'the-metaverse-investment-thesis-hype-vs-reality-in-2026',
        excerpt: 'After the 2022 metaverse hype peak, which aspects of the virtual world vision are delivering real value? We separate enduring opportunity from overvalued speculation.',
        category: 'nft-metaverse',
        tags: ['market-insight', 'project-review'],
      },
      {
        title: 'Crypto Tax Guide: What You Need to Report in 2026',
        slug: 'crypto-tax-guide-what-you-need-to-report-in-2026',
        excerpt: 'Crypto taxes confuse even experienced investors. This guide covers taxable events, capital gains treatment, DeFi complications, and reporting requirements for 2026.',
        category: 'regulation',
        tags: ['tutorial', 'breaking-news-crypto'],
      },
      {
        title: 'Bitcoin Mining in 2026: Profitability, Energy, and Future',
        slug: 'bitcoin-mining-in-2026-profitability-energy-and-future',
        excerpt: 'Bitcoin mining post-2024 halving operates in a new economic reality. We analyze mining profitability, the energy debate, geographic shifts, and what mining\'s future looks like.',
        category: 'bitcoin',
        tags: ['market-insight', 'breaking-news-crypto'],
      },
      {
        title: 'Chainlink and the Oracle Problem: Connecting Blockchain to the Real World',
        slug: 'chainlink-and-the-oracle-problem-connecting-blockchain-to-the-real-world',
        excerpt: 'Smart contracts cannot access real-world data on their own — the oracle problem. Chainlink\'s decentralized oracle network is the dominant solution, powering billions in DeFi value.',
        category: 'blockchain-tech',
        tags: ['project-review', 'tutorial'],
      },
      {
        title: 'Polkadot and Cosmos: The Interoperability Race',
        slug: 'polkadot-and-cosmos-the-interoperability-race',
        excerpt: 'Blockchain interoperability — enabling different chains to communicate — is critical for the multi-chain future. Polkadot and Cosmos are the two leading architectures solving this problem.',
        category: 'altcoins',
        tags: ['project-review', 'market-insight'],
      },
      {
        title: 'DeFi Insurance: Protecting Your Crypto from Smart Contract Risk',
        slug: 'defi-insurance-protecting-your-crypto-from-smart-contract-risk',
        excerpt: 'Smart contract exploits have cost DeFi users billions. DeFi insurance protocols like Nexus Mutual and InsurAce offer coverage against these risks. Here\'s how they work.',
        category: 'defi',
        tags: ['tutorial', 'market-insight'],
      },
      {
        title: 'The Road to $1 Million Bitcoin: Analyzing Long-Term Price Models',
        slug: 'the-road-to-1-million-bitcoin-analyzing-long-term-price-models',
        excerpt: 'Stock-to-Flow, Metcalfe\'s Law, and macro adoption models all point to dramatically higher Bitcoin prices. We examine the assumptions and validity of bullish long-term price models.',
        category: 'bitcoin',
        tags: ['price-alert', 'market-insight'],
      },
    ];

    for (const art of cryptoniceRegularArticles) {
      await createArticle({
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        isFeatured: false,
        isTrending: false,
        site: cryptoniceSite.documentId,
        category: cryptoniceCategories[art.category].documentId,
        author: authorDavid.documentId,
        tags: art.tags.map((t: string) => cryptoniceTags[t].documentId),
        content: [
          p(art.excerpt),
          h2('Introduction'),
          p(`This in-depth analysis covers ${art.title.toLowerCase()}, providing essential context for anyone navigating the cryptocurrency and blockchain space in 2026. The crypto ecosystem evolves rapidly, and staying informed is critical for making sound decisions.`),
          h2('Key Concepts'),
          p('The blockchain industry is at an inflection point where technological maturity meets institutional adoption. Understanding the fundamental drivers behind each development helps separate sustainable trends from speculative cycles.'),
          h2('Market Implications'),
          p('Market participants who understand the underlying mechanics, risks, and opportunities are positioned to make more informed decisions. Always conduct your own research and never invest more than you can afford to lose.'),
          h2('Outlook'),
          p('The cryptocurrency space continues to mature. Projects with real utility, strong communities, and sound tokenomics are separating from speculative plays. Focus on fundamentals and long-term value creation.'),
        ],
      });
    }

    strapi.log.info('[Seed] Cryptonice articles created.');

    // ─────────────────────────────────────────────
    // STEP 3G: ARTICLES — Health & Beauty
    // ─────────────────────────────────────────────
    strapi.log.info('[Seed] Creating Health & Beauty articles...');

    // ── Health Article 1 (FEATURED, long content) ──
    await createArticle({
      title: 'The Ultimate Morning Skincare Routine for Every Skin Type',
      slug: 'the-ultimate-morning-skincare-routine-for-every-skin-type',
      excerpt: 'Your morning skincare routine sets the tone for your skin\'s health throughout the day. This comprehensive guide covers the right products and techniques for every skin type — from oily to dry to sensitive.',
      isFeatured: true,
      isTrending: false,
      site: healthSite.documentId,
      category: healthCategories['skincare'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['editors-pick'].documentId, healthTags['how-to-guide'].documentId],
      content: [
        p('A morning skincare routine is not just about applying products — it is about preparing your skin to face the day with protection, hydration, and a healthy foundation. Getting the sequence right, using appropriate products for your skin type, and applying them correctly can transform your skin over weeks and months.'),
        h2('The Universal Morning Routine Framework'),
        p('Regardless of skin type, every morning routine should follow this sequence: cleanser → toner (optional) → serum → moisturizer → SPF. Each step serves a distinct purpose, and the order matters because ingredients are applied from thinnest to thickest texture.'),
        h2('Step 1: Cleansing'),
        h3('Oily and Combination Skin'),
        p('Use a gentle foaming or gel cleanser that removes overnight sebum without stripping the skin barrier. Look for niacinamide or salicylic acid at low concentrations to address oil control. CeraVe Foaming Facial Cleanser and La Roche-Posay Effaclar Gel are dermatologist favorites.'),
        h3('Dry and Normal Skin'),
        p('A cream or milk cleanser preserves natural oils and maintains hydration levels. Avoid anything that creates a "squeaky clean" feeling — that\'s your skin barrier being stripped. Cetaphil Gentle Skin Cleanser is a gold standard for sensitive and dry skin types.'),
        h2('Step 2: Vitamin C Serum — The Morning Game-Changer'),
        p('Vitamin C (ascorbic acid) is arguably the most impactful morning serum ingredient. It neutralizes free radicals (environmental damage from pollution and UV), brightens hyperpigmentation, boosts collagen synthesis, and enhances SPF effectiveness when layered beneath sunscreen.'),
        p('L-ascorbic acid at 10–20% concentration in a low pH formulation is most potent but can irritate sensitive skin. Vitamin C derivatives (ascorbyl glucoside, sodium ascorbyl phosphate) are gentler alternatives with good efficacy. Store Vitamin C serums in a cool, dark place to prevent oxidation.'),
        h2('Step 3: Moisturizer'),
        p('Moisturizers lock in hydration applied by previous steps and strengthen the skin barrier. Hyaluronic acid (a humectant that draws moisture from the air) combined with ceramides (barrier-restoring lipids) creates an excellent moisture-sealing combination.'),
        p('For oily skin, a lightweight gel-cream or oil-free moisturizer provides hydration without clogging pores. For dry skin, a richer cream with occlusives like shea butter or squalane creates a more substantial moisture seal.'),
        h2('Step 4: SPF — Non-Negotiable'),
        p('Sunscreen is the single most important anti-aging product you will ever use. UV radiation is responsible for 80–90% of visible skin aging — wrinkles, dark spots, loss of elasticity. Apply SPF 30 minimum (SPF 50+ preferred) every single morning, regardless of weather or whether you plan to be outdoors.'),
        p('Mineral sunscreens (zinc oxide, titanium dioxide) are best for sensitive skin and provide immediate protection. Chemical sunscreens (avobenzone, oxybenzone) are lighter textured and preferred for oily skin. Hybrid formulas combine both.'),
        h2('Building Consistency'),
        p('The most effective skincare routine is the one you actually follow consistently. Start simple — cleanser, moisturizer, SPF — and add actives gradually as you learn how your skin responds. Consistency over months beats perfect but inconsistent routines.'),
      ],
    });

    // ── Health Article 2 (FEATURED, long content) ──
    await createArticle({
      title: 'HIIT vs Steady-State Cardio: Which Burns More Fat?',
      slug: 'hiit-vs-steady-state-cardio-which-burns-more-fat',
      excerpt: 'The HIIT vs steady-state cardio debate has divided fitness enthusiasts for years. Science provides clear answers about which is more effective for fat loss, cardiovascular health, and overall fitness.',
      isFeatured: true,
      isTrending: false,
      site: healthSite.documentId,
      category: healthCategories['fitness'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['expert-advice'].documentId, healthTags['how-to-guide'].documentId],
      content: [
        p('Walk into any gym and you\'ll find two camps: high-intensity interval trainers who swear by 20-minute workouts, and steady-state runners logging 45-minute treadmill sessions. Both are convinced their approach is superior for fat loss. Science says the answer is more nuanced — and both have a role in an optimal fitness program.'),
        h2('Defining the Two Approaches'),
        h3('HIIT (High-Intensity Interval Training)'),
        p('HIIT alternates between short bursts of maximum or near-maximum effort and recovery periods. A classic protocol: 30 seconds sprinting at 90–95% maximum heart rate, followed by 90 seconds walking, repeated 8–10 times (20 minutes total). Other popular formats include Tabata (20 seconds on, 10 seconds off) and circuit training.'),
        h3('Steady-State Cardio (LISS)'),
        p('Low-Intensity Steady-State (LISS) cardio maintains a consistent, moderate intensity (60–70% max heart rate) for 30–60 minutes. Examples: brisk walking, jogging, cycling, swimming at a sustainable pace. The "fat-burning zone" traditionally associated with this approach refers to the percentage of calories from fat (higher at low intensity), not the absolute amount.'),
        h2('The Science of Fat Burning'),
        p('During HIIT, you burn primarily glycogen (carbohydrates) due to the high intensity. During steady-state, you burn a higher proportion of fat. However, HIIT creates an "afterburn effect" (Excess Post-Exercise Oxygen Consumption, or EPOC) — your metabolism remains elevated for 12–24 hours after exercise, burning additional calories.'),
        p('Research comparing equal-calorie HIIT vs. steady-state workouts shows HIIT produces marginally more total fat loss when controlling for calories. However, the difference is smaller than fitness influencers suggest.'),
        h2('Cardiovascular Benefits'),
        p('HIIT produces superior cardiovascular adaptations per unit of time: improved VO2 max (maximal oxygen uptake), enhanced cardiac function, and better insulin sensitivity. A landmark 2013 study found 12 weeks of HIIT improved aerobic capacity equivalent to three times the volume of moderate-intensity training.'),
        p('Steady-state cardio builds aerobic base, improves fat oxidation efficiency, and is less taxing on the central nervous system — making it superior for active recovery and stress management.'),
        h2('Practical Recommendation'),
        p('The optimal approach combines both: 2–3 HIIT sessions per week for metabolic conditioning and time efficiency, supplemented by 2–3 steady-state sessions for active recovery and aerobic base building. Total cardio volume depends on your goals — fat loss, endurance, or general health.'),
        p('For beginners, start with steady-state to build fitness before adding HIIT. For advanced athletes, periodize between phases emphasizing each type to prevent adaptation plateaus.'),
        h2('Recovery Matters'),
        p('HIIT places significant stress on muscles, joints, and the nervous system. Adequate recovery — 48 hours between HIIT sessions, proper nutrition, and 7–9 hours of sleep — determines whether training produces results or injuries. More is not always better; smarter is better.'),
      ],
    });

    // ── Health Article 3 (FEATURED) ──
    await createArticle({
      title: 'The Science Behind Retinol: Benefits, Usage, and Myths Debunked',
      slug: 'the-science-behind-retinol-benefits-usage-and-myths-debunked',
      excerpt: 'Retinol is dermatology\'s most evidence-backed anti-aging ingredient. Learn the science, the correct way to incorporate it into your routine, and the myths that stop people from using it.',
      isFeatured: true,
      isTrending: false,
      site: healthSite.documentId,
      category: healthCategories['skincare'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['expert-advice'].documentId, healthTags['editors-pick'].documentId],
      content: [
        p('Of all the ingredients in skincare, retinol has the most extensive scientific evidence supporting its efficacy. Decades of clinical research have established retinoids as the gold standard for anti-aging, acne treatment, and skin texture improvement. Yet many people avoid retinol due to fear of irritation or confusion about how to use it.'),
        h2('What is Retinol and How Does It Work?'),
        p('Retinol is a form of Vitamin A, a fat-soluble vitamin essential for skin cell function. When applied to skin, retinol is converted through a multi-step process to retinoic acid (tretinoin), the biologically active form that binds to nuclear receptors and regulates gene expression. This triggers: increased cell turnover, collagen and elastin synthesis, inhibition of matrix metalloproteinases (enzymes that break down collagen), and reduction of melanin production.'),
        h2('Clinically Proven Benefits'),
        p('Wrinkle reduction: Multiple double-blind, randomized controlled trials demonstrate 0.05–0.1% retinol significantly reduces fine lines and wrinkles. Acne: Retinoids normalize follicular keratinization, preventing the pore blockages that cause acne. Hyperpigmentation: Accelerated cell turnover fades dark spots. Skin texture: Refined pores, smoother surface.'),
        h2('Starting Retinol: The Correct Protocol'),
        p('Start slow to minimize the "retinol purge" (temporary breakout as cells turn over faster) and irritation. Begin with 0.025–0.05% concentration, applied twice weekly at night for 4 weeks, then every other night for 4 weeks, then nightly. Apply on dry skin 20 minutes after cleansing to reduce irritation. Always follow with moisturizer.'),
        h2('Common Myths Debunked'),
        p('Myth 1: "Retinol thins your skin." FALSE. It thickens the dermis by stimulating collagen. It does thin the outermost dead skin layer (stratum corneum), improving texture. Myth 2: "You cannot use retinol in summer." FALSE. You can use retinol year-round with SPF protection. Myth 3: "Retinol doesn\'t work for sensitive skin." FALSE — start lower concentration and buffer with moisturizer.'),
        p('Retinol is a transformative ingredient when used correctly. Patience is essential — significant results typically appear after 3–6 months of consistent use.'),
      ],
    });

    // ── Health Article 4 (FEATURED) ──
    await createArticle({
      title: 'Mindfulness Meditation: A Beginner\'s 21-Day Guide',
      slug: 'mindfulness-meditation-a-beginners-21-day-guide',
      excerpt: 'Scientific evidence for mindfulness meditation\'s mental and physical health benefits is overwhelming. This structured 21-day beginner\'s program helps you build a sustainable practice from scratch.',
      isFeatured: true,
      isTrending: false,
      site: healthSite.documentId,
      category: healthCategories['mental-health'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['how-to-guide'].documentId, healthTags['expert-advice'].documentId],
      content: [
        p('Mindfulness meditation — the practice of deliberately focusing attention on present-moment experience with non-judgmental awareness — has moved from ancient Buddhist monasteries to hospital treatment programs, corporate wellness initiatives, and elite sports coaching. The science is compelling: regular meditation practice measurably changes the brain structure, reduces stress hormones, and improves a wide range of health outcomes.'),
        h2('The Science of Mindfulness'),
        p('Neuroimaging studies show that 8 weeks of mindfulness practice produce measurable changes in the brain: increased gray matter density in the hippocampus (memory, learning), prefrontal cortex (attention, decision-making), and insula (body awareness), alongside decreased amygdala activity (stress response, fear reactivity). These structural changes correspond to reported improvements in focus, emotional regulation, and stress resilience.'),
        h2('Week 1: Foundation (Days 1–7)'),
        p('Start with 5–10 minutes of breath awareness meditation. Sit comfortably, close your eyes, and simply observe your natural breath without trying to control it. When your mind wanders (it will — constantly), gently return attention to the breath. This is the practice: noticing wandering and returning. Aim for 5–7 sessions this week.'),
        h2('Week 2: Deepening (Days 8–14)'),
        p('Extend sessions to 10–15 minutes. Introduce body scan practice: systematically move attention from feet to crown, observing physical sensations with curiosity. Add mindful moments throughout the day: eating one meal mindfully, walking without phone, full attention to a conversation.'),
        h2('Week 3: Integration (Days 15–21)'),
        p('Extend to 15–20 minutes. Introduce loving-kindness (Metta) meditation: extend feelings of goodwill to yourself, loved ones, neutral people, and difficult people. This practice specifically reduces self-criticism and increases compassion — both linked to better mental health outcomes.'),
        h2('Overcoming Common Obstacles'),
        p('"I can\'t clear my mind." You\'re not supposed to. Meditation is not about an empty mind — it\'s about observing thoughts without attaching to them. "I don\'t have time." Start with 5 minutes. Consistency matters more than duration. "I fall asleep." Try meditating sitting upright with eyes slightly open.'),
        p('By Day 21, you will have established the foundational skills of a lifetime practice. The cumulative benefits compound dramatically with years of consistent practice.'),
      ],
    });

    // ── Health Article 5 (FEATURED) ──
    await createArticle({
      title: '10 High-Protein Breakfast Ideas for Sustained Energy',
      slug: '10-high-protein-breakfast-ideas-for-sustained-energy',
      excerpt: 'A protein-rich breakfast stabilizes blood sugar, reduces hunger hormones, and sustains energy through the morning. These 10 delicious, practical recipes make high-protein mornings easy.',
      isFeatured: true,
      isTrending: false,
      site: healthSite.documentId,
      category: healthCategories['nutrition'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['how-to-guide'].documentId, healthTags['editors-pick'].documentId],
      content: [
        p('Breakfast protein intake is one of the most well-studied areas of nutrition science. Consuming 25–40 grams of protein at breakfast significantly reduces appetite hormones (ghrelin), stabilizes blood glucose, prevents muscle catabolism, and maintains cognitive performance throughout the morning. Here are 10 practical, delicious options.'),
        h2('1. Greek Yogurt Parfait with Hemp Seeds'),
        p('Plain Greek yogurt (0% or 2% fat) provides approximately 17–20g protein per cup. Layer with mixed berries, 2 tablespoons hemp seeds (additional 7g protein), and a drizzle of honey. Total protein: approximately 24–27g. Preparation time: 2 minutes.'),
        h2('2. Cottage Cheese with Fruit'),
        p('1 cup low-fat cottage cheese provides approximately 28g protein with minimal fat and carbohydrates. Add sliced peaches or pineapple for flavor and natural sweetness. Simple, versatile, and nutrient-dense.'),
        h2('3. Two-Egg Veggie Omelette'),
        p('Two whole eggs provide 12g protein. Add ½ cup egg whites (an additional 13g) for a 25g protein omelette. Fill with spinach, mushrooms, bell peppers, and feta cheese. Prepare in under 5 minutes.'),
        h2('4. Protein Smoothie'),
        p('Blend: 1 scoop whey or plant-based protein powder (20–25g protein), 1 cup unsweetened almond milk, ½ frozen banana, 1 tablespoon almond butter, handful of spinach. Total protein: 25–30g. Ready in 2 minutes.'),
        h2('5. Smoked Salmon on Whole Grain Toast'),
        p('3oz smoked salmon provides approximately 16g protein. On 2 slices whole grain toast with cream cheese, capers, and red onion. Omega-3 rich, satisfying, and takes 3 minutes to prepare.'),
        h2('6–10: More Quick Options'),
        p('6. Overnight Oats with Protein Powder — prepare the night before, grab and go. 7. Turkey and Egg Wrap — lean turkey breast with scrambled eggs in a whole wheat tortilla. 8. Edamame with Boiled Eggs — Japanese-inspired protein-packed morning bowl. 9. Quinoa Breakfast Bowl — with poached eggs and avocado for complete amino acids. 10. Chia Pudding with Collagen — prepared overnight, customizable toppings, 20+ grams protein.'),
        p('Rotate through these options to prevent breakfast monotony while maintaining consistent protein intake. Your energy levels, body composition, and cognitive performance will thank you within weeks.'),
      ],
    });

    // ── Health Article 6 (FEATURED) ──
    await createArticle({
      title: 'Understanding Your Skin Barrier: Why It Matters More Than Products',
      slug: 'understanding-your-skin-barrier-why-it-matters-more-than-products',
      excerpt: 'Your skin barrier is the foundation of healthy skin. No serum or treatment works optimally on a compromised barrier. Learn what the skin barrier is, how to protect it, and how to repair damage.',
      isFeatured: true,
      isTrending: false,
      site: healthSite.documentId,
      category: healthCategories['skincare'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['expert-advice'].documentId, healthTags['editors-pick'].documentId],
      content: [
        p('The skin barrier — technically the stratum corneum, the outermost layer of your epidermis — is your skin\'s first and most important defense against the world. It keeps moisture in and irritants, pathogens, and pollution out. When the skin barrier is intact, skin looks plump, even-toned, and healthy. When it is compromised, no amount of expensive serums will fix the underlying problem.'),
        h2('The Science of the Skin Barrier'),
        p('The stratum corneum is structured like a "brick and mortar" wall: corneocytes (dead skin cells) are the bricks, embedded in a lipid matrix (the mortar) composed primarily of ceramides (50%), cholesterol (25%), and free fatty acids (15%). This specific lipid ratio is critical for barrier function.'),
        h2('Signs of a Compromised Barrier'),
        p('Persistent redness and sensitivity, stinging when applying skincare products, tightness and flakiness despite moisturizing, increased breakouts, and dull, lackluster skin all indicate barrier compromise. These symptoms are often misattributed to "skin type" when they are actually barrier damage.'),
        h2('What Damages the Skin Barrier?'),
        p('Over-exfoliation (physical or chemical), harsh cleansers with high pH, overuse of actives (retinoids, acids), low humidity environments, UV damage, certain medications, and insufficient sleep all degrade the skin barrier. The modern trend of multi-step routines with many active ingredients is a primary culprit of barrier damage.'),
        h2('How to Repair a Compromised Barrier'),
        p('Simplify your routine drastically: gentle cleanser + ceramide-rich moisturizer + SPF only. Stop all actives (retinol, acids, vitamin C) temporarily. Look for barrier-repairing ingredients: ceramides (CeraVe), squalane (The Ordinary), colloidal oatmeal (Aveeno), allantoin, and panthenol. Give your barrier 2–4 weeks to recover.'),
        p('Once repaired, reintroduce actives slowly, one at a time, monitoring your skin\'s response. Barrier health is the precondition for everything else in skincare to work.'),
      ],
    });

    // ── Health Articles 7-12 (TRENDING) ──
    await createArticle({
      title: 'The Anti-Inflammatory Diet: Foods That Heal and Harm',
      slug: 'the-anti-inflammatory-diet-foods-that-heal-and-harm',
      excerpt: 'Chronic inflammation underlies most modern diseases. The foods you eat either fight inflammation or fuel it. This science-backed guide reveals what to eat more of and what to minimize.',
      isFeatured: false,
      isTrending: true,
      site: healthSite.documentId,
      category: healthCategories['nutrition'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['expert-advice'].documentId, healthTags['trending-now'].documentId],
      content: [
        p('Chronic low-grade inflammation is now recognized as the common thread linking obesity, type 2 diabetes, cardiovascular disease, autoimmune conditions, and even depression. While acute inflammation is protective, chronic inflammation silently damages cells and accelerates aging. Diet is one of the most powerful levers for modulating inflammation.'),
        h2('Anti-Inflammatory Foods to Embrace'),
        p('Fatty fish (salmon, sardines, mackerel): rich in omega-3 fatty acids EPA and DHA, the most potent dietary anti-inflammatories. Aim for 3+ servings per week. Colorful vegetables and fruits: rich in polyphenols, carotenoids, and flavonoids that neutralize inflammatory free radicals. Extra virgin olive oil: oleocanthal has similar anti-inflammatory mechanism to ibuprofen. Turmeric (curcumin): powerful anti-inflammatory compound. Green tea: EGCG inhibits NF-κB, a master regulator of inflammation.'),
        h2('Pro-Inflammatory Foods to Minimize'),
        p('Refined carbohydrates and sugar: spike blood glucose, driving insulin resistance and inflammatory cytokine production. Industrial seed oils (soybean, corn, sunflower): high omega-6 to omega-3 ratios promote inflammation. Processed meats: advanced glycation end products (AGEs) trigger inflammatory responses. Alcohol: disrupts gut microbiome and triggers systemic inflammation.'),
        h2('The Mediterranean Diet: Gold Standard'),
        p('The Mediterranean diet — olive oil, vegetables, legumes, fish, whole grains, moderate wine — is the most researched dietary pattern for reducing inflammation. Multiple trials demonstrate significantly lower CRP (C-reactive protein, a key inflammation marker) in adherents.'),
        p('Start by adding more omega-3s and vegetables before worrying about what to eliminate. Dietary changes compound over months and years — consistency is the key variable.'),
      ],
    });

    await createArticle({
      title: 'Sleep Hygiene: The Complete Science-Based Guide to Better Sleep',
      slug: 'sleep-hygiene-the-complete-science-based-guide-to-better-sleep',
      excerpt: 'Poor sleep is a modern epidemic with devastating health consequences. This evidence-based guide covers circadian rhythm optimization, bedroom environment, and behavioral strategies for transformative sleep.',
      isFeatured: false,
      isTrending: true,
      site: healthSite.documentId,
      category: healthCategories['wellness'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['expert-advice'].documentId, healthTags['trending-now'].documentId],
      content: [
        p('We are in a global sleep deprivation crisis. The average adult sleeps 6.5–7 hours per night — below the 7–9 hours recommended for optimal health. Chronic sleep restriction is associated with increased risk of obesity, type 2 diabetes, cardiovascular disease, depression, and impaired immune function. The good news: sleep quality is largely within your control.'),
        h2('The Circadian Rhythm: Your Internal Clock'),
        p('Your circadian rhythm is a 24-hour biological cycle governed by light exposure and temperature. Morning light exposure suppresses melatonin and triggers cortisol — essential for wakefulness. As evening approaches, rising melatonin signals sleep onset. Any light exposure at night (especially blue light from screens) suppresses melatonin and delays sleep onset.'),
        h2('Bedroom Optimization'),
        p('Temperature: 65–68°F (18–20°C) is optimal for sleep onset and maintenance. Cool temperatures facilitate the core body temperature drop required for sleep. Darkness: complete darkness — blackout curtains or sleep mask. Even small light sources signal wakefulness. Quiet: white noise machine or earplugs to block disruptive sounds. Mattress and pillow: adequate support for your sleep position to prevent musculoskeletal pain.'),
        h2('Pre-Sleep Protocol (2 Hours Before Bed)'),
        p('Dim all lights — this mimics natural sunset and allows melatonin to rise. Avoid screens or use blue light blocking glasses. No caffeine after 2 PM (caffeine half-life is 5–7 hours). No large meals within 2–3 hours of bedtime. A warm bath or shower 1–2 hours before bed facilitates the body temperature drop that promotes sleep onset.'),
        p('Consistent sleep and wake times — even on weekends — are the single most impactful sleep hygiene intervention. Your body thrives on schedule predictability.'),
      ],
    });

    await createArticle({
      title: 'K-Beauty Trends 2026: The Korean Skincare Innovations Worth Trying',
      slug: 'k-beauty-trends-2026-the-korean-skincare-innovations-worth-trying',
      excerpt: 'Korean beauty continues to lead global skincare innovation. From fermented ingredients to skin barrier technology, discover the K-Beauty trends that are reshaping the beauty industry in 2026.',
      isFeatured: false,
      isTrending: true,
      site: healthSite.documentId,
      category: healthCategories['beauty-trends'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['trending-now'].documentId, healthTags['product-spotlight'].documentId],
      content: [
        p('Korean beauty (K-Beauty) has fundamentally changed how the world thinks about skincare. The 10-step Korean skincare routine introduced concepts — essence, ampoule, sheet masks, glass skin — that are now mainstream globally. In 2026, K-Beauty continues to push boundaries with innovations in fermentation, microbiome science, and "skip-care" minimalism.'),
        h2('Fermented Ingredients: The Microbiome Revolution'),
        p('Fermented skincare ingredients have been staples of Korean beauty for centuries — think makgeolli (rice wine) and hanbang (traditional Korean medicine). Modern Korean brands have elevated fermentation to a science. Bifida ferment lysate (found in SK-II and Missha FTE), lactobacillus ferment, and galactomyces ferment strengthen the skin microbiome while providing deep hydration and brightening.'),
        h2('Cica (Centella Asiatica) Skincare'),
        p('Centella Asiatica (tiger grass) has become the hero ingredient for barrier repair and soothing. Its active compounds — madecassoside, asiaticoside, asiatic acid — have clinically proven anti-inflammatory and wound-healing properties. K-Beauty brands like Dr. Jart+, I\'m From, and Skin1004 have popularized cica in serums, moisturizers, and sheet masks.'),
        h2('Glass Skin vs. Skin Cycling'),
        p('"Glass skin" — poreless, translucent, dewy skin — remains the ultimate K-Beauty aspiration. Achieving it focuses on layered hydration, essence application, and barrier-first principles. Meanwhile, the "skin cycling" trend (popularized globally) is gaining traction in K-Beauty: alternating active nights with recovery nights to balance efficacy with barrier health.'),
        p('K-Beauty\'s greatest contribution to global skincare is the philosophy of treating skincare as preventive healthcare rather than aesthetic enhancement. This mindset shift — starting skin protection early, prioritizing barrier health, and using gentle ingredients consistently — produces the remarkable results associated with Korean skin.'),
      ],
    });

    await createArticle({
      title: 'Home Workout Plan: Build Strength Without a Gym',
      slug: 'home-workout-plan-build-strength-without-a-gym',
      excerpt: 'You don\'t need a gym membership to build strength and improve your physique. This complete 12-week home workout program uses bodyweight exercises and minimal equipment for maximum results.',
      isFeatured: false,
      isTrending: true,
      site: healthSite.documentId,
      category: healthCategories['fitness'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['how-to-guide'].documentId, healthTags['trending-now'].documentId],
      content: [
        p('The global shift to home workouts during the pandemic revealed a powerful truth: you can build an impressive, functional physique without a gym. Research confirms that bodyweight training produces comparable strength and hypertrophy gains to weight training when volume and progressive overload principles are applied.'),
        h2('The Minimal Equipment Setup'),
        p('A pair of resistance bands ($20–30), a pull-up bar ($25–40), and optional adjustable dumbbells ($80–150) provide access to 95% of exercises available in a fully-equipped gym. Prioritize the pull-up bar — horizontal and vertical pulling movements are hardest to replicate without equipment.'),
        h2('The 12-Week Progressive Program'),
        h3('Weeks 1–4: Foundation'),
        p('3 sessions per week, alternating push (push-ups, dips, pike push-ups) and pull (bodyweight rows, resistance band pull-aparts) and legs (squats, lunges, glute bridges). Focus on form and full range of motion. 3 sets of 8–12 reps per exercise.'),
        h3('Weeks 5–8: Development'),
        p('Introduce harder variations: diamond push-ups, feet-elevated push-ups, single-leg squats (pistol squat progression), band-assisted pull-ups. Increase volume to 4 sets. Add one high-intensity circuit per week.'),
        h3('Weeks 9–12: Strength'),
        p('Pseudo planche push-ups, archer push-ups, full pistol squats, negative pull-ups (slow 5-second eccentric). This phase demands significant body control — modifications are available.'),
        p('Progressive overload is the key principle: consistently increasing difficulty (harder variations, more reps, slower tempo, shorter rest) is what drives continued improvement. Track your workouts to ensure progression.'),
      ],
    });

    await createArticle({
      title: 'Natural Hair Care: Transitioning and Thriving Without Chemicals',
      slug: 'natural-hair-care-transitioning-and-thriving-without-chemicals',
      excerpt: 'Transitioning to natural hair care reduces chemical exposure and can dramatically improve long-term hair health. This guide covers the transition process, natural ingredients that work, and building a sustainable routine.',
      isFeatured: false,
      isTrending: true,
      site: healthSite.documentId,
      category: healthCategories['hair-care'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['how-to-guide'].documentId, healthTags['trending-now'].documentId],
      content: [
        p('The clean beauty movement has reached hair care, with millions transitioning away from sulfates, silicones, parabens, and chemical treatments. Whether motivated by scalp health concerns, environmental consciousness, or better hair quality, the shift to natural hair care is significant and growing.'),
        h2('What to Eliminate and Why'),
        p('Sulfates (sodium lauryl sulfate, sodium laureth sulfate): strip natural oils from hair and scalp, triggering overproduction of sebum. Silicones: coat hair shaft creating softness but build up over time, blocking moisture and weighing hair down. Parabens and formaldehyde-releasers: potential endocrine disruptors that accumulate with long-term use.'),
        h2('Natural Alternatives That Actually Work'),
        p('Cleansing: co-washing (conditioner-only washing) for dry/curly hair; gentle sulfate-free shampoos with coco glucoside or decyl glucoside for all types. Conditioning: natural oils (argan, coconut, jojoba) as pre-wash treatments. Honey and aloe vera as humectants. Shea butter for sealing moisture on thicker hair types.'),
        h2('The Transition Period'),
        p('Expect 4–8 weeks of adjustment when your scalp recalibrates sebum production. Hair may feel different (more textured, less slippery) initially. Scalp massages stimulate circulation and support sebum balance during this period. Patience and consistency produce transformative long-term results.'),
        p('Natural hair care is not about perfection — it is about healthier, more resilient hair through gentler, more sustainable practices. Start with eliminating the most harmful ingredients first, then gradually clean up the rest.'),
      ],
    });

    await createArticle({
      title: 'Mental Health First Aid: Recognizing and Responding to Crisis',
      slug: 'mental-health-first-aid-recognizing-and-responding-to-crisis',
      excerpt: 'Mental health crises affect one in four people. Knowing how to recognize warning signs and respond appropriately can literally save lives. This guide covers the essentials of mental health first aid.',
      isFeatured: false,
      isTrending: true,
      site: healthSite.documentId,
      category: healthCategories['mental-health'].documentId,
      author: authorAmara.documentId,
      tags: [healthTags['expert-advice'].documentId, healthTags['trending-now'].documentId],
      content: [
        p('One in four people will experience a mental health condition at some point in their lives. Yet most of us are trained in physical first aid but have no idea how to respond when someone is experiencing a mental health crisis. Mental Health First Aid (MHFA) is a training program that equips ordinary people with the skills to recognize, respond, and provide initial support.'),
        h2('Recognizing Warning Signs'),
        p('Anxiety and panic attacks: rapid breathing, heart pounding, sweating, trembling, sense of doom. Depression warning signs: persistent sadness, withdrawal from activities, changes in sleep/appetite, feelings of worthlessness. Psychosis: confused thinking, false beliefs, hearing voices, paranoia. Suicidal crisis: talking about death, giving away possessions, sudden calmness after depression.'),
        h2('The ALGEE Action Plan'),
        p('A — Approach, assess safety. L — Listen non-judgmentally. G — Give reassurance and information. E — Encourage professional help. E — Encourage self-help strategies. This simple framework guides non-professionals through appropriate first response.'),
        h2('What to Say (and What Not to Say)'),
        p('DO: "I\'m here for you." "You don\'t have to face this alone." "It\'s okay to ask for help." DON\'T: "You just need to think positive." "Others have it worse." "You\'re being dramatic." The goal is not to fix the problem — it is to make the person feel heard and to connect them to appropriate professional support.'),
        p('Mental health first aid is a skill everyone can learn. Training courses are available through Mental Health First Aid International. Being equipped to help is one of the greatest gifts you can give your community.'),
      ],
    });

    // ── Health Articles 13-24 (REGULAR) ──
    const healthRegularArticles = [
      {
        title: 'Collagen Supplements: Do They Really Work?',
        slug: 'collagen-supplements-do-they-really-work',
        excerpt: 'Collagen supplements are among the most popular beauty and health products. But does the science support the marketing claims? We examine the evidence.',
        category: 'product-reviews',
        tags: ['product-spotlight', 'expert-advice'],
        featured: false,
        trending: false,
      },
      {
        title: 'The Gut-Skin Connection: How Your Microbiome Affects Your Complexion',
        slug: 'the-gut-skin-connection-how-your-microbiome-affects-your-complexion',
        excerpt: 'Emerging research reveals a powerful gut-skin axis. What you eat affects not just your digestive health but the clarity, texture, and resilience of your skin.',
        category: 'skincare',
        tags: ['expert-advice', 'trending-now'],
        featured: false,
        trending: false,
      },
      {
        title: 'Intermittent Fasting: Complete Beginner\'s Guide to Time-Restricted Eating',
        slug: 'intermittent-fasting-complete-beginners-guide-to-time-restricted-eating',
        excerpt: 'Intermittent fasting has moved from fringe biohacking to mainstream nutrition science. Learn the protocols, mechanisms, and evidence behind 16:8, 5:2, and other fasting approaches.',
        category: 'nutrition',
        tags: ['how-to-guide', 'expert-advice'],
        featured: false,
        trending: false,
      },
      {
        title: 'Sunscreen Guide 2026: Choosing the Right SPF for Your Skin',
        slug: 'sunscreen-guide-2026-choosing-the-right-spf-for-your-skin',
        excerpt: 'Not all sunscreens are created equal. Understanding SPF ratings, broad-spectrum protection, mineral vs chemical filters, and reef safety helps you choose the best sunscreen for your needs.',
        category: 'skincare',
        tags: ['how-to-guide', 'product-spotlight'],
        featured: false,
        trending: false,
      },
      {
        title: 'Yoga for Beginners: Building a Sustainable Home Practice',
        slug: 'yoga-for-beginners-building-a-sustainable-home-practice',
        excerpt: 'Yoga combines flexibility, strength, balance, and mindfulness into one practice. This beginner\'s guide provides a structured path to building a consistent, rewarding home yoga practice.',
        category: 'fitness',
        tags: ['how-to-guide', 'trending-now'],
        featured: false,
        trending: false,
      },
      {
        title: 'Herbal Adaptogens: Ashwagandha, Rhodiola, and Stress Relief',
        slug: 'herbal-adaptogens-ashwagandha-rhodiola-and-stress-relief',
        excerpt: 'Adaptogenic herbs have been used for centuries in Ayurvedic and traditional Chinese medicine to help the body adapt to stress. Modern research is validating these ancient remedies.',
        category: 'natural-remedies',
        tags: ['expert-advice', 'product-spotlight'],
        featured: false,
        trending: false,
      },
      {
        title: 'Hyaluronic Acid vs Glycerin: Which Humectant is Right for You?',
        slug: 'hyaluronic-acid-vs-glycerin-which-humectant-is-right-for-you',
        excerpt: 'Humectants are the workhorses of skincare hydration. Hyaluronic acid and glycerin are the two most popular options — understanding their differences helps you choose and layer them correctly.',
        category: 'skincare',
        tags: ['product-spotlight', 'how-to-guide'],
        featured: false,
        trending: false,
      },
      {
        title: 'Managing Hormonal Acne: Diet, Lifestyle, and Treatment Options',
        slug: 'managing-hormonal-acne-diet-lifestyle-and-treatment-options',
        excerpt: 'Hormonal acne follows predictable patterns — typically appearing along the jawline and chin in women around the menstrual cycle. Understanding its causes unlocks effective management strategies.',
        category: 'health-conditions',
        tags: ['expert-advice', 'how-to-guide'],
        featured: false,
        trending: false,
      },
      {
        title: 'The Power of Resistance Training for Women Over 40',
        slug: 'the-power-of-resistance-training-for-women-over-40',
        excerpt: 'Resistance training becomes increasingly critical for women over 40 to combat age-related muscle loss, preserve bone density, and maintain metabolic health. Here\'s the evidence and how to start.',
        category: 'fitness',
        tags: ['expert-advice', 'how-to-guide'],
        featured: false,
        trending: false,
      },
      {
        title: 'Vitamin D and Immunity: Why Most People Are Deficient',
        slug: 'vitamin-d-and-immunity-why-most-people-are-deficient',
        excerpt: 'Vitamin D deficiency affects over 1 billion people globally. This fat-soluble vitamin is critical for immune function, bone health, mood regulation, and skin health. Are you getting enough?',
        category: 'nutrition',
        tags: ['expert-advice', 'trending-now'],
        featured: false,
        trending: false,
      },
      {
        title: 'Digital Detox: How to Reclaim Your Mental Peace in the Social Media Age',
        slug: 'digital-detox-how-to-reclaim-your-mental-peace-in-the-social-media-age',
        excerpt: 'Excessive social media use is linked to anxiety, depression, and sleep disruption. A structured digital detox can reset your relationship with technology and dramatically improve wellbeing.',
        category: 'mental-health',
        tags: ['how-to-guide', 'trending-now'],
        featured: false,
        trending: false,
      },
      {
        title: 'Clean Beauty Ingredient Guide: Understanding Labels and Avoiding Toxins',
        slug: 'clean-beauty-ingredient-guide-understanding-labels-and-avoiding-toxins',
        excerpt: 'The clean beauty industry is exploding, but marketing claims often outpace science. This practical guide helps you decode ingredient labels and make genuinely informed product choices.',
        category: 'beauty-trends',
        tags: ['product-spotlight', 'how-to-guide'],
        featured: false,
        trending: false,
      },
    ];

    for (const art of healthRegularArticles) {
      await createArticle({
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        isFeatured: art.featured,
        isTrending: art.trending,
        site: healthSite.documentId,
        category: healthCategories[art.category].documentId,
        author: authorAmara.documentId,
        tags: art.tags.map((t: string) => healthTags[t].documentId),
        content: [
          p(art.excerpt),
          h2('Overview'),
          p(`${art.title} is a topic of growing interest in the health and wellness community. Scientific research continues to provide deeper insights into the mechanisms, benefits, and practical applications that can improve your daily wellbeing.`),
          h2('Evidence-Based Insights'),
          p('Understanding the science behind health and beauty recommendations helps you make better decisions. Not all popular advice is backed by rigorous research — knowing how to evaluate evidence is a superpower for your health.'),
          h2('Practical Implementation'),
          p('Sustainable health improvements come from consistent small changes rather than dramatic short-term interventions. Build habits gradually, monitor your body\'s response, and adjust based on your individual needs and feedback.'),
          h2('Expert Recommendations'),
          p('Always consult with qualified healthcare professionals for personalized medical advice. Use this information as a starting point for conversations with your doctor, dermatologist, or registered dietitian.'),
        ],
      });
    }

    strapi.log.info('[Seed] Health & Beauty articles created.');

    // ─────────────────────────────────────────────
    // STEP 3H: LOCALIZED ARTICLE (R2.5)
    // Update EN article to add Indonesian version
    // ─────────────────────────────────────────────
    strapi.log.info('[Seed] Creating localized article (id)...');

    // Find the first Health article (morning skincare routine)
    const allHealthArticles = await strapi.documents('api::article.article').findMany({
      filters: { slug: { $eq: 'the-ultimate-morning-skincare-routine-for-every-skin-type' } },
      status: 'published',
    });

    if (allHealthArticles.length > 0) {
      const enArticle = allHealthArticles[0];

      // R2.5: Use update() with locale:'id' to create linked translation
      await strapi.documents('api::article.article').update({
        documentId: enArticle.documentId,
        locale: 'id',
        data: {
          title: 'Rutinitas Perawatan Kulit Pagi Terlengkap untuk Semua Jenis Kulit',
          slug: 'rutinitas-perawatan-kulit-pagi-terlengkap-untuk-semua-jenis-kulit',
          excerpt: 'Rutinitas perawatan kulit pagi hari menentukan kesehatan kulit Anda sepanjang hari. Panduan lengkap ini mencakup produk dan teknik yang tepat untuk semua jenis kulit — dari berminyak hingga kering.',
          content: [
            p('Rutinitas perawatan kulit pagi bukan sekadar mengoleskan produk — ini tentang mempersiapkan kulit Anda menghadapi hari dengan perlindungan, hidrasi, dan fondasi yang sehat. Memahami urutan yang benar, menggunakan produk yang sesuai dengan jenis kulit, dan menerapkannya dengan benar dapat mengubah kondisi kulit Anda dalam beberapa minggu.'),
            h2('Kerangka Rutinitas Pagi yang Universal'),
            p('Terlepas dari jenis kulit, setiap rutinitas pagi harus mengikuti urutan ini: pembersih → toner (opsional) → serum → pelembap → SPF. Setiap langkah memiliki tujuan tersendiri, dan urutannya penting karena bahan dioleskan dari tekstur paling tipis ke paling tebal.'),
            h2('Langkah 1: Pembersihan'),
            p('Gunakan pembersih yang lembut sesuai jenis kulit Anda. Untuk kulit berminyak, pilih pembersih gel atau busa yang efektif mengangkat sebum tanpa merusak skin barrier. Untuk kulit kering, pilih pembersih krim atau susu yang mempertahankan kelembapan alami kulit.'),
            h2('Langkah 2: Serum Vitamin C — Kunci Rutinitas Pagi'),
            p('Vitamin C adalah bahan serum pagi yang paling berdampak. Ia menetralisir radikal bebas (kerusakan dari polusi dan UV), mencerahkan hiperpigmentasi, merangsang sintesis kolagen, dan meningkatkan efektivitas sunscreen.'),
            h2('Langkah 3: Pelembap'),
            p('Pelembap mengunci hidrasi dari langkah sebelumnya dan memperkuat skin barrier. Kombinasi hyaluronic acid (humektan yang menarik kelembapan) dengan ceramides (lipid yang merestorasi barrier) menciptakan kelembapan optimal.'),
            h2('Langkah 4: SPF — Tidak Bisa Ditawar'),
            p('Sunscreen adalah produk anti-aging terpenting yang pernah ada. Radiasi UV bertanggung jawab atas 80-90% tanda-tanda penuaan kulit yang terlihat. Gunakan minimal SPF 30 setiap pagi, tanpa terkecuali.'),
          ],
        },
      });

      // R2.5: Publish the Indonesian version
      await strapi.documents('api::article.article').publish({
        documentId: enArticle.documentId,
        locale: 'id',
      });

      strapi.log.info('[Seed] Indonesian article localization created and published.');
    }

    // ─────────────────────────────────────────────
    // STEP 3I: AD UNITS (GLOBAL)
    // R2.4: draftAndPublish:false → NEVER pass status
    // ─────────────────────────────────────────────
    strapi.log.info('[Seed] Creating AdUnits...');

    const adUnit1 = await strapi.documents('api::ad-unit.ad-unit').create({
      data: {
        name: 'Banner Rotation Primary',
        type: 'banner',
        isActive: true,
        codes: [
          adCode('AdSense', '1', 'banner'),
          adCode('Ezoic', '2', 'banner'),
          adCode('Generic', '3', 'banner'),
        ],
      },
    });

    const adUnit2 = await strapi.documents('api::ad-unit.ad-unit').create({
      data: {
        name: 'Banner Rotation Secondary',
        type: 'banner',
        isActive: true,
        codes: [
          adCode('AdSense Secondary', '1', 'banner'),
          adCode('Generic Secondary', '2', 'banner'),
        ],
      },
    });

    const adUnit3 = await strapi.documents('api::ad-unit.ad-unit').create({
      data: {
        name: 'Native Object Primary',
        type: 'native_object',
        isActive: true,
        codes: [
          `<div class="native-ad-placeholder" style="background:#f5f5f5;border:1px solid #e0e0e0;border-radius:8px;padding:16px;font-family:sans-serif;"><div style="color:#999;font-size:12px;margin-bottom:8px;">Sponsored</div><div style="font-weight:bold;color:#333;margin-bottom:6px;">Discover Top Financial Products</div><div style="color:#666;font-size:13px;">Compare rates, find the best deals for your needs.</div></div><script>console.log("Taboola native ad loaded: primary slot");</script>`,
          `<div class="native-ad-placeholder" style="background:#f9f9f9;border:1px solid #e8e8e8;border-radius:8px;padding:16px;font-family:sans-serif;"><div style="color:#aaa;font-size:11px;text-transform:uppercase;margin-bottom:8px;">Advertisement</div><div style="font-weight:600;color:#222;margin-bottom:6px;">Outbrain Content Recommendation</div><div style="color:#555;font-size:13px;">Stories you might enjoy from around the web.</div></div><script>console.log("Outbrain native ad loaded: primary slot");</script>`,
        ],
      },
    });

    const adUnit4 = await strapi.documents('api::ad-unit.ad-unit').create({
      data: {
        name: 'Native Object Secondary',
        type: 'native_object',
        isActive: true,
        codes: [
          `<div class="native-ad-placeholder" style="background:#fafafa;border:1px dashed #d0d0d0;border-radius:6px;padding:14px;font-family:sans-serif;"><div style="color:#bbb;font-size:11px;margin-bottom:6px;">Sponsored Content</div><div style="font-weight:bold;color:#444;margin-bottom:4px;">Related Content You Might Like</div><div style="color:#666;font-size:12px;">Powered by content discovery network.</div></div><script>console.log("Native secondary ad loaded: slot A");</script>`,
          `<div class="native-ad-placeholder" style="background:#ffffff;border:1px solid #ebebeb;border-radius:6px;padding:14px;font-family:sans-serif;box-shadow:0 1px 3px rgba(0,0,0,0.05);"><div style="color:#aaa;font-size:11px;margin-bottom:6px;">Recommended</div><div style="font-weight:600;color:#333;margin-bottom:4px;">Trending Now Across the Web</div><div style="color:#777;font-size:12px;">Curated recommendations for you.</div></div><script>console.log("Native secondary ad loaded: slot B");</script>`,
        ],
      },
    });

    strapi.log.info('[Seed] AdUnits created.');

    // ─────────────────────────────────────────────
    // STEP 3J: AD SLOTS (GLOBAL)
    // R2.4: draftAndPublish:false → NEVER pass status
    // ─────────────────────────────────────────────
    strapi.log.info('[Seed] Creating AdSlots...');

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'home_hero_billboard',
        placement: 'header',
        sizePreset: 'BILLBOARD',
        enabled: true,
        deviceTarget: 'all',
        responsiveSizes: { mobile: 'MOBILE_BANNER_100', tablet: 'LEADERBOARD', desktop: 'BILLBOARD' },
        lazyDelayMs: 2000,
        adUnit: adUnit1.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'home_trending_leaderboard',
        placement: 'between_list',
        sizePreset: 'LEADERBOARD',
        enabled: true,
        deviceTarget: 'desktop',
        responsiveSizes: null,
        lazyDelayMs: 2000,
        adUnit: adUnit2.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'article_top_leaderboard',
        placement: 'header',
        sizePreset: 'LEADERBOARD',
        enabled: true,
        deviceTarget: 'all',
        responsiveSizes: { mobile: 'MOBILE_BANNER_100', tablet: 'LEADERBOARD' },
        lazyDelayMs: 2000,
        adUnit: adUnit1.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'article_sidebar_mrec',
        placement: 'sidebar',
        sizePreset: 'MREC',
        enabled: true,
        deviceTarget: 'desktop',
        responsiveSizes: { tablet: 'MREC', desktop: 'HALF_PAGE' },
        lazyDelayMs: 2000,
        adUnit: adUnit2.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'article_inline_1',
        placement: 'in_article',
        sizePreset: 'LARGE_MREC',
        enabled: true,
        deviceTarget: 'all',
        responsiveSizes: { mobile: 'MREC', tablet: 'MREC' },
        lazyDelayMs: 2000,
        adUnit: adUnit1.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'article_inline_2',
        placement: 'in_article',
        sizePreset: 'MREC',
        enabled: true,
        deviceTarget: 'all',
        responsiveSizes: { mobile: 'MREC' },
        lazyDelayMs: 2000,
        adUnit: adUnit2.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'article_bottom_leaderboard',
        placement: 'footer',
        sizePreset: 'LEADERBOARD',
        enabled: true,
        deviceTarget: 'all',
        responsiveSizes: { mobile: 'MOBILE_BANNER_100' },
        lazyDelayMs: 2000,
        adUnit: adUnit1.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'sidebar_skyscraper',
        placement: 'sidebar',
        sizePreset: 'WIDE_SKYSCRAPER',
        enabled: true,
        deviceTarget: 'desktop',
        responsiveSizes: null,
        lazyDelayMs: 2000,
        adUnit: adUnit2.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'listing_between_mrec',
        placement: 'listing_between',
        sizePreset: 'MREC',
        enabled: true,
        deviceTarget: 'all',
        responsiveSizes: { mobile: 'MOBILE_BANNER_100' },
        lazyDelayMs: 2000,
        adUnit: adUnit1.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'search_top_leaderboard',
        placement: 'search_top',
        sizePreset: 'LEADERBOARD',
        enabled: true,
        deviceTarget: 'all',
        responsiveSizes: { mobile: 'MOBILE_BANNER_100' },
        lazyDelayMs: 2000,
        adUnit: adUnit2.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'search_bottom_mrec',
        placement: 'search_bottom',
        sizePreset: 'MREC',
        enabled: true,
        deviceTarget: 'all',
        responsiveSizes: null,
        lazyDelayMs: 2000,
        adUnit: adUnit1.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'sticky_bottom_mobile',
        placement: 'sticky_bottom',
        sizePreset: 'MOBILE_BANNER_50',
        enabled: false, // disabled by default
        deviceTarget: 'mobile',
        responsiveSizes: null,
        lazyDelayMs: 2000,
        adUnit: adUnit1.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'native_home_feed',
        placement: 'between_list',
        sizePreset: 'MREC',
        enabled: true,
        deviceTarget: 'all',
        responsiveSizes: null,
        lazyDelayMs: 2000,
        adUnit: adUnit3.documentId,
      },
    });

    await strapi.documents('api::ad-slot.ad-slot').create({
      data: {
        slotKey: 'native_article_bottom',
        placement: 'footer',
        sizePreset: 'LARGE_MREC',
        enabled: true,
        deviceTarget: 'all',
        responsiveSizes: null,
        lazyDelayMs: 2000,
        adUnit: adUnit4.documentId,
      },
    });

    strapi.log.info('[Seed] AdSlots created.');
    strapi.log.info('[Seed] ✅ Seed complete! 3 sites, 30 categories, 15 tags, 3 authors, 72 articles, 4 ad units, 14 ad slots.');
  },
};
