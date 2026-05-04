import type { Tenant } from '@lumina/types';
import type { DbClient } from '../types';

export async function getTenantBySubdomain(
  client: DbClient,
  subdomain: string,
): Promise<Tenant | null> {
  const { data, error } = await client
    .from('tenants')
    .select('*')
    .eq('subdomain', subdomain)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data as Tenant;
}

export async function getTenantById(
  client: DbClient,
  id: string,
): Promise<Tenant | null> {
  const { data, error } = await client
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data as Tenant;
}
