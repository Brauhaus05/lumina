import { type NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@lumina/db/server';
import { getTenantById, getPostBySlug } from '@lumina/db/queries';
import { renderContent } from '@lumina/reader';
import { PostStatus } from '@lumina/types';
import type { ApiResponse, Post } from '@lumina/types';
import type { SdkPost } from '../route';

function tenantIdFromBearer(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  return match?.[1]?.trim() ?? null;
}

const NO_STORE = { 'Cache-Control': 'private, no-store' };

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse<ApiResponse<SdkPost>>> {
  const tenantId = tenantIdFromBearer(request);
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'Missing Authorization header' }, { status: 401, headers: NO_STORE });
  }

  const { slug } = await params;

  try {
    const client = await createServiceRoleClient();

    const tenant = await getTenantById(client, tenantId);
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404, headers: NO_STORE });
    }

    const post = await getPostBySlug(client, tenantId, slug);
    if (!post || post.status !== PostStatus.PUBLISHED) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404, headers: NO_STORE });
    }

    const { content, ...rest } = post as Post;
    const sdkPost: SdkPost = { ...rest, rendered_html: renderContent(content) };

    return NextResponse.json({ success: true, data: sdkPost }, { headers: NO_STORE });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: NO_STORE });
  }
}
