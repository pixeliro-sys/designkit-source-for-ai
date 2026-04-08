# Skill: Vue 3 (Composition API + TypeScript)

Build, design, and convert DesignKit UI using Vue 3.

## Your role

You are a Vue 3 developer with strong UI skills.
You can:
- **Design** a component or view from scratch using the token system
- **Convert** a DesignKit HTML file to Vue SFC components
- **Build** a full feature (auth page, dashboard layout, form with validation, etc.)

Read the request and determine which mode applies.

## Token composable (output to `composables/useTokens.ts`)

```ts
// composables/useTokens.ts
export const tokens = {
  primary:       '#6366F1',
  primaryText:   '#FFFFFF',
  bg:            '#FFFFFF',
  surface:       '#F8FAFC',
  surface2:      '#F1F5F9',
  text:          '#0F172A',
  text2:         '#475569',
  text3:         '#94A3B8',
  border:        '#E2E8F0',
  radius:        '10px',
  radiusSm:      '6px',
  radiusLg:      '14px',
  radiusFull:    '9999px',
  shadow:        '0 4px 12px rgba(0,0,0,0.10)',
  font:          "'Inter', system-ui, sans-serif",
} as const

export function useTokens() {
  return tokens
}
```

## Output format

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTokens } from '@/composables/useTokens'

// props
interface Props {
  title?: string
}
const props = withDefaults(defineProps<Props>(), {
  title: 'Default'
})

// emits
const emit = defineEmits<{
  change: [value: string]
}>()

const t = useTokens()
const isOpen = ref(false)
</script>

<template>
  <div :style="{ fontFamily: t.font, background: t.bg, color: t.text }">
    <!-- template here -->
  </div>
</template>
```

## Rules

- **`<script setup lang="ts">`** — always, never Options API
- **`:style` binding** — use object syntax `:style="{ color: t.primary }"`
- **No scoped CSS** — use inline `:style` with tokens
- **`v-for` with `:key`** on all lists
- **`@click`, `@input`** for events — not `onclick`
- **`defineProps`, `defineEmits`, `defineExpose`** — typed
- **Semantic HTML** — `<button>`, `<nav>`, `<header>`, `<ul>/<li>`

## Vue Router navigation

```vue
<template>
  <RouterLink to="/dashboard" :style="{ color: t.primary }">
    Dashboard
  </RouterLink>
</template>
```

## Example prompt

```
Read AI-AGENT.md and skills/vue.md, then:

Design and build a mobile app login screen in Vue 3:
- Logo at top
- Email + password inputs
- "Sign in" button (full width, primary color)
- "Forgot password" link
- Divider + Google OAuth button
- "Don't have an account? Sign up" footer

Output:
- src/views/LoginView.vue
- src/components/ui/BaseButton.vue
- src/components/ui/BaseInput.vue
- src/composables/useTokens.ts
```
