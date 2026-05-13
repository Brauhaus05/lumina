# DESIGN.md — Lumina Visual System

> This file is the single source of truth for all visual decisions across Lumina.
> When adding UI to any app or package, this document governs what is and is not allowed.

---

## Philosophy

**Brutalist editorial.** The system draws from Swiss graphic design and early newspaper layout. Structure is revealed, not hidden. Borders create the grid. Typography carries the hierarchy. Color is restrained. Nothing decorates; everything communicates.

Three principles drive every decision:

1. **Hairlines over shadows.** Depth comes from 1px borders, not box-shadows or gradients.
2. **Type as structure.** Anton sets the scale. Montserrat holds the detail. The grid is typographic.
3. **Off-white, not white.** The palette is warm and tactile — paper, not screen.

---

## Two Surfaces, One DNA

Lumina has two distinct UI surfaces with separate design languages that share a common ancestor palette.

| Surface | App | Primary Audience |
|---|---|---|
| **Reader** | `apps/reader` | End-readers of a tenant's journal |
| **Admin** | `apps/admin` | Tenant editors and admins |

Both surfaces use the same warm cream base and zero border-radius. They diverge in typography and component system.

---

## Color

### Core Palette (Reader / Design System)

Defined in `design-system/styles.css` and consumed by `apps/reader`.

```css
--ink:    rgb(51, 51, 51)      /* All text, borders, foregrounds */
--paper:  rgb(235, 236, 220)   /* All backgrounds */
--line:   rgb(51, 51, 51)      /* Hairline borders (same as ink) */
--accent: rgb(186, 26, 26)     /* Destructive actions, editorial accent */
```

`--ink` and `--line` are intentionally the same value. Borders and text share the same weight — the grid is drawn in ink.

### Admin Palette (Chronicle Cream)

Defined in `apps/admin/app/globals.css`. Maps to shadcn/ui semantic tokens.

```
#1a1918  → --foreground, --primary          (near-black)
#e8e3d3  → --background, --primary-foreground (warm cream)
#ede8d8  → --card, --popover, --sidebar      (slightly lighter cream)
#d5d0c1  → --secondary, --muted, --accent   (mid-tone warm gray)
#c5c0b2  → --border, --input               (hairline gray)
#6b6760  → --muted-foreground              (secondary text)
#b91c1c  → --destructive                   (error / delete)
```

### Shared Rules

- **No pure black or pure white** anywhere in either surface.
- **No opacity hacks for hierarchy.** Use the defined muted tokens.
- The `--accent` / `--destructive` red is reserved for destructive UI only (delete buttons, error states). Never use it decoratively.
- Tenant theme overrides (`--lumina-color-background`, `--lumina-color-text`) cascade into `--paper` and `--ink` via `resolveToCssVars()`. They must not break the contrast ratio below WCAG AA.

---

## Typography

### Reader — Anton + Montserrat

| Role | Font | Weight | Usage |
|---|---|---|---|
| Display | Anton | 400 | Headlines, page titles, card numbers, the `.display` class |
| UI / Body | Montserrat | 400, 500, 700 | Body copy, labels, nav, buttons, all `.eyebrow` / `.label` / `.meta` |
| Italic accent | Montserrat Italic | 400 | Dek text, blockquotes, `.serif-italic` class |

**Type scale (reader):**

| Token | Size | Usage |
|---|---|---|
| `.post-title` | 144px / lh 0.88 | Single post hero heading |
| `.home-hero h1` | 160px / lh 0.92 | Homepage masthead |
| `.featured__title` | 48px / lh 0.95 | Featured card |
| `.post-body h2` | 56px / lh 1 | Post section headings |
| `.article-card__title` | 24px / lh 30px | Grid card titles |
| Body copy | 18px / lh 30px | Post body paragraphs |
| `.post-deck` | 22px / lh 32px | Post standfirst |
| Labels, nav, eyebrows | 12px / ls 0.1em | All uppercase UI text |

Letter-spacing on display type: `-0.02em` to `-0.025em`.
Letter-spacing on labels: `0.1em` (always paired with `text-transform: uppercase`).

### Admin — Bebas Neue + Geist

| Role | Font | Variable |
|---|---|---|
| Heading | Bebas Neue | `--font-bebas` → `--font-heading` |
| Body / UI | Geist | `--font-geist` → `--font-sans` |

Bebas Neue is used for admin dashboard section headings and bento card labels only. Body text, form controls, and data tables use Geist.

---

## Spacing & Layout

### Reader Canvas

```
--max:    1280px   /* Fixed page width */
--pad-x:  64px     /* Horizontal padding inside .page */
--col:    426.667px /* Single column width (1280 / 3) */
--hair:   1px      /* All borders */
```

The page is a fixed 1280px canvas centered in the viewport, bordered left and right by hairlines (`border-left: var(--hair) solid var(--line)`). It does not reflow — the reader is a desktop-first editorial experience.

**Grid:** Three equal columns created by `display: grid; grid-template-columns: 1fr 1fr 1fr` with `border-left` dividers, not gap. The grid is visible structure, not invisible scaffolding.

**Vertical rhythm:** Sections are separated by `border-bottom: var(--hair) solid var(--line)`. No margin-based gutters between top-level sections.

### Admin Canvas

Bento Grid layout. No fixed canvas width — the admin is responsive. Cards are bordered using `--border` tokens. All border-radius values are `0rem` (enforced via `--radius: 0rem` in the shadcn theme).

---

## Components

### Shared

#### `.btn` / `.btn--solid` (Reader)

```css
height: 34px; padding: 0 24px;
border: 1px solid var(--ink);
font: 700 12px/1 "Montserrat"; letter-spacing: 0.1em; text-transform: uppercase;
```

- Default: transparent background, ink border and text. Hover → ink background, paper text.
- `--solid`: inverted (ink background). Hover → paper background, ink text.
- `--block`: full-width, 42px height.

No border-radius. No shadow. No rounded corners anywhere in the reader.

#### `.readmore` (Reader)

Inline arrow link. The `<svg>` arrow inside `.arrow-line` translates `+2px` on hover via `transform`. Never use a plain text `→` glyph for this pattern — always use the SVG arrow.

### Reader-Specific

| Class | Description |
|---|---|
| `.page` | Fixed 1280px page shell with hairline left/right borders |
| `.site-header` | 144px tall, flex, border-bottom |
| `.brand__mark` | 70px circular badge, background `--ink`, letter via `::after content: var(--brand-initial)` |
| `.site-footer` | 147px tall, space-between, border-top |
| `.home-hero` | 96px top padding, large Anton headline |
| `.featured` | 2fr + 1fr grid, cover image left |
| `.grid-3` | Three-column hairline grid |
| `.article-card` | 24px padding, `min-height: 313px`, border-bottom |
| `.newsletter` | Dark (ink bg, paper text) sidebar newsletter block |
| `.post-wrap` | 282px sidebar + 1fr body, 126px column gap |
| `.post-sidebar` | Sticky, top: 32px |
| `.post-body` | Max-width 792px article body |
| `.post-title` | 144px Anton, lh 0.88 |
| `.lumina-content` | Prose wrapper for Tiptap-rendered HTML, max-width 65ch |

### Admin-Specific

Built on shadcn/ui primitives. Key patterns:

- **Bento cards**: `<Card>` with no border-radius, `--card` background, `--border` border.
- **Data tables**: `<Table>` with hairline rows. No zebra striping. Muted foreground for secondary columns.
- **Status badges**: `<Badge>` with `variant="outline"`. Published → default. Draft → muted.
- **Destructive actions**: `<Button variant="destructive">` maps to `--destructive` (`#b91c1c`). Always paired with a confirmation dialog.

---

## Utility Classes (Reader)

```css
.hair-b  { border-bottom: 1px solid var(--line); }
.hair-t  { border-top:    1px solid var(--line); }
.hair-r  { border-right:  1px solid var(--line); }
.hair-l  { border-left:   1px solid var(--line); }
```

Use these for one-off structural lines. Do not invent new border utility names.

Typography utilities:

```css
.eyebrow / .label / .meta  → Montserrat 700, 12px, 0.1em ls, uppercase
.display                   → Anton, uppercase, lh 0.92, ls -0.02em
.serif-italic              → Montserrat italic
```

---

## Multi-Tenant Theming

Tenants can override the base color pair via `settings.theme_config`. The `resolveToCssVars()` function in `modules/reader` converts the stored JSON into a `<style>` block injected into `<head>`:

```css
:root {
  --lumina-color-background: <tenant value>;
  --lumina-color-text: <tenant value>;
}
```

The reader's design system tokens cascade from these:

```css
--paper: var(--lumina-color-background, rgb(235, 236, 220));
--ink:   var(--lumina-color-text,       rgb(51, 51, 51));
```

**Constraints for tenant overrides:**
- Background must meet ≥ 4.5:1 contrast ratio with the chosen text color.
- Fonts are not tenant-overridable — Anton + Montserrat are part of the editorial identity.
- Layout structure (page width, hairline grid, header height) is not overridable.

---

## File Map

```
design-system/
  styles.css           ← canonical shared CSS for reader surface
  index.html           ← homepage reference mockup
  post.html            ← post page reference mockup
  editor.html          ← editor UI reference mockup

apps/reader/app/
  design-system.css    ← copy of the above (consumed by Next.js build)
  globals.css          ← @import design-system.css + bridge aliases + page CSS

apps/admin/app/
  globals.css          ← Chronicle cream shadcn/ui theme
  layout.tsx           ← Geist + Bebas Neue fonts
```

When updating the design system, edit `design-system/styles.css` first and then sync `apps/reader/app/design-system.css`.

---

## What Is Not Allowed

| Pattern | Reason |
|---|---|
| `border-radius > 0` anywhere | Violates brutalist identity |
| `box-shadow` for depth | Use hairline borders instead |
| Gradients | Not part of the palette |
| Pure `#000000` or `#ffffff` | Use `--ink` and `--paper` |
| Inline color values in JSX | Reference CSS variables via className |
| `font-size` below 12px | Below that, labels lose legibility |
| Decorative use of `--accent` (red) | Reserved for destructive UI only |
| New fonts | Anton + Montserrat (reader), Bebas Neue + Geist (admin). No additions without updating this file. |
