# Skill: Next.js (App Router + TypeScript)

Build, design, and convert DesignKit UI using Next.js App Router.

## Your role

You are a Next.js developer with strong UI skills.
You can:
- **Design** a page or layout from scratch using the token system
- **Convert** a DesignKit HTML file into App Router pages + components
- **Build** a full feature (auth flow, dashboard, marketing page, API route + UI, etc.)

Read the request and determine which mode applies.

## Token file (output to `lib/tokens.ts`)

```ts
// lib/tokens.ts
export const t = {
  primary:       '#6366F1',
  primaryText:   '#FFFFFF',
  secondary:     '#64748B',
  accent:        '#F59E0B',
  bg:            '#FFFFFF',
  surface:       '#F8FAFC',
  surface2:      '#F1F5F9',
  text:          '#0F172A',
  text2:         '#475569',
  text3:         '#94A3B8',
  border:        '#E2E8F0',
  borderStrong:  '#CBD5E1',
  success:       '#22C55E',
  error:         '#EF4444',
  warning:       '#F59E0B',
  radius:        '10px',
  radiusSm:      '6px',
  radiusLg:      '14px',
  radiusFull:    '9999px',
  shadow:        '0 4px 12px rgba(0,0,0,0.10)',
  shadowSm:      '0 1px 3px rgba(0,0,0,0.08)',
  shadowLg:      '0 8px 32px rgba(0,0,0,0.12)',
  font:          "'Inter', system-ui, sans-serif",
} as const

export type Tokens = typeof t
```

## Output structure

```
src/
├── app/
│   ├── layout.tsx          ← RootLayout with font + global tokens
│   ├── globals.css         ← :root { --kit-* } + reset
│   └── [page-name]/
│       └── page.tsx        ← Page Server Component
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   └── layout/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
└── lib/
    └── tokens.ts
```

## Component rules

```tsx
// Server Component (default — no interactivity)
import { t } from '@/lib/tokens'

export default function Page() {
  return (
    <main style={{ background: t.bg, minHeight: '100vh' }}>
      ...
    </main>
  )
}
```

```tsx
// Client Component (needs useState, onClick, etc.)
'use client'
import { useState } from 'react'
import { t } from '@/lib/tokens'

export default function InteractiveWidget() {
  const [open, setOpen] = useState(false)
  ...
}
```

## Rules

- **App Router** — never use `pages/` directory
- **Server Components by default** — only add `'use client'` when needed
- **`next/link`** for all internal `<a>` tags
- **`next/image`** for all `<img>` tags, add `width` + `height`
- **No Tailwind unless asked** — use inline `style={{}}` with `t.*` tokens
- **TypeScript** everywhere — all props typed
- **Import tokens from `@/lib/tokens`** — never hardcode hex

## globals.css

```css
/* app/globals.css */
:root {
  --kit-primary:   #6366F1;
  --kit-bg:        #FFFFFF;
  --kit-surface:   #F8FAFC;
  --kit-text:      #0F172A;
  --kit-text-2:    #475569;
  --kit-border:    #E2E8F0;
  --kit-radius:    10px;
  --kit-font:      'Inter', system-ui, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--kit-font); background: var(--kit-bg); color: var(--kit-text); }
```

## Example prompt

```
Read AI-AGENT.md and skills/nextjs.md, then:

Design and build a SaaS dashboard with:
- Sidebar navigation (Logo, 5 menu items, user avatar at bottom)  
- Top header (page title, search, notifications)
- KPI row (4 stat cards: Revenue, Users, Churn, MRR)
- Area chart placeholder
- Recent activity table (5 rows)

Output files:
- src/app/dashboard/page.tsx
- src/components/layout/Sidebar.tsx
- src/components/layout/Header.tsx
- src/components/ui/StatCard.tsx
- src/lib/tokens.ts
```
