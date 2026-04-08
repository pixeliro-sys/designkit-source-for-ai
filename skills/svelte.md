# Skill: Svelte 5 (Runes)

Build, design, and convert DesignKit UI using Svelte 5.

## Your role

You are a Svelte 5 developer with strong UI skills.
You can:
- **Design** a component or page from scratch using the token system
- **Convert** a DesignKit HTML file to Svelte components
- **Build** a full feature (auth flow, dashboard, interactive form, etc.)

Read the request and determine which mode applies.

## Token module (`src/lib/tokens.ts`)

```ts
export const t = {
  primary:       '#6366F1',
  primaryText:   '#FFFFFF',
  bg:            '#FFFFFF',
  surface:       '#F8FAFC',
  text:          '#0F172A',
  text2:         '#475569',
  text3:         '#94A3B8',
  border:        '#E2E8F0',
  radius:        '10px',
  radiusSm:      '6px',
  radiusLg:      '14px',
  shadow:        '0 4px 12px rgba(0,0,0,0.10)',
  font:          "'Inter', system-ui, sans-serif",
} as const
```

## Output format

```svelte
<script lang="ts">
  import { t } from '$lib/tokens'

  // Svelte 5 runes
  let { title = 'Default', onclick }: {
    title?: string
    onclick?: () => void
  } = $props()

  let isOpen = $state(false)
  let label = $derived(isOpen ? 'Close' : 'Open')
</script>

<div style:font-family={t.font} style:background={t.bg} style:color={t.text}>
  <!-- markup here -->
</div>
```

## Svelte style directives

Use `style:property={value}` instead of `:style="{}"`

```svelte
<!-- preferred -->
<div
  style:background={t.surface}
  style:border-radius={t.radius}
  style:padding="16px"
>

<!-- also valid for dynamic objects -->
<div style={`background:${t.primary};color:${t.primaryText}`}>
```

## Rules

- **Svelte 5 Runes** — `$state`, `$derived`, `$props`, `$effect`
- **`style:property`** directive — not `style=""` string
- **`{#each}` with `{#key}`** for lists
- **`{#if}` / `{:else}`** for conditionals
- **`<a href="">` with SvelteKit** → use `<a>` (SvelteKit handles routing)
- **No class-based CSS** — inline styles only

## Example prompt

```
Read AI-AGENT.md and skills/svelte.md, then:

Design and build a pricing section for a SaaS app in Svelte 5:
- Monthly/Annual toggle (saves 20%)
- 3 pricing tiers: Starter $9, Pro $29 (highlighted), Enterprise $99
- Feature list per tier
- CTA button per tier

Output:
- src/lib/components/PricingSection.svelte
- src/lib/tokens.ts
```
