import type { Database, Media, MediaInsert } from '@lumina/types';
import type { DbClient } from '../types';

type DbMediaInsert = Database['public']['Tables']['media']['Insert'];

export async function createMedia(
  client: DbClient,
  media: MediaInsert,
): Promise<Media> {
  const { data, error } = await client
    .from('media')
    .insert(media as unknown as DbMediaInsert)
    .select()
    .single();

  if (error) throw error;
  return data as Media;
}

export async function getMediaByTenant(
  client: DbClient,
  tenantId: string,
): Promise<Media[]> {
  const { data, error } = await client
    .from('media')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('id', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Media[];
}
