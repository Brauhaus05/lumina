import type { DbClient } from '../types';

export async function getUserTenantId(client: DbClient): Promise<string> {
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();

  if (authError || !user) throw new Error('Not authenticated');

  const { data, error } = await client
    .from('user_tenant_map')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single();

  if (error || !data) throw new Error('Tenant mapping not found');

  return data.tenant_id;
}
