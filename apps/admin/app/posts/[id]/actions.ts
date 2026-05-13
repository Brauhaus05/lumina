'use server';

import { createServerSupabaseClient } from '@lumina/db/server';
import { createPost, updatePost, publishPost, unpublishPost } from '@lumina/db/queries';
import { getUserTenantId } from '@lumina/db/queries';
import { PostStatus } from '@lumina/types';
import type { ActionResult, Post, PostSeoMetadata, TiptapDocument } from '@lumina/types';

function isTiptapDocument(value: unknown): value is TiptapDocument {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<string, unknown>)['type'] === 'doc' &&
    Array.isArray((value as Record<string, unknown>)['content'])
  );
}

export async function savePostAction(
  postId: string | null,
  title: string,
  slug: string,
  content: TiptapDocument,
  seoMetadata?: PostSeoMetadata | null,
  category?: string,
): Promise<ActionResult<Post>> {
  try {
    if (!isTiptapDocument(content)) {
      return { success: false, error: 'Invalid content: must be a Tiptap document' };
    }
    if (!title.trim()) {
      return { success: false, error: 'Title is required', fieldErrors: { title: 'Required' } };
    }
    if (!slug.trim()) {
      return { success: false, error: 'Slug is required', fieldErrors: { slug: 'Required' } };
    }

    const client = await createServerSupabaseClient();
    const tenantId = await getUserTenantId(client);

    if (postId) {
      const post = await updatePost(client, postId, {
        title,
        slug,
        content,
        ...(seoMetadata !== undefined && { seo_metadata: seoMetadata }),
        ...(category !== undefined && { category }),
      });
      return { success: true, data: post };
    } else {
      const post = await createPost(client, {
        tenant_id: tenantId,
        title,
        slug,
        content,
        status: PostStatus.DRAFT,
        ...(seoMetadata !== undefined && { seo_metadata: seoMetadata }),
        ...(category !== undefined && { category }),
      });
      return { success: true, data: post };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function publishPostAction(
  postId: string,
  content: TiptapDocument,
): Promise<ActionResult<Post>> {
  try {
    if (!isTiptapDocument(content)) {
      return { success: false, error: 'Invalid content: must be a Tiptap document' };
    }

    const client = await createServerSupabaseClient();
    const post = await publishPost(client, postId, content);
    return { success: true, data: post };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function unpublishPostAction(postId: string): Promise<ActionResult<Post>> {
  try {
    const client = await createServerSupabaseClient();
    const post = await unpublishPost(client, postId);
    return { success: true, data: post };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}
