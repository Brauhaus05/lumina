-- Custom access token hook: injects tenant_id into the JWT claims.
--
-- This is required for RLS policies that use (auth.jwt() ->> 'tenant_id').
-- Without this hook, authenticated users have no tenant_id in their JWT
-- and all RLS policies silently return 0 rows.
--
-- Setup steps (run once in Supabase Dashboard → Auth → Hooks):
--   1. Enable "Custom Access Token" hook
--   2. Point it at the supabase_functions schema function below
--
-- For self-hosted / local: register via supabase/config.toml [auth.hook.custom_access_token]

-- Maps auth.users → tenants via a join table
-- Each authenticated user belongs to exactly one tenant.
CREATE TABLE IF NOT EXISTS user_tenant_map (
  user_id   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

-- The hook function — called by Supabase Auth on every token issue
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  v_tenant_id uuid;
  v_user_id uuid;
BEGIN
  v_user_id := (event ->> 'user_id')::uuid;
  claims := event -> 'claims';

  -- Look up the tenant for this user
  SELECT tenant_id INTO v_tenant_id
  FROM public.user_tenant_map
  WHERE user_id = v_user_id;

  IF v_tenant_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(v_tenant_id::text));
  END IF;

  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant the hook function execution rights to the supabase_auth_admin role
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
