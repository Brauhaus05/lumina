-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigger function to keep updated_at current (replaces moddatetime extension)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TENANTS
-- ============================================================
CREATE TABLE tenants (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name      text NOT NULL,
  subdomain text NOT NULL UNIQUE,
  api_key   text NOT NULL DEFAULT encode(extensions.gen_random_bytes(32), 'hex')
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Tenants can only see their own row
CREATE POLICY "tenant_isolation" ON tenants
  FOR ALL
  USING (id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE posts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title      text NOT NULL,
  slug       text NOT NULL,
  content    jsonb NOT NULL DEFAULT '{}',
  status     text NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, slug)
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON posts
  FOR ALL
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Auto-update updated_at on every UPDATE
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- MEDIA
-- ============================================================
CREATE TABLE media (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  url       text NOT NULL,
  alt_text  text,
  metadata  jsonb
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON media
  FOR ALL
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- ============================================================
-- SETTINGS (1:1 with tenant)
-- ============================================================
CREATE TABLE settings (
  tenant_id    uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  theme_config jsonb NOT NULL DEFAULT '{}',
  seo_metadata jsonb NOT NULL DEFAULT '{}'
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON settings
  FOR ALL
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
