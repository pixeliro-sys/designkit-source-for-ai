# Skill: AutoGen Design Pipeline

> **For:** Claude, GPT-4o, Gemini, Cursor, Copilot, or any AI agent.
> **Goal:** Generate a complete design project — color system spec → per-screen/page HTML files.
> **Output:** `design-spec.json` + individual `.html` files for every screen or page.

---

## Overview

This skill runs a **two-phase pipeline**:

| Phase | Input | Output |
|-------|-------|--------|
| **1 — Design Spec** | Project description + platform + screens list | `design-spec.json` |
| **2 — HTML Generation** | design-spec.json + per-screen description | One `.html` file per screen |

---

## Phase 1 — Generate Design Spec

### Your role in Phase 1

You are a **senior product designer**. Given a project description, you will create a complete, coherent design system specification — colors, typography, spacing mood, and a screen/page plan.

### Input format

```
Project: {description}
Platform: mobile | web | both
Screens: {optional comma-separated list, e.g. "home, transactions, profile, settings"}
Images folder: {optional path, e.g. "./assets/images" — use real images from here}
```

### Output format — design-spec.json

Respond with a **single JSON object** (no markdown fences, no commentary). Structure:

```json
{
  "project": "Project Name",
  "platform": "mobile",
  "mood": "Short mood description — e.g. Finance / Banking, dark professional",
  "imageFolder": null,
  "colors": {
    "primary": "#6366F1",
    "primaryText": "#FFFFFF",
    "secondary": "#64748B",
    "accent": "#F59E0B",
    "bg": "#0A0E1A",
    "surface": "#141926",
    "surface2": "#1E2538",
    "surface3": "#334155",
    "text": "#F1F5F9",
    "text2": "#94A3B8",
    "text3": "#64748B",
    "textInverse": "#0F172A",
    "border": "#1E2538",
    "borderStrong": "#334155",
    "success": "#22C55E",
    "successBg": "#052E16",
    "error": "#EF4444",
    "errorBg": "#450A0A",
    "warning": "#F59E0B",
    "warningBg": "#431407",
    "info": "#3B82F6",
    "infoBg": "#172554"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "scale": {
      "xs": "11px",
      "sm": "13px",
      "md": "15px",
      "lg": "17px",
      "xl": "20px",
      "2xl": "24px",
      "3xl": "32px",
      "4xl": "48px"
    }
  },
  "radius": {
    "sm": "6px",
    "md": "10px",
    "lg": "14px",
    "xl": "20px",
    "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 3px rgba(0,0,0,0.08)",
    "md": "0 4px 12px rgba(0,0,0,0.10)",
    "lg": "0 8px 32px rgba(0,0,0,0.12)",
    "xl": "0 20px 60px rgba(0,0,0,0.15)"
  },
  "screens": [
    {
      "id": "home",
      "name": "Home Screen",
      "platform": "mobile",
      "description": "Main dashboard showing balance, quick actions, recent transactions, and spending chart",
      "components": [
        "iOS Status Bar",
        "Top App Bar with greeting and avatar",
        "Balance Card (gradient)",
        "Quick Action Buttons row (Send, Receive, Pay, Top Up)",
        "Spending Chart (donut or bar)",
        "Recent Transactions list (3–5 items)",
        "Bottom Tab Navigation (Home, Cards, History, Profile)"
      ],
      "file": "home.html"
    }
  ]
}
```

### Color mood presets — pick the closest and customize

| Mood | primary | bg | surface | text |
|------|---------|----|---------|------|
| Finance / Banking (dark) | `#6366F1` | `#0A0E1A` | `#141926` | `#F1F5F9` |
| Health / Wellness (light) | `#10B981` | `#F0FDF4` | `#FFFFFF` | `#064E3B` |
| E-commerce (orange) | `#F97316` | `#FFFFFF` | `#FFF7ED` | `#1C1917` |
| SaaS / Productivity (indigo) | `#6366F1` | `#FFFFFF` | `#F8FAFC` | `#0F172A` |
| Social / Dating (pink) | `#EC4899` | `#FFFFFF` | `#FDF2F8` | `#1F2937` |
| Travel (blue-teal) | `#0EA5E9` | `#F0F9FF` | `#FFFFFF` | `#0C4A6E` |
| News / Editorial (neutral) | `#1D4ED8` | `#FFFFFF` | `#F9FAFB` | `#111827` |
| Fitness (dark orange) | `#F97316` | `#0C0A09` | `#1C1917` | `#F5F5F4` |
| Education (purple) | `#7C3AED` | `#FFFFFF` | `#F5F3FF` | `#1E1B4B` |

### Screen count guidelines

| Platform | Recommended screens |
|----------|-------------------|
| Mobile app | 4–8 screens |
| Web app | 3–6 pages |
| Landing site | 1–3 pages |
| Both | 4–8 mobile + 3–5 web |

### Rules for Phase 1

1. Output **only valid JSON** — no markdown, no explanation
2. Colors must form a **cohesive, professional palette** — avoid random colors
3. `screens[].components` is an **ordered list** matching top-to-bottom layout
4. `screens[].id` is kebab-case, matches the `file` name: `home` → `home.html`
5. If user provides `imageFolder`, set `"imageFolder": "./path/to/images"` in the spec
6. `platform` per screen can override the project platform for multi-platform projects

---

## Phase 2 — Generate HTML Screens

### Your role in Phase 2

You are a **UI/UX designer and front-end developer**.
For each screen entry in `design-spec.json`, generate a **complete, self-contained HTML file**.

### Input per screen

```
Design spec: {full design-spec.json content}
Screen: {screens[i] object}
Image folder: {null | "./path/to/images"}
```

### CSS token mapping

Map `design-spec.json` colors to `--kit-*` CSS variables:

```css
:root {
  --kit-primary:        {colors.primary};
  --kit-primary-text:   {colors.primaryText};
  --kit-secondary:      {colors.secondary};
  --kit-accent:         {colors.accent};
  --kit-bg:             {colors.bg};
  --kit-surface:        {colors.surface};
  --kit-surface-2:      {colors.surface2};
  --kit-surface-3:      {colors.surface3};
  --kit-text:           {colors.text};
  --kit-text-2:         {colors.text2};
  --kit-text-3:         {colors.text3};
  --kit-text-inverse:   {colors.textInverse};
  --kit-border:         {colors.border};
  --kit-border-strong:  {colors.borderStrong};
  --kit-success:        {colors.success};
  --kit-success-bg:     {colors.successBg};
  --kit-error:          {colors.error};
  --kit-error-bg:       {colors.errorBg};
  --kit-warning:        {colors.warning};
  --kit-warning-bg:     {colors.warningBg};
  --kit-info:           {colors.info};
  --kit-info-bg:        {colors.infoBg};

  --kit-font:           {typography.fontFamily};
  --kit-text-xs:        {typography.scale.xs};
  --kit-text-sm:        {typography.scale.sm};
  --kit-text-md:        {typography.scale.md};
  --kit-text-lg:        {typography.scale.lg};
  --kit-text-xl:        {typography.scale.xl};
  --kit-text-2xl:       {typography.scale["2xl"]};
  --kit-text-3xl:       {typography.scale["3xl"]};
  --kit-text-4xl:       {typography.scale["4xl"]};

  --kit-radius-sm:   {radius.sm};
  --kit-radius:      {radius.md};
  --kit-radius-lg:   {radius.lg};
  --kit-radius-xl:   {radius.xl};
  --kit-radius-full: {radius.full};

  --kit-shadow-sm: {shadow.sm};
  --kit-shadow:    {shadow.md};
  --kit-shadow-lg: {shadow.lg};
  --kit-shadow-xl: {shadow.xl};
}
```

### Image handling

- If `imageFolder` is **null**: use `https://placehold.jp/{W}x{H}.png` for all images
- If `imageFolder` is set: use `{imageFolder}/{filename}` for images — pick realistic filenames
  - Use descriptive filenames: `avatar-user.jpg`, `product-hero.jpg`, `banner-sale.png`
  - If the file might not exist, add `onerror="this.src='https://placehold.jp/{W}x{H}.png'"` as fallback

### Output format — single HTML file

Follow the exact structure from [design.md](design.md):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=390, initial-scale=1.0"><!-- 390 mobile, 1440 web -->
  <title>{screen.name} — {project.name}</title>
  <style>
    /* ── 1. Design Spec Tokens ─────────────────────────────── */
    :root { /* mapped from design-spec.json */ }

    /* ── 2. Reset ────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--kit-font);
      background: var(--kit-bg);
      color: var(--kit-text);
      -webkit-font-smoothing: antialiased;
    }

    /* ── 3. Screen wrapper ─────────────────────────────────── */
    .screen { /* mobile: width:390px / web: max-width:1440px */ }
  </style>
</head>
<body>
  <div class="screen">
    <!-- Components from screen.components, top to bottom -->
  </div>
</body>
</html>
```

### Rules for Phase 2

1. **All colors via `var(--kit-*)`** — never hardcode `#hex` inside component HTML
2. **Inline styles only** — no Tailwind, no Bootstrap, no class-based CSS
3. **Semantic HTML** — `<button>`, `<nav>`, `<header>`, `<a>`, `<ul>/<li>`, `<h1>`–`<h6>`
4. **No JavaScript** — static design preview only
5. **`data-component="..."`** on each component root element
6. **Looks complete and polished** — not a skeleton, real content and realistic data
7. **Consistent** — all screens share the same color tokens from the spec
8. **Platform-aware** — mobile uses 390px viewport, web uses 1440px

---

## Full Pipeline — Agent Instructions

When given an autogen-design task, run these steps in order:

### Step 1 — Parse request

Extract:
- Project description (required)
- Platform: `mobile` | `web` | `both` (default: `mobile`)
- Screens list: from user input, or auto-generate based on project type
- Output directory: where to save files
- Images folder: `null` or a provided path

### Step 2 — Generate design-spec.json

Call AI with Phase 1 prompt. Save result as `{outputDir}/design-spec.json`.

### Step 3 — Generate HTML for each screen

For each screen in `spec.screens`, call AI with Phase 2 prompt.
Save each result as `{outputDir}/{screen.file}`.

### Step 4 — Generate index.html (screen gallery)

Create a simple HTML gallery that links to all generated screens:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{project} — Design Preview</title>
  <style>
    /* Grid of screen preview cards */
  </style>
</head>
<body>
  <h1>{project} — Design Preview</h1>
  <div class="grid">
    {screens.map(s => `<a href="${s.file}"><div class="card">${s.name}</div></a>`)}
  </div>
</body>
</html>
```

### Step 5 — Output summary

Print:
```
✓ design-spec.json
✓ home.html
✓ transactions.html
✓ profile.html
✓ settings.html
✓ index.html
```

---

## Example invocations

### CLI (designkit autogen)

```bash
# Mobile finance app — auto-generate screens
designkit autogen "Personal finance tracking app" --platform mobile

# Web SaaS dashboard — specify screens
designkit autogen "SaaS analytics dashboard" --platform web \
  --screens "landing,dashboard,reports,settings,pricing" \
  --output output/saas-dashboard

# App with real images
designkit autogen "Travel booking app" --platform mobile \
  --images ./assets/travel-images \
  --output output/travel-app

# Use Gemini provider
designkit autogen "E-commerce store" --provider gemini --output output/ecommerce
```

### AI Agent (no CLI)

```
Read skills/autogen-design.md, then:
Generate a complete design project for: "Food delivery app — dark, modern"
Platform: mobile
Screens: splash, home, restaurant-list, restaurant-detail, cart, checkout, order-tracking, profile
Output directory: output/food-app/
Use placehold.jp for images.
```

---

*Part of [DesignKit](../README.md) · See [skills/](../skills/) for individual screen/component skills.*
