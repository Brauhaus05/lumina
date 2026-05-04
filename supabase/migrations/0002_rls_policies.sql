-- Allow INSERT for authenticated users creating their own tenant record
-- The app layer is responsible for scoping this to admin flows only.
-- Service role bypasses RLS entirely — no additional policy needed for server-side ops.

CREATE POLICY "admin_insert_tenants" ON tenants
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admin_insert_settings" ON settings
  FOR INSERT
  WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Public read for published posts (Reader app uses anon key + tenant resolution)
-- The reader resolves tenant_id from subdomain and passes it as a query filter,
-- but for the public Reader route we need to allow anon reads on published posts.
CREATE POLICY "public_read_published_posts" ON posts
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Public read for settings (needed for theme resolution in Reader)
CREATE POLICY "public_read_settings" ON settings
  FOR SELECT
  TO anon
  USING (true);

-- Public read for tenant subdomain resolution in Reader middleware
CREATE POLICY "public_read_tenant_subdomain" ON tenants
  FOR SELECT
  TO anon
  USING (true);
