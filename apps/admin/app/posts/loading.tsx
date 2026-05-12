export default function PostsLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <header className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="h-7 w-16 animate-pulse rounded bg-zinc-800" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-zinc-800" />
      </header>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 last:border-0"
          >
            <div className="space-y-1.5">
              <div className="h-4 w-48 animate-pulse rounded bg-zinc-800" />
              <div className="h-3 w-32 animate-pulse rounded bg-zinc-800" />
            </div>
            <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-800" />
          </div>
        ))}
      </div>
    </main>
  );
}
