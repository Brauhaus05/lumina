-- RLS for user_tenant_map: each user can only read their own row.
--
-- The hook function in 0003_auth_hook.sql reads this table as
-- supabase_auth_admin (superuser), so that path is unaffected by RLS.
-- Authenticated app-layer queries are scoped to the calling user.

ALTER TABLE public.user_tenant_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_mapping" ON public.user_tenant_map
  FOR SELECT USING (user_id = auth.uid());
