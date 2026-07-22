-- BEXO marketing blogs — future admin CMS schema
-- Source of truth today: /content/blogs/*.json (importable 1:1 into this table)
-- When admin dashboard ships: CRUD against this table; marketing site fetches API or rebuilds static.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS marketing_blogs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  excerpt         TEXT NOT NULL,
  body_html       TEXT NOT NULL,
  body_md         TEXT,
  cover_image_url TEXT NOT NULL,
  cover_credit    TEXT,
  category        TEXT NOT NULL,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'published'
                  CHECK (status IN ('draft', 'published', 'archived')),
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  author_name     TEXT NOT NULL DEFAULT 'BEXO Editorial',
  author_role     TEXT NOT NULL DEFAULT 'Ace Digital',
  seo_title       TEXT,
  seo_description TEXT,
  reading_minutes INT NOT NULL DEFAULT 4,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS marketing_blogs_status_published_idx
  ON marketing_blogs (status, published_at DESC);

CREATE INDEX IF NOT EXISTS marketing_blogs_category_idx
  ON marketing_blogs (category);

COMMENT ON TABLE marketing_blogs IS
  'Public Guides/Stories for mybexo.com. Seeded from content/blogs JSON; admin dashboard will edit here.';
