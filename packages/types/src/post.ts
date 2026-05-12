export const PostStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export type PostStatusValue = (typeof PostStatus)[keyof typeof PostStatus];

// Structural type mirroring @tiptap/core JSONContent — no runtime dep on tiptap
export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
};

export type TiptapDocument = {
  type: 'doc';
  content: TiptapNode[];
};

export interface PostSeoMetadata {
  meta_description?: string;
  og_title?: string;
  og_image?: string;
}

export interface Post {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  content: TiptapDocument;
  status: PostStatusValue;
  seo_metadata?: PostSeoMetadata | null;
  created_at: string;
  updated_at: string;
}

export type PostInsert = Omit<Post, 'id' | 'created_at' | 'updated_at'>;
export type PostUpdate = Partial<Omit<Post, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>;
