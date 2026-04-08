# DesignKit — AI Agent Skills

> Read the skill file for your task, then execute the request.

## Skills

| Skill | File | What it does |
|-------|------|-------------|
| **Design** | [skills/design.md](skills/design.md) | Generate a pixel-perfect single-file HTML screen or page |
| **React** | [skills/react.md](skills/react.md) | Convert to React TypeScript component (inline styles) |
| **Next.js** | [skills/nextjs.md](skills/nextjs.md) | Build with Next.js App Router + `lib/tokens.ts` |
| **Vue 3** | [skills/vue.md](skills/vue.md) | Convert to Vue 3 `<script setup>` SFC |
| **Svelte 5** | [skills/svelte.md](skills/svelte.md) | Convert to Svelte 5 Runes component |
| **Tailwind** | [skills/tailwind.md](skills/tailwind.md) | Rewrite with Tailwind CSS v4 utility classes |
| **Flutter** | [skills/flutter.md](skills/flutter.md) | Convert to Flutter Dart Widget tree |
| **SwiftUI** | [skills/swiftui.md](skills/swiftui.md) | Convert to SwiftUI View (iOS) |
| **React Native** | [skills/react-native.md](skills/react-native.md) | Convert to React Native StyleSheet component |

---

## Usage

### Design only

```
Read skills/design.md, then design:
a finance app home screen — dark mode, mobile 390px.
Output to output/finance-home.html
```

### Design + convert in one shot

```
Read skills/design.md and skills/nextjs.md, then:
Design and build a SaaS dashboard with sidebar, KPI row, data table.
Output:
- src/app/dashboard/page.tsx
- src/components/layout/Sidebar.tsx
- src/lib/tokens.ts
```

### Convert existing HTML

```
Read skills/react.md, then convert output/dashboard.html
to a React TypeScript component.
Output to src/components/Dashboard.tsx
```

### Pick a framework skill and describe what you want — the skill handles the rest.
