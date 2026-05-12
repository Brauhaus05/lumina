'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { PostStatus } from '@lumina/types';
import type { Post, PostStatusValue } from '@lumina/types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PAGE_SIZE = 25;

type StatusFilter = 'all' | PostStatusValue;

interface Props {
  posts: Post[];
}

export function PostsTable({ posts }: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return posts.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesQuery =
        !q || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [posts, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((p) => p.status === PostStatus.PUBLISHED).length,
      draft: posts.filter((p) => p.status === PostStatus.DRAFT).length,
    }),
    [posts],
  );

  return (
    <div>
      {/* Toolbar: tabs + search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={statusFilter} onValueChange={handleFilterChange}>
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value={PostStatus.PUBLISHED}>
              Published ({counts.published})
            </TabsTrigger>
            <TabsTrigger value={PostStatus.DRAFT}>Draft ({counts.draft})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search posts…"
            className="pl-8 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-primary/50"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">
          <p className="text-zinc-400">
            {query || statusFilter !== 'all'
              ? 'No posts match your filter.'
              : 'No posts yet.'}
          </p>
          {!query && statusFilter === 'all' && (
            <Link href="/posts/new" className="mt-4 inline-block text-primary hover:text-primary/80">
              Create your first post →
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
          <ul className="divide-y divide-zinc-800">
            {paginated.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.id}`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-zinc-800/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-zinc-100">{post.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">/{post.slug}</p>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-4">
                    <span className="hidden text-xs text-zinc-600 sm:block">
                      {new Date(post.updated_at).toLocaleDateString()}
                    </span>
                    <Badge variant={post.status === PostStatus.PUBLISHED ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-3">
              <p className="text-xs text-zinc-500">
                {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="px-2 text-xs text-zinc-500">
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
