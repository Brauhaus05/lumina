# Project Lumina — Status & Next Steps

**Last updated:** 2026-05-12

---

## Infrastructure

| Service         | Status                 | URL                      |
| --------------- | ---------------------- | ------------------------ |
| Supabase (core) | Running                | `http://127.0.0.1:54321` |
| Supabase Studio | Running                | `http://127.0.0.1:54323` |
| Admin App       | Running                | `http://localhost:3000`  |
| Reader App      | Running                | `http://localhost:3001`  |
| imgproxy        | Stopped (non-critical) | —                        |
| pgBouncer       | Stopped (non-critical) | —                        |

## Codebase

| Check                       | Result                                                                    |
| --------------------------- | ------------------------------------------------------------------------- |
| TypeScript (all 7 packages) | Clean                                                                     |
| Migrations applied          | 4/4 (`init`, `rls_policies`, `auth_hook`, `user_tenant_map_rls`)          |
| Dev tenant seeded           | `884394a7-2232-4b2a-9d8c-5b32d194ca46` (subdomain: `dev`)                 |
| Dev settings seeded         | Theme + SEO metadata for dev tenant                                       |
| Dev post seeded             | `hello-from-lumina` (status: `published`)                                 |
| `.env.local` (admin)        | Complete (incl. Cloudinary)                                               |
| `.env.local` (reader)       | Complete (incl. `DEV_SUBDOMAIN=dev`)                                      |
| SDK bundle                  | `dist/lumina.iife.js` — 42 KB raw / **15.4 KB gzipped** (budget: < 50 KB) |

---

## Completed Work

### Phase 1 — Foundation ✅

- Supabase migrations: `tenants`, `posts`, `media`, `settings` tables with RLS
- RLS policies for all tables (tenant isolation via JWT claim)
- RLS on `user_tenant_map` — users can only read their own row
- Custom access token hook injects `tenant_id` into JWT
- Shared TypeScript types in `packages/types`
- Supabase client wrapper in `packages/db`

### Phase 2 — Editor ✅

- Tiptap editor with `@tiptap/suggestion` + tippy.js slash command menu (H1–H3, image, code block, blockquote, divider)
- Cloudinary image upload: `POST /api/upload` → `f_auto,q_auto` delivery URL
- Save/publish flow verified end-to-end: draft → published → unpublish
- Bug fixes: `createServiceRoleClient` on edit page; `tenantId` prop-threaded from server pages (was reading `NEXT_PUBLIC_DEV_TENANT_ID` which is undefined in client components)
- Tiptap SSR hydration warning fixed (`immediatelyRender: false`)

### Phase 3 — Reader ✅

- Tenant resolution via `x-lumina-subdomain` header (set by middleware from host or `NEXT_PUBLIC_DEV_SUBDOMAIN`)
- Tiptap JSON → sanitized HTML via `generateHTML` + DOMPurify (JSDOM singleton)
- Theme injection: all 6 CSS vars (`--lumina-color-*`, `--lumina-font-*`) in `:root {}` on every response
- ISR on `[slug]` page (`revalidate = 60`); `stale-while-revalidate=3600` on both `/` and `/[slug]`

### Phase 4 — SDK ✅

- Shadow DOM mount via Preact (`preact/compat` aliases keep bundle tiny)
- `Lumina.init({ tenantId, container, apiUrl })` public API exposed on `window`
- SDK API routes in reader app: `GET /api/sdk/posts` and `GET /api/sdk/posts/[slug]`
  - Auth: `Authorization: Bearer <tenantId>`
  - Returns `rendered_html` (pre-rendered, sanitized HTML) instead of raw Tiptap JSON
- Bundle: 42 KB raw / 15.4 KB gzipped ✅

### Phase 5 — Security & Performance ✅

- **DOMPurify audit (all render sites):**
  - `renderContent` (SSR): JSDOM + DOMPurify before every page render ✅
  - SDK API: `renderContent` called server-side; SDK client sanitizes again as defense-in-depth ✅
  - Bug fixed: SDK was passing `TiptapDocument` JSON object directly to `DOMPurify.sanitize()` (would have stringified to `[object Object]`)
- **Cache headers:**
  - Reader pages: `public, s-maxage=60, stale-while-revalidate=3600` on `/` and `/:slug`
  - SDK API routes: `private, no-store` (auth-scoped, must not be publicly cached)
- **Rate-limit Edge Function:**
  - 100 req/60 s per `api_key` using Deno KV (in-memory fallback for local dev)
  - `verify_jwt = false` set in `config.toml` (function is its own auth gate)
  - Smoke tested: requests 1–100 → `200 OK`; request 101 → `429 Too Many Requests` with `Retry-After`, `X-RateLimit-Limit/Remaining/Reset` headers

---

## Next Steps

### Auth (Phase 4 continuation)

- [ ] Implement Supabase Auth login flow in admin app (replaces `DEV_TENANT_ID` placeholder)
- [ ] Seed a test user in `auth.users` and link them in `user_tenant_map`
- [ ] Verify JWT hook injects `tenant_id` claim correctly end-to-end
- [ ] Remove `DEV_TENANT_ID` from admin pages once auth is live

### Production Deployment

- [ ] `supabase functions deploy rate-limit` (requires `supabase login`)
- [ ] `supabase functions deploy sitemap`
- [ ] Configure `NEXT_PUBLIC_DEV_SUBDOMAIN` → real subdomain routing in production
- [ ] Set up Vercel (or equivalent) deployments for admin and reader apps

### Polish

- [ ] Smoke test `Lumina.init()` in a real browser (Shadow DOM, post list, post detail navigation)
- [ ] Add error boundary to `PostEditor` for failed auto-saves
- [ ] Sitemap Edge Function: verify `sitemap.xml` output for dev tenant
