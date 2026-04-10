# DesignKit Skills

Each skill tells an AI agent how to **design, build, or convert** UI using a specific framework.

Not just convert — you can go directly from idea to working code:

```bash
# Design a screen as HTML first, then convert
"Read skills/design.md, then design: a SaaS dashboard. Output to output/dashboard.html"
"Read skills/react.md, then convert output/dashboard.html to React components"

# Or go directly to the framework in one shot
"Read AI-AGENT.md and skills/nextjs.md, then build:
a SaaS dashboard with sidebar, KPI row, data table.
Output to src/app/dashboard/page.tsx"

# Or build a full feature
"Read skills/react-native.md, then build a complete auth flow:
Splash → Onboarding → Login → Home. Use React Navigation."
```

## Available Skills

| Skill | File | Output |
|-------|------|--------|
| Design | [design.md](design.md) | Single-file `.html` — pixel-perfect screen |
| Contribute | [contribute.md](contribute.md) | Create a valid component or validate an existing one |
| React | [react.md](react.md) | `.tsx` component with hooks |
| Next.js | [nextjs.md](nextjs.md) | App Router page + components |
| Vue 3 | [vue.md](vue.md) | `<script setup>` SFC |
| Svelte | [svelte.md](svelte.md) | `.svelte` component |
| Tailwind CSS | [tailwind.md](tailwind.md) | HTML with Tailwind utility classes |
| Flutter | [flutter.md](flutter.md) | Dart Widget tree |
| SwiftUI | [swiftui.md](swiftui.md) | SwiftUI View |
| React Native | [react-native.md](react-native.md) | RN StyleSheet component |
