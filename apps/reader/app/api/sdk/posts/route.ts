import { type NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@lumina/db/server';
import { getTenantById, getPosts } from '@lumina/db/queries';
import { renderContent } from '@lumina/reader';
import { PostStatus } from '@lumina/types';
import type { ApiResponse, PaginatedResponse, Post } from '@lumina/types';

const PER_PAGE = 20;

// SDK-specific shape: content replaced with pre-rendered, sanitized HTML
export type SdkPost = Omit<Post, 'content'> & { rendered_html: string };

function tenantIdFromBearer(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  return match?.[1]?.trim() ?? null;
}

const NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PaginatedResponse<SdkPost>>>> {
  const tenantId = tenantIdFromBearer(request);
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Missing Authorization header' }, { status: 401, headers: NO_STORE });
  }

  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') ?? '1'));

  try {
    const client = await createServiceRoleClient();

    const tenant = await getTenantById(client, tenantId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404, headers: NO_STORE });
    }

    // Fetch one extra to determine hasMore without a count query
    const rows = await getPosts(client, tenantId, {
      status: PostStatus.PUBLISHED,
      page,
      perPage: PER_PAGE + 1,
    });

    const hasMore = rows.length > PER_PAGE;
    const posts = (hasMore ? rows.slice(0, PER_PAGE) : rows) as Post[];

    const sdkPosts: SdkPost[] = posts.map(({ content, ...rest }) => ({
      ...rest,
      rendered_html: renderContent(content),
    }));

    return NextResponse.json(
      { success: true, data: { data: sdkPosts, total: sdkPosts.length, page, perPage: PER_PAGE, hasMore } },
      { headers: NO_STORE },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: NO_STORE });
  }
}
