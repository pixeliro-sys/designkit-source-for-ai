# Contributing to DesignKit

Thanks for contributing! DesignKit grows by community-submitted components.

---

## What to contribute

- **New components** — any UI pattern not already in the kit
- **New full designs** — complete multi-page app or website HTML
- **Skill files** — new framework conversions in `skills/`
- **Bug fixes** — broken layout, token inconsistency, wrong semantic HTML

---

## Component rules

Every component must follow these rules — no exceptions:

### 1. Self-contained HTML snippet

```html
<!--
  @name: Card Elevated
  @kit: web
  @category: cards
  @width: 320
  @height: 120
  @tags: card, elevated, shadow, surface
-->
<div data-component="Card Elevated" style="font-family:var(--kit-font,Inter,system-ui,sans-serif)">
  <div style="
    background: var(--kit-surface, #F8FAFC);
    border-radius: var(--kit-radius-lg, 14px);
    padding: var(--kit-space-4, 16px);
    box-shadow: var(--kit-shadow, 0 4px 12px rgba(0,0,0,0.10));
  ">
    <h3 style="font-size:var(--kit-text-md,15px);font-weight:600;color:var(--kit-text,#0F172A);">Card Title</h3>
    <p style="font-size:var(--kit-text-sm,13px);color:var(--kit-text-2,#475569);margin-top:4px;">Supporting text goes here.</p>
  </div>
</div>
```

### 2. File header (required)

Every `.html` file must start with this comment block:

| Field | Required | Description |
|-------|----------|-------------|
| `@name` | ✅ | Display name, Title Case |
| `@kit` | ✅ | `web`, `app-mobile`, or `common` |
| `@category` | ✅ | Folder name (e.g. `cards`, `buttons`) |
| `@width` | ✅ | Intended render width in px |
| `@height` | ✅ | Intended render height in px |
| `@tags` | ✅ | Comma-separated keywords |

### 3. Token-only styling

```html
<!-- ❌ WRONG — hardcoded values -->
<div style="background:#6366F1; color:#FFFFFF; border-radius:10px;">

<!-- ✅ CORRECT — token + fallback -->
<div style="background:var(--kit-primary,#6366F1); color:var(--kit-primary-text,#FFF); border-radius:var(--kit-radius,10px);">
```

Always include a fallback value: `var(--kit-primary, #6366F1)`.

### 4. Semantic HTML

```html
<!-- ❌ -->
<div onclick="...">Submit</div>

<!-- ✅ -->
<button type="button">Submit</button>
```

Use: `<button>`, `<a>`, `<nav>`, `<header>`, `<main>`, `<ul>/<li>`, `<input>`, `<label>`

### 5. No JavaScript

Components are static design previews. No `<script>` tags, no `onclick`, no event listeners.

### 6. Placeholder images

```html
<img src="https://placehold.jp/400x300.png" alt="placeholder" />
```

### 7. `data-component` attribute

```html
<div data-component="Card Elevated" style="...">
```

---

## File naming

```
components/
├── web/
│   └── {category}/
│       └── {component-name}.html      ← kebab-case
├── app-mobile/
│   └── {category}/
│       └── {component-name}.html
└── common/
    └── {category}/
        └── {component-name}.html
```

Examples:
- `components/web/cards/card-pricing-tier.html`
- `components/app-mobile/patterns/story-row.html`
- `components/common/illustrations/empty-notifications.html`

---

## Submitting a new component

1. **Fork** the repo
2. Create a branch: `git checkout -b component/your-component-name`
3. Add your `.html` file in the correct `components/` subfolder
4. Test: open the file in a browser — it must render correctly without any external dependencies
5. Open a **Pull Request** with:
   - Screenshot or description of what the component looks like
   - Which kit it belongs to (`web` / `app-mobile` / `common`)
   - Brief description of the use case

---

## Submitting a new skill

Skill files live in `skills/`. A skill tells an AI agent how to design, build, or convert UI using a specific tool or framework.

```
skills/angular.md
skills/astro.md
skills/shadcn.md
```

Follow the format of existing skills (e.g. [skills/react.md](skills/react.md)):
- State the 3 modes: Design / Convert / Build
- Include a token map for the framework
- Include common patterns with code examples
- End with example prompts

---

## Reporting issues

Open a GitHub Issue with:
- Which component file (`components/web/cards/card-basic.html`)
- What's broken (token missing, wrong layout, not semantic)
- Browser/device if relevant

---

## Token reference

All components use these CSS custom properties. See [README.md](README.md#token-system) for the full list.

Quick reference:

```css
--kit-primary      --kit-bg         --kit-surface
--kit-text         --kit-text-2     --kit-text-3
--kit-border       --kit-radius     --kit-shadow
--kit-font         --kit-space-4    --kit-text-md
```

---

MIT License — all contributions are released under the same license.
