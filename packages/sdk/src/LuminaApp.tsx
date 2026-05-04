import { useState, useEffect } from 'preact/hooks';
import DOMPurify, { type Config } from 'dompurify';
import type { Post } from '@lumina/types';
import { fetchPosts } from './api';
import type { SdkApiOptions } from './api';

interface Props extends SdkApiOptions {
  view?: 'list' | 'post';
  slug?: string;
}

const PURIFY_CONFIG: Config = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['style', 'script', 'iframe'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick'],
};

export function LuminaApp({ apiUrl, apiKey }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts({ apiUrl, apiKey })
      .then((res) => setPosts(res.data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load posts'))
      .finally(() => setLoading(false));
  }, [apiUrl, apiKey]);

  if (loading) {
    return (
      <div class="lumina-container">
        <p style="color: #6b7280;">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div class="lumina-container">
        <p style="color: #ef4444;">{error}</p>
      </div>
    );
  }

  if (activeSlug) {
    const post = posts.find((p) => p.slug === activeSlug);
    if (!post) return null;

    // Defense in depth: Reader already sanitized, but sanitize again here
    const safeHtml = DOMPurify.sanitize(
      post.content as unknown as string,
      PURIFY_CONFIG,
    ) as string;

    return (
      <div class="lumina-container">
        <button
          onClick={() => setActiveSlug(null)}
          style="background:none;border:none;cursor:pointer;color:#6b7280;margin-bottom:1rem;"
        >
          ← Back
        </button>
        <h1 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;">{post.title}</h1>
        <p class="lumina-post-date">
          {new Date(post.updated_at).toLocaleDateString()}
        </p>
        <div
          class="lumina-content"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </div>
    );
  }

  return (
    <div class="lumina-container">
      <ul class="lumina-post-list">
        {posts.map((post) => (
          <li key={post.id} class="lumina-post-item">
            <a
              class="lumina-post-title"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveSlug(post.slug);
              }}
            >
              {post.title}
            </a>
            <p class="lumina-post-date">
              {new Date(post.updated_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
