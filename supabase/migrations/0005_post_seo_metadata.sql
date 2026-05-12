-- Add per-post SEO metadata (meta description, og:title, og:image)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_metadata jsonb;
