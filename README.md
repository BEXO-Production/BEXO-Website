# BEXO Website (mybexo.com)

Static marketing site for **BEXO From Ace Digital** — Discover → Create → Share.

| Environment | URL |
|-------------|-----|
| Production marketing | https://mybexo.com |
| Production app | https://dash.mybexo.com |
| Live portfolios | https://{handle}.atbexo.com |

Login / Sign up CTAs open `dash.mybexo.com/login`.

## Local preview

```bash
python3 -m http.server 4173
# open http://127.0.0.1:4173
# Guides: http://127.0.0.1:4173/pages/blog.html
```

Config: [`js/config.js`](js/config.js) · shared chrome: [`js/chrome.js`](js/chrome.js)

## Guides / blog CMS path

Today the site is static. Content is **database-shaped** so an admin dashboard can take over later.

| Layer | Location |
|-------|----------|
| SQL schema | [`docs/blog-cms-schema.sql`](docs/blog-cms-schema.sql) |
| CMS plan | [`docs/blog-cms.md`](docs/blog-cms.md) |
| Seed JSON (100 posts) | [`content/blogs/posts/*.json`](content/blogs/posts/) |
| Listing index | [`content/blogs/manifest.json`](content/blogs/manifest.json) |
| Static HTML pages | [`pages/guides/*.html`](pages/guides/) |
| Listing UI | [`pages/blog.html`](pages/blog.html) + [`js/blog-list.js`](js/blog-list.js) |

Regenerate posts after editing the generator:

```bash
npm run generate:blogs
```

When the admin dashboard ships: import JSON into `marketing_blogs`, then either serve via API or rebuild static HTML from the DB.

Production cutover notes live in the Onboarding-Flow repo:
`Bexo-Onboarding-Flow/docs/prod-dash-mybexo-com.md`
