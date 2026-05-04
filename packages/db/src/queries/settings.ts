import type { Database, TenantSettings } from '@lumina/types';
import type { DbClient } from '../types';

type DbSettingsInsert = Database['public']['Tables']['settings']['Insert'];

export async function getSettings(
  client: DbClient,
  tenantId: string,
): Promise<TenantSettings | null> {
  const { data, error } = await client
    .from('settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data as unknown as TenantSettings;
}

export async function upsertSettings(
  client: DbClient,
  settings: TenantSettings,
): Promise<TenantSettings> {
  const { data, error } = await client
    .from('settings')
    .upsert(settings as unknown as DbSettingsInsert)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as TenantSettings;
}
