# BEXO marketing blogs — CMS plan

## Goal

Guides on `mybexo.com` should be editable from a future admin dashboard (view / edit / add / archive) without rewriting the marketing site from scratch.

## Source of truth (today)

1. **Authoring seed:** `scripts/generate-blogs.mjs` → `content/blogs/posts/*.json` + `pages/guides/*.html` + `content/blogs/manifest.json`
2. **Public listing:** `pages/blog.html` fetches `content/blogs/manifest.json` (filterable by category)
3. **Public post pages:** static HTML under `pages/guides/` (SEO-friendly, no build step)

Each JSON file mirrors the `marketing_blogs` table in [`blog-cms-schema.sql`](./blog-cms-schema.sql).

## Target architecture (admin dashboard)

```
Admin dashboard (dash.mybexo.com/admin or separate)
        │ CRUD
        ▼
Postgres: marketing_blogs
        │
        ├── Marketing site API: GET /api/marketing/blogs
        │     └── blog.html + post renderer consume JSON
        └── OR static rebuild job: export → content/blogs + pages/guides
```

### Recommended phases

1. **Phase A (now):** Static seed — 100 posts, Unsplash covers, manifest-driven listing.
2. **Phase B:** Apply `blog-cms-schema.sql` on Supabase; import seed JSON (map `id` → new UUID or keep slug as key).
3. **Phase C:** Admin CRUD (draft / published / archived, featured flag, cover URL).
4. **Phase D:** Swap listing from `manifest.json` to API; keep static export as optional CDN cache.

## Import notes

- Unique key for upserts: `slug`
- `body_html` is what the public site renders; store `body_md` when the editor supports markdown
- `cover_image_url` may point at Unsplash during seed; later upload to storage and replace URLs
- `status` defaults to `published` for seed rows

## Editorial standards

- User-facing (students / professionals), not internal OTP / infra jargon
- One job per guide: how a live site helps them stand out
- CTA toward `dash.mybexo.com/login`
- Categories: placements, branding, recruiters, getting-started, students, tips, freelance, writing, career, design, motivation
