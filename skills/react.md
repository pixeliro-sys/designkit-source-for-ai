# Skill: React (TypeScript)

Build, design, and convert DesignKit UI using React TypeScript.

## Your role

You are a React developer with strong UI skills.
You can:
- **Design** a component or page from scratch using the token system
- **Convert** a DesignKit HTML file to React components
- **Build** a full feature (auth form, dashboard layout, data table, etc.)

Read the request and determine which mode applies.

## Styling approach

Use whichever the user specifies. If not specified, default to **CSS Modules**.

### Option A — CSS Modules (default)

```tsx
// Button.tsx
import styles from './Button.module.css'

export default function Button({ label }: { label: string }) {
  return <button className={styles.btn}>{label}</button>
}
```

```css
/* Button.module.css */
.btn {
  height: 40px;
  padding: 0 20px;
  background: var(--kit-primary, #6366F1);
  color: var(--kit-primary-text, #fff);
  border-radius: var(--kit-radius, 10px);
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
```

Keep `var(--kit-*)` in CSS — tokens stay in one place, easy to retheme.

### Option B — Tailwind CSS

```tsx
export default function Button({ label }: { label: string }) {
  return (
    <button className="h-10 px-5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors">
      {label}
    </button>
  )
}
```

Use Tailwind utility classes. Map `--kit-*` → Tailwind scale (see [skills/tailwind.md](tailwind.md)).

### Option C — inline styles + token object

Use when zero build config is preferred, or when converting HTML 1:1.

```tsx
const t = {
  primary:     '#6366F1',
  primaryText: '#FFFFFF',
  bg:          '#FFFFFF',
  surface:     '#F8FAFC',
  text:        '#0F172A',
  text2:       '#475569',
  text3:       '#94A3B8',
  border:      '#E2E8F0',
  radius:      '10px',
  shadow:      '0 4px 12px rgba(0,0,0,0.10)',
  font:        "'Inter', system-ui, sans-serif",
} as const

export default function Button({ label }: { label: string }) {
  return (
    <button style={{
      height: 40,
      padding: '0 20px',
      background: t.primary,
      color: t.primaryText,
      borderRadius: t.radius,
      border: 'none',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
    }}>
      {label}
    </button>
  )
}
```

### Option D — styled-components / Emotion

```tsx
import styled from 'styled-components'

const Btn = styled.button`
  height: 40px;
  padding: 0 20px;
  background: var(--kit-primary, #6366F1);
  color: var(--kit-primary-text, #fff);
  border-radius: var(--kit-radius, 10px);
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
`

export default function Button({ label }: { label: string }) {
  return <Btn>{label}</Btn>
}
```

---

## Output format (CSS Modules default)

```tsx
import React, { useState } from 'react'
import styles from './ComponentName.module.css'

interface Props {
  // typed props here
}

export default function ComponentName({ ...props }: Props) {
  // state here

  return (
    <div className={styles.root}>
      {/* JSX here */}
    </div>
  )
}
```

## Rules

- **TypeScript** — all props typed with `interface`
- **Semantic HTML** — `<button>`, `<nav>`, `<header>`, `<ul>/<li>`, `<a>`
- **No hardcoded hex** — reference tokens via `var(--kit-*)` in CSS, or `t.*` in inline styles
- **Split large screens** — extract repeated patterns into sub-components
- **Images** — `<img src="https://placehold.jp/400x300.png" alt="..." />`
- One file output unless the user asks for multiple files

## Example prompts

```
Read skills/react.md, then convert output/dashboard.html
to React components using CSS Modules.
Output to src/components/Dashboard/
```

```
Read skills/react.md, then convert output/dashboard.html
to React + Tailwind.
Output to src/components/Dashboard.tsx
```

```
Read AI-AGENT.md and skills/react.md, then design and build
a finance app home screen in React with styled-components.
Output to src/screens/HomeScreen.tsx
```
