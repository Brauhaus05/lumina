import type { Post, PaginatedResponse, ApiResponse } from '@lumina/types';

export interface SdkApiOptions {
  apiUrl: string;
  apiKey: string;
}

// SDK-specific post shape returned by /api/sdk/posts — content pre-rendered to HTML server-side
export type SdkPost = Omit<Post, 'content'> & { rendered_html: string };

export async function fetchPosts(
  options: SdkApiOptions,
  page = 1,
): Promise<PaginatedResponse<SdkPost>> {
  const url = new URL(`${options.apiUrl}/api/sdk/posts`);
  url.searchParams.set('page', String(page));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${options.apiKey}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);

  const body = (await res.json()) as ApiResponse<PaginatedResponse<SdkPost>>;
  if (!body.success) throw new Error(body.error);
  return body.data;
}

export async function fetchPost(
  options: SdkApiOptions,
  slug: string,
): Promise<SdkPost> {
  const url = `${options.apiUrl}/api/sdk/posts/${encodeURIComponent(slug)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${options.apiKey}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);

  const body = (await res.json()) as ApiResponse<SdkPost>;
  if (!body.success) throw new Error(body.error);
  return body.data;
}
