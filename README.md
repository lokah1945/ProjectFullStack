# Multi-Site Blog/News Platform

A production-ready multi-domain blog and news platform built on **Strapi v5** (CMS) and **Next.js 15** (frontend), managed from a single centralized backend. Three distinct sites — each with its own branding, niche, and domain — are served dynamically based on the incoming HTTP `Host` header.

---

## Sites

| Site | Domain | Niche | Primary Color |
|---|---|---|---|
| **GlimpseIt** | `glimpseit.online`, `www.glimpseit.online` | Finance, Stock Market, Economics | `#0F4C81` navy |
| **Cryptonice** | `cryptonice.online`, `www.cryptonice.online` | Crypto, Blockchain, Web3, DeFi | `#6C3CE1` purple |
| **Health & Beauty** | `healthandbeauty.my.id`, `www.healthandbeauty.my.id` | Health, Skincare, Wellness | `#D4436C` rosé |

---

## Quick Start

```bash
# 1. Install all dependencies and build everything
bash install_all.sh

# 2. Development mode (hot-reload on both services)
bash dev_all.sh

# 3. Production mode (pm2 process manager)
bash run_all.sh
```

---

## Requirements

- **OS**: Debian 13 (or compatible Debian/Ubuntu)
- **User**: root (scripts run without `sudo`)
- **Database**: PostgreSQL (must be running before install)
- **Ports**: 3200 (Strapi), 3201 (Next.js)

---

## Database Setup (PostgreSQL)

Before running `install_all.sh`, ensure PostgreSQL is installed and a database + user exist:

```sql
CREATE USER strapi_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE strapi_db OWNER strapi_user;
GRANT ALL PRIVILEGES ON DATABASE strapi_db TO strapi_user;
```

Then create `cms-strapi/.env` with your credentials:

```env
# cms-strapi/.env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi_db
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=your_secure_password

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
APP_KEYS=key1base64,key2base64,key3base64,key4base64
API_TOKEN_SALT=randombase64string
ADMIN_JWT_SECRET=randombase64string
JWT_SECRET=randombase64string

HOST=0.0.0.0
PORT=3200
```

> **Important**: `install_all.sh` will **never overwrite** an existing `.env`. It only validates that required variables are present.

---

## First Run — Admin & API Token Setup

After running `install_all.sh`, complete these steps once:

### 1. Create Strapi Admin Account

```bash
bash dev_all.sh
```

Open [http://localhost:3200/admin](http://localhost:3200/admin) and register your admin email + password.

### 2. Create an API Token

1. In Strapi Admin, go to **Settings → API Tokens**
2. Click **+ Create new API Token**
3. Set:
   - **Name**: `Next.js Frontend`
   - **Description**: Read-only token for frontend data fetching
   - **Token type**: `Read-only`
   - **Token duration**: `Unlimited`
4. Click **Save** and **copy the generated token immediately** (it won't be shown again)

### 3. Paste Token into `.env.local`

Edit `web-nextjs/.env.local`:

```env
STRAPI_URL=http://localhost:3200
STRAPI_API_TOKEN=paste_your_token_here
PORT=3201
```

Restart dev servers after updating:

```bash
# Ctrl+C to stop, then:
bash dev_all.sh
```

---

## Navigation Structure

Each site provides the following navigation sections:

| Section | URL | Description |
|---|---|---|
| **Home** | `/` | Featured hero + trending strip + latest articles |
| **Latest** | `/latest` | All articles sorted by publish date, paginated |
| **Featured** | `/featured` | Articles marked `isFeatured=true` |
| **Trending** | `/trending` | Articles marked `isTrending=true` |
| **Categories** | `/category/[slug]` | Per-category listing with pagination |
| **Search** | `/search?q=...` | Full-text article search |
| **Article** | `/article/[slug]` | Full article with sidebar, related articles, in-article ads |

Category links in the nav are controlled by `isInNav` and `navOrder` fields on each Category in Strapi.

---

## Domain Mapping

Each site is identified by its domains stored in the `Site` content type in Strapi (the `domains` field — an array of strings).

**How it works:**
1. A request arrives at Next.js
2. `middleware.ts` reads the `Host` header (or `x-forwarded-host` behind a proxy)
3. It fetches `GET /api/sites/by-domain?domain=<host>` from Strapi
4. The site config (slug, id, locale, primaryColor, etc.) is cached in-memory with a TTL
5. `x-site-slug`, `x-site-id`, and `x-locale` headers are injected for all downstream components

**To add a new domain to an existing site:**
1. Strapi Admin → Content Manager → Sites → select the site
2. Add the new domain to the `domains` array field
3. Save + publish
4. The change propagates after the middleware cache TTL expires (default 60s)

**To add a new site:**
1. Create a new Site entry in Strapi with slug, name, domains, primaryColor, seoDefaults
2. Add matching categories and tags
3. Deploy and point the new domain's DNS to your server

---

## SEO — Sitemap, RSS, Robots

Each domain gets its own SEO files, generated dynamically per site:

| URL | Description |
|---|---|
| `/sitemap.xml` | XML sitemap with all article URLs for the current domain |
| `/rss.xml` | RSS 2.0 feed with latest articles for the current domain |
| `/robots.txt` | Robots directives with sitemap reference for the current domain |

These are served by Next.js route handlers (`app/sitemap.xml/route.ts`, etc.) and are site-aware via the `Host` header. They revalidate automatically (sitemap/RSS: every hour, robots: every 24 hours).

---

## Ads Management (GLOBAL)

The ad system is **global** — one configuration in Strapi drives ads across all three sites. It consists of two content types:

### AdUnit — The Ad Code Container

An `AdUnit` holds one or more JavaScript ad snippets. On each page render, a **random snippet** is selected from the array (client-side, in `useEffect`).

| Field | Type | Description |
|---|---|---|
| `name` | String | Human-readable name (e.g. "Google AdSense Banner") |
| `codes` | JSON Array | Array of JS snippet strings. Random rotation per render. |
| `isActive` | Boolean | Master switch — disabled units are never shown |

**Example `codes` value:**
```json
[
  "<script>googletag.cmd.push(function() { googletag.display('div-gpt-ad-123'); });</script>",
  "<script>googletag.cmd.push(function() { googletag.display('div-gpt-ad-456'); });</script>"
]
```

> **DOM injection (not `dangerouslySetInnerHTML`)**: Ad scripts are injected by creating `<script>` DOM elements in `useEffect` to ensure proper execution.

### AdSlot — The Placement Controller

An `AdSlot` defines **where** an ad appears and **how** it behaves. All slots are global (no per-site restriction by default).

| Field | Type | Description |
|---|---|---|
| `slotKey` | String (unique) | Identifier used in components (e.g. `home_hero_billboard`) |
| `placement` | Enum | `header`, `sidebar`, `in_article`, `between_list`, `footer`, `search_top`, `search_bottom`, `sticky_bottom`, `listing_between` |
| `adUnit` | Relation | Which `AdUnit` to display |
| `sizePreset` | Enum | Default size: `BILLBOARD`, `LEADERBOARD`, `MREC`, `LARGE_MREC`, `HALF_PAGE`, `WIDE_SKYSCRAPER`, `MOBILE_BANNER_50`, `MOBILE_BANNER_100` |
| `isEnabled` | Boolean | Toggle to enable/disable this slot without deleting it |
| `deviceTarget` | Enum | `all`, `mobile`, `tablet`, `desktop` — slot only renders on matching device |
| `responsiveSizes` | JSON | Per-breakpoint size override: `{ "mobile": "MOBILE_BANNER_100", "tablet": "LEADERBOARD", "desktop": "BILLBOARD" }` |
| `scheduleStart` | DateTime | Optional: slot only active after this timestamp |
| `scheduleEnd` | DateTime | Optional: slot only active before this timestamp |
| `lazyLoadOffset` | Integer | Pixels before viewport to trigger lazy-load (default: 200) |

### Preset Ad Sizes (CLS Prevention)

Each preset reserves exact pixel dimensions via `min-height` CSS to prevent layout shift:

| Preset | Dimensions | Use Case |
|---|---|---|
| `MOBILE_BANNER_50` | 320×50 | Mobile sticky footer |
| `MOBILE_BANNER_100` | 320×100 | Mobile banner |
| `MREC` | 300×250 | Medium rectangle, universal |
| `LARGE_MREC` | 336×280 | Large rectangle |
| `LEADERBOARD` | 728×90 | Desktop top banner |
| `LARGE_LEADERBOARD` | 970×90 | Wide leaderboard |
| `BILLBOARD` | 970×250 | Premium hero banner |
| `WIDE_SKYSCRAPER` | 160×600 | Sidebar tall unit |
| `HALF_PAGE` | 300×600 | Sidebar half page |

### In-Article Ad Insertion

The `AdInsertionEngine` component automatically inserts ad slots into article body content following these rules:
- Insert every **4 paragraphs**
- Minimum **2 paragraphs** distance between ads
- Skip insertion if article has **fewer than 6 paragraphs**
- Never insert immediately before or after a **heading or image**

---

## i18n (Internationalization)

- **Default language**: English (`en`) — served without URL prefix (e.g., `/article/my-slug`)
- **Additional languages**: Added via URL prefix (e.g., `/id/article/my-slug` for Indonesian)

**To add a new language:**
1. Strapi Admin → Settings → Internationalization → Add a locale (e.g., `id` for Indonesian)
2. In each Article, use the **Localize** button to create a translated version
3. The Next.js `[locale]` route group automatically handles the prefixed URLs
4. The `LanguageSwitcher` component in the header lets users switch locales

---

## Testing Local Multi-Domain

To test all three sites locally on your machine, add the following to `/etc/hosts`:

```
# Multi-site blog platform — local development
127.0.0.1   glimpseit.online
127.0.0.1   www.glimpseit.online
127.0.0.1   cryptonice.online
127.0.0.1   www.cryptonice.online
127.0.0.1   healthandbeauty.my.id
127.0.0.1   www.healthandbeauty.my.id
```

Then access:
- [http://glimpseit.online:3201](http://glimpseit.online:3201) — GlimpseIt (Finance)
- [http://cryptonice.online:3201](http://cryptonice.online:3201) — Cryptonice (Crypto)
- [http://healthandbeauty.my.id:3201](http://healthandbeauty.my.id:3201) — Health & Beauty

Each domain will display its own branding, categories, and content.

---

## Architecture Overview

```
Internet
    │
    ├── glimpseit.online ──────────────────┐
    ├── cryptonice.online ─────────────────┤
    └── healthandbeauty.my.id ─────────────┤
                                            │
                                 ┌──────────▼──────────┐
                                 │   Next.js :3201      │
                                 │   App Router         │
                                 │                      │
                                 │  middleware.ts        │
                                 │  reads Host header   │
                                 │  → fetches site cfg  │
                                 │  → injects headers   │
                                 └──────────┬──────────┘
                                            │ Bearer token
                                            │ HTTP
                                 ┌──────────▼──────────┐
                                 │   Strapi v5 :3200    │
                                 │   REST API           │
                                 │                      │
                                 │  /api/sites          │
                                 │  /api/articles       │
                                 │  /api/categories     │
                                 │  /api/ad-units       │
                                 │  /api/ad-slots       │
                                 │  /api/health         │
                                 └──────────┬──────────┘
                                            │
                                 ┌──────────▼──────────┐
                                 │   PostgreSQL         │
                                 │   (single DB)        │
                                 └─────────────────────┘
```

**Key design decisions:**
- **Single Strapi instance** manages all three sites — simpler ops, shared auth, shared ads
- **Host-based routing** in Next.js middleware — no per-site deployments needed
- **In-memory TTL cache** for site config — minimizes Strapi API calls on every request
- **pnpm workspaces** — fast installs, shared lockfile discipline
- **pm2** — production process management with auto-restart and log streaming

---

## Folder Structure

```
/                          ← Repository root
├── install_all.sh         ← Full setup (idempotent)
├── dev_all.sh             ← Start both services in dev mode
├── run_all.sh             ← Build + start with pm2 (production)
├── README.md
│
├── cms-strapi/            ← Strapi v5 backend
│   ├── .env               ← Database + secrets (NOT committed)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── api/
│       │   ├── site/                 ← Site content type
│       │   ├── article/              ← Article content type
│       │   ├── category/             ← Category content type
│       │   ├── tag/                  ← Tag content type
│       │   ├── author/               ← Author content type
│       │   ├── ad-unit/              ← AdUnit content type
│       │   └── ad-slot/              ← AdSlot content type
│       ├── config/
│       │   ├── database.ts           ← PostgreSQL connection
│       │   ├── plugins.ts            ← i18n + users-permissions
│       │   ├── middlewares.ts        ← CORS, security
│       │   └── server.ts             ← Port 3200
│       └── extensions/
│           └── users-permissions/    ← Public route config
│
└── web-nextjs/            ← Next.js 15 frontend
    ├── .env.local          ← STRAPI_URL + STRAPI_API_TOKEN (NOT committed)
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── postcss.config.mjs
    └── src/
        ├── app/
        │   ├── globals.css
        │   ├── layout.tsx            ← Root layout (site-aware)
        │   ├── page.tsx              ← Home page
        │   ├── latest/page.tsx
        │   ├── featured/page.tsx
        │   ├── trending/page.tsx
        │   ├── category/[slug]/page.tsx
        │   ├── article/[slug]/page.tsx
        │   ├── search/page.tsx
        │   ├── sitemap.xml/route.ts  ← Dynamic sitemap per domain
        │   ├── rss.xml/route.ts      ← Dynamic RSS feed per domain
        │   ├── robots.txt/route.ts   ← Dynamic robots.txt per domain
        │   ├── [locale]/             ← i18n route mirror
        │   ├── not-found.tsx
        │   └── error.tsx
        ├── components/
        │   ├── header-nav.tsx
        │   ├── footer.tsx
        │   ├── featured-hero.tsx
        │   ├── trending-strip.tsx
        │   ├── latest-list.tsx
        │   ├── listing-page.tsx
        │   ├── sidebar-widgets.tsx
        │   ├── ad-slot.tsx           ← DOM script injection, lazy-load
        │   ├── native-ad-card.tsx
        │   ├── content-renderer.tsx  ← @strapi/blocks-react-renderer
        │   ├── ad-insertion-engine.tsx
        │   ├── search-bar.tsx
        │   ├── language-switcher.tsx
        │   └── pagination.tsx
        ├── lib/
        │   ├── strapi.ts             ← Centralized fetch helper
        │   ├── site-context.ts       ← Read site from headers
        │   ├── ad-utils.ts           ← Ad preset logic
        │   ├── seo.ts                ← generateMetadata helper
        │   └── utils.ts              ← cn() utility (clsx + twMerge)
        ├── hooks/
        │   ├── use-ad-lazy-load.ts
        │   ├── use-breakpoint.ts
        │   └── use-debounce.ts
        ├── types/
        │   └── index.ts              ← All TypeScript interfaces
        └── middleware.ts             ← Host → site resolution
```

---

## Environment Variables Reference

### `cms-strapi/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_HOST` | ✓ | PostgreSQL host |
| `DATABASE_PORT` | ✓ | PostgreSQL port (usually 5432) |
| `DATABASE_NAME` | ✓ | Database name |
| `DATABASE_USERNAME` | ✓ | Database user |
| `DATABASE_PASSWORD` | ✓ | Database password |
| `APP_KEYS` | ✓ | Comma-separated base64 keys (min 4) |
| `API_TOKEN_SALT` | ✓ | Salt for API token hashing |
| `ADMIN_JWT_SECRET` | ✓ | Secret for admin JWT |
| `JWT_SECRET` | ✓ | Secret for user JWT |
| `HOST` | — | Bind address (default: 0.0.0.0) |
| `PORT` | — | Strapi port (default: 3200) |

### `web-nextjs/.env.local`

| Variable | Required | Description |
|---|---|---|
| `STRAPI_URL` | ✓ | URL to Strapi (default: http://localhost:3200) |
| `STRAPI_API_TOKEN` | ✓ | Read-only API token from Strapi admin |
| `PORT` | — | Next.js port (default: 3201) |

---

## Useful Commands

```bash
# pm2 process management
pm2 status              # Show all running processes
pm2 logs                # Stream all logs
pm2 logs strapi         # Strapi logs only
pm2 logs nextjs         # Next.js logs only
pm2 restart all         # Restart all processes
pm2 stop all            # Stop all processes
pm2 startup             # Generate startup script (survives reboots)

# Rebuild after code changes
cd cms-strapi && pnpm build   # Rebuild Strapi admin
cd web-nextjs && pnpm build   # Rebuild Next.js

# Database backup
pg_dump strapi_db > backup_$(date +%Y%m%d).sql

# View Strapi API
curl -H "Authorization: Bearer $TOKEN" http://localhost:3200/api/sites
curl http://localhost:3200/api/health
```

---

## Stack

| Component | Technology | Version |
|---|---|---|
| CMS | Strapi | v5.x |
| Frontend | Next.js | 15.x |
| Language | TypeScript | 5.x |
| Styling | TailwindCSS | 4.x |
| Package Manager | pnpm | 9.x |
| Process Manager | pm2 | latest |
| Database | PostgreSQL | 14+ |
| Node.js | LTS | 22.x |
| React | React | 19.x |
