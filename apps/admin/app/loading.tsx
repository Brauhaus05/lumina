export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <header className="mb-8 flex items-center justify-between">
        <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-800" />
        <div className="h-9 w-28 animate-pulse rounded-lg bg-zinc-800" />
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Recent Posts — spans 2×2 */}
        <div className="col-span-1 row-span-2 h-64 animate-pulse rounded-2xl bg-zinc-900 sm:col-span-2" />
        {/* Stat cards */}
        <div className="h-32 animate-pulse rounded-2xl bg-zinc-900" />
        <div className="h-32 animate-pulse rounded-2xl bg-zinc-900" />
        {/* Bottom row */}
        <div className="h-32 animate-pulse rounded-2xl bg-zinc-900" />
        <div className="h-32 animate-pulse rounded-2xl bg-zinc-900" />
        <div className="col-span-1 h-32 animate-pulse rounded-2xl bg-zinc-900 sm:col-span-2" />
      </div>
    </main>
  );
}
