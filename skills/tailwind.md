# Skill: Tailwind CSS v4

Build, design, and convert DesignKit UI using Tailwind CSS.

## Your role

You are a frontend developer with strong UI skills, using Tailwind CSS v4.
You can:
- **Design** a component or page from scratch with Tailwind utility classes
- **Convert** a DesignKit HTML file (inline styles → Tailwind classes)
- **Build** a full section or feature (hero, pricing page, dashboard layout, etc.)

Read the request and determine which mode applies.

## Token mapping to Tailwind

```
--kit-primary     → bg-indigo-500 / text-indigo-500 / border-indigo-500
--kit-bg          → bg-white
--kit-surface     → bg-slate-50
--kit-surface-2   → bg-slate-100
--kit-text        → text-slate-900
--kit-text-2      → text-slate-600
--kit-text-3      → text-slate-400
--kit-border      → border-slate-200
--kit-radius      → rounded-[10px]  or  rounded-lg
--kit-radius-sm   → rounded-md
--kit-radius-lg   → rounded-xl
--kit-radius-full → rounded-full
--kit-shadow-sm   → shadow-sm
--kit-shadow      → shadow-md
--kit-shadow-lg   → shadow-lg
--kit-space-4     → p-4 / gap-4 / m-4
--kit-space-6     → p-6 / gap-6
--kit-text-sm     → text-sm
--kit-text-md     → text-base
--kit-text-lg     → text-lg
--kit-text-xl     → text-xl
--kit-text-2xl    → text-2xl
--kit-text-3xl    → text-3xl
--kit-text-4xl    → text-4xl / text-5xl
```

## Tailwind v4 CSS config

```css
/* app.css */
@import "tailwindcss";

@theme {
  --color-primary:    #6366F1;
  --color-surface:    #F8FAFC;
  --color-surface-2:  #F1F5F9;
  --color-kit-text:   #0F172A;
  --color-kit-text-2: #475569;
  --color-kit-text-3: #94A3B8;
  --radius-kit:       10px;
  --font-kit:         'Inter', system-ui, sans-serif;
}
```

## Output format

```html
<!-- Card example -->
<div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
  <h2 class="text-base font-semibold text-slate-900">Card Title</h2>
  <p class="text-sm text-slate-500 mt-1">Supporting text goes here.</p>
</div>

<!-- Button example -->
<button class="h-10 px-5 bg-indigo-500 text-white text-sm font-medium rounded-lg
               hover:bg-indigo-600 active:bg-indigo-700 transition-colors">
  Get Started
</button>
```

## Rules

- **Utility classes only** — no `style=""` in output
- **Semantic HTML** — `<button>`, `<nav>`, `<a>`, `<ul>/<li>`
- **`hover:` / `focus:` / `active:`** variants for interactive elements
- **`dark:` variants** if dark mode is requested
- **`transition-colors`** on all interactive elements
- **No arbitrary values unless necessary** — prefer Tailwind scale
- **`gap-*` not `space-x-*`** for flex/grid spacing

## Example prompt

```
Read skills/tailwind.md, then convert this component to Tailwind CSS:
[paste HTML or file path]

Use Tailwind v4 utility classes. Keep the same visual design.
```

Or design from scratch:

```
Read AI-AGENT.md and skills/tailwind.md, then:

Design a SaaS top navigation bar using Tailwind CSS:
- Logo left
- Nav links center: Features, Pricing, Docs, Blog
- Right: "Sign in" ghost button + "Get started" primary button

Output: components/Navbar.html
```
