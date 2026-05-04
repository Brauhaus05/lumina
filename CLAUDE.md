# CLAUDE.md — Project Lumina

> This file is read automatically by Claude Code at every session start.
> It defines the ground rules, architecture, and task conventions for this project.
> Do not delete or rename this file.

---

## Project Identity

**Name:** Project Lumina
**Type:** Headless, multi-tenant blogging engine
**Philosophy:** Editor-First for clients. SEO-First for search engines.
**Audience:** SaaS clients who embed a blog into their existing websites via subdomain or JS SDK.

---

## Tech Stack (Ground Truth — Never Deviate)

| Layer          | Technology                                         |
| -------------- | -------------------------------------------------- |
| Backend / DB   | Supabase (Postgres + RLS + Edge Functions)         |
| Framework      | Next.js 15 (App Router)                            |
| Editor         | Tiptap (headless, JSON output only)                |
| Asset Pipeline | Cloudinary (`fetch_format: auto`, `quality: auto`) |
| Styling        | Tailwind CSS (Shadow DOM isolated for SDK)         |
| Language       | TypeScript (strict mode, no `any`)                 |

---

## Non-Negotiable Coding Rules

1. **TypeScript Only.** All files must be `.ts` or `.tsx`. Strict mode enabled. No `any` types — ever.
2. **RLS First.** Every Supabase query must include a `tenant_id` filter enforced at the database level via Row Level Security. Never filter by `tenant_id` at the application layer alone.
3. **No Monoliths.** The `Editor` and `Reader` are separate modules. They must never import from each other.
4. **JSON-Native Content.** Post content is always stored and retrieved as Tiptap JSON (`jsonb`). Never serialize to HTML before storing.
5. **XSS Prevention.** Apply `DOMPurify.sanitize()` on every JSON-to-HTML render. No exceptions.
6. **Admin UI Pattern.** Default to a high-contrast, minimalist Bento Grid layout for the Admin Dashboard.
7. **No Magic Strings.** All status values, config keys, and role names must be defined as TypeScript enums or `as const` objects.

---

## Project Structure

```
lumina/
├── CLAUDE.md                  ← You are here
├── apps/
│   ├── admin/                 ← Next.js 15 Admin Dashboard (Bento Grid UI)
│   └── reader/                ← Next.js 15 Reader / SSR delivery layer
├── modules/
│   ├── editor/                ← Tiptap editor, slash commands, image upload
│   └── reader/                ← Content rendering, theme resolution
├── packages/
│   ├── sdk/                   ← <script> embed, Shadow DOM mount, Lumina.init()
│   ├── db/                    ← Supabase client, typed queries, RLS helpers
│   └── types/                 ← Shared TypeScript types across all modules
├── supabase/
│   ├── migrations/            ← SQL migration files (run via supabase db push)
│   └── functions/             ← Deno Edge Functions (rate limiting, webhooks)
└── docs/
    └── PRD.md                 ← Source of truth for product decisions
```

---

## Data Schema

### `tenants`

```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
name        text NOT NULL
subdomain   text NOT NULL UNIQUE
api_key     text NOT NULL
```

### `posts`

```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id   uuid NOT NULL REFERENCES tenants(id)
title       text NOT NULL
slug        text NOT NULL
content     jsonb NOT NULL          -- Tiptap JSON, never HTML
status      text NOT NULL DEFAULT 'draft'  -- 'draft' | 'published'
created_at  timestamptz DEFAULT now()
updated_at  timestamptz DEFAULT now()

UNIQUE INDEX: (tenant_id, slug)
```

### `media`

```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id   uuid NOT NULL REFERENCES tenants(id)
url         text NOT NULL
alt_text    text
metadata    jsonb
```

### `settings`

```sql
tenant_id     uuid PRIMARY KEY REFERENCES tenants(id)
theme_config  jsonb     -- { colors, typography, logo_url }
seo_metadata  jsonb     -- { default_og_title, default_og_image, etc. }
```

---

## RLS Policy Pattern

All tables with a `tenant_id` column must follow this pattern:

```sql
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: tenant isolation via JWT claim
CREATE POLICY "tenant_isolation" ON posts
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

The `tenant_id` claim is injected into the JWT at auth time. Never trust a `tenant_id` passed from the client body.

---

## Module Responsibilities

### `modules/editor`

- Tiptap instance with `/` slash command menu
- Slash commands: headings (H1–H3), images, code blocks, blockquotes, dividers
- Image upload handler: POST to Cloudinary with `fetch_format: auto`, `quality: auto`
- Output: always Tiptap JSON. Validate schema before saving.

### `modules/reader`

- Renders Tiptap JSON to HTML using `generateHTML()` from `@tiptap/html`
- Applies `DOMPurify.sanitize()` before injecting into DOM
- Resolves `theme_config` from `settings` table based on subdomain / `host` header
- Applies theme (CSS variables injected via `<style>` tag)

### `packages/sdk`

- Single `<script>` tag entry point
- Mounts a React component inside a **Shadow DOM** to prevent CSS leakage
- Public API: `Lumina.init({ tenantId: string, container: HTMLElement })`
- Fetches content from the Reader API endpoint

### `supabase/functions/`

- **`rate-limit`**: Deno Edge Function. Limits to 100 req/min per `api_key`. Returns `429` on breach.
- **`sitemap`**: Generates `sitemap.xml` per tenant. Route: `/[subdomain]/sitemap.xml`

---

## Performance Targets

| Metric              | Target                                    |
| ------------------- | ----------------------------------------- |
| Reader TTFB         | < 100ms                                   |
| Admin Dashboard LCP | < 2.5s                                    |
| Image format        | WebP/AVIF via Cloudinary auto             |
| Caching strategy    | `stale-while-revalidate` on Reader routes |

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server-side only, never exposed to client

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Task Sequencing (Build Order)

Follow this order unless a task explicitly requires a different sequence:

1. **Phase 1 — Foundation**
   - [ ] Supabase migration: `tenants`, `posts`, `media`, `settings` tables
   - [ ] RLS policies for all tables
   - [ ] Shared TypeScript types in `packages/types`
   - [ ] Supabase client wrapper in `packages/db`

2. **Phase 2 — Editor**
   - [ ] Tiptap setup in `modules/editor`
   - [ ] Slash command menu
   - [ ] Cloudinary image upload integration
   - [ ] Save/publish flow with status transitions

3. **Phase 3 — Reader**
   - [ ] Tenant resolution middleware (subdomain → `tenant_id`)
   - [ ] Tiptap JSON → sanitized HTML renderer
   - [ ] Theme injection from `settings.theme_config`
   - [ ] Dynamic `sitemap.xml` route

4. **Phase 4 — SDK**
   - [ ] Shadow DOM mount
   - [ ] `Lumina.init()` public API
   - [ ] Bundle optimization (target < 50KB gzipped)

5. **Phase 5 — Security & Performance**
   - [ ] Deno Edge Function rate limiter
   - [ ] `stale-while-revalidate` headers on Reader
   - [ ] End-to-end DOMPurify audit

---

## First Task (Run This on Session Start)

If the `supabase/migrations/` directory is empty or does not exist, begin here:

> **Generate the initial Supabase migration file** (`supabase/migrations/0001_init.sql`) that:
>
> 1. Creates the `tenants`, `posts`, `media`, and `settings` tables with the schema above.
> 2. Enables Row Level Security on all four tables.
> 3. Creates RLS policies using `auth.jwt() ->> 'tenant_id'` for isolation.
> 4. Adds the composite unique index on `posts(tenant_id, slug)`.
> 5. Adds `updated_at` trigger on `posts` using a `moddatetime` extension or equivalent.

---

## How to Ask Claude Code for Help

- Be specific about which module you're working in: _"In `modules/editor`, add..."_
- Reference the schema by table name when asking about data: _"Query the `posts` table where..."_
- Specify the output format: _"Return a typed Supabase query, not raw SQL"_
- For RLS questions, always confirm: _"Does this policy use the JWT claim, not app-layer filtering?"_
