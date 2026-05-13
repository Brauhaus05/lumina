import { PostStatus } from '@lumina/types';
import type { Database, Post, PostInsert, PostUpdate, TiptapDocument } from '@lumina/types';
import type { DbClient } from '../types';

export async function getPosts(
  client: DbClient,
  tenantId: string,
  options: { status?: string; page?: number; perPage?: number } = {},
): Promise<Post[]> {
  const { status, page = 1, perPage = 20 } = options;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = client
    .from('posts')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (status !== undefined) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function getPostBySlug(
  client: DbClient,
  tenantId: string,
  slug: string,
): Promise<Post | null> {
  const { data, error } = await client
    .from('posts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('slug', slug)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data as Post;
}

export async function getPostById(
  client: DbClient,
  id: string,
): Promise<Post | null> {
  const { data, error } = await client
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data as Post;
}

type DbPostInsert = Database['public']['Tables']['posts']['Insert'];
type DbPostUpdate = Database['public']['Tables']['posts']['Update'];

export async function createPost(
  client: DbClient,
  post: PostInsert,
): Promise<Post> {
  const { data, error } = await client
    .from('posts')
    .insert(post as unknown as DbPostInsert)
    .select()
    .single();

  if (error) throw error;
  return data as Post;
}

export async function updatePost(
  client: DbClient,
  id: string,
  update: PostUpdate,
): Promise<Post> {
  const { data, error } = await client
    .from('posts')
    .update(update as unknown as DbPostUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Post;
}

export async function publishPost(
  client: DbClient,
  id: string,
  content: TiptapDocument,
): Promise<Post> {
  return updatePost(client, id, { status: PostStatus.PUBLISHED, content });
}

export async function unpublishPost(
  client: DbClient,
  id: string,
): Promise<Post> {
  return updatePost(client, id, { status: PostStatus.DRAFT });
}

export async function getPublishedPosts(
  client: DbClient,
  tenantId: string,
): Promise<Post[]> {
  return getPosts(client, tenantId, { status: PostStatus.PUBLISHED, perPage: 100 });
}

export async function getFeaturedPost(
  client: DbClient,
  tenantId: string,
): Promise<Post | null> {
  const { data, error } = await client
    .from('posts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', PostStatus.PUBLISHED)
    .eq('featured', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as Post | null;
}
