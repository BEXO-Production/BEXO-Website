# Portfolio Discovery System — SEO Design

**Date:** 2026-07-23  
**Status:** Approved  
**Domains:** `mybexo.cyou` (marketing), `dash.mybexo.cyou` (app), `{handle}.mybexo.cyou` (portfolios)

## Goal

Treat SEO as a product feature students feel: marketing sells the outcome (“live link recruiters open”), published portfolios make the person discoverable, and dash never competes in search.

## Audience layering

1. **Primary SERP voice** — college students / placement season  
2. **Secondary breadth** — professionals & career switchers (pricing, about, guides)  
3. **Dash** — trust + login only (`noindex` on app shells)

## Approach C — Dual-surface system

### Marketing (`mybexo.cyou`)

- Unique title + meta description per page (click-worthy, outcome-led)
- Canonical, Open Graph, Twitter, JSON-LD on every public page
- `robots.txt` + `sitemap.xml` on **`.cyou`**, including all guides
- Showcase/stories copy markets real portfolio outcomes
- Guides: fix duplicate titles; absolute canonical/OG URLs

### Portfolios (`{handle}.mybexo.cyou`)

- Person-first title: `{Name} — {headline/goal} | Portfolio`
- Description from bio/headline + light BEXO proof line
- ProfilePage + Person JSON-LD; OG image prefers photo
- Sitemap of published/indexable handles (API)

### Dash (`dash.mybexo.cyou`)

- Default shell: `noindex, nofollow`
- Titles like “Sign in to BEXO” — never marketing SERP titles
- Remove wrong `atbexo.com` canonicals/OG from dash `index.html`

## Out of scope

- Custom OG image render job  
- Google Search Console account actions  
- Rewriting all guide body copy  
- `mybexo.com` Next.js app

## Success signals

- Google snippet for `mybexo.cyou` matches new title/description  
- Shared portfolio links show person-first OG cards  
- Dash does not appear as competing “portfolio platform” result  
- Guides and core pages listed in marketing sitemap
