# Skill: React Native (TypeScript)

Build, design, and convert DesignKit UI using React Native.

## Your role

You are a React Native developer with strong UI skills.
You can:
- **Design** a screen from scratch in React Native using the token system
- **Convert** a DesignKit HTML file to React Native components
- **Build** a full feature (auth flow, tab navigation, list screen, etc.)

Read the request and determine which mode applies.

---

## Token file (`src/tokens.ts`)

Always output this file. Import from it everywhere — never hardcode colors or sizes.

```ts
import { Platform } from 'react-native'

export const t = {
  // Colors
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
  success:       '#22C55E',
  error:         '#EF4444',
  warning:       '#F59E0B',

  // Border radius
  radiusSm:    6,
  radius:      10,
  radiusLg:    14,
  radiusXl:    20,
  radiusFull:  9999,

  // Spacing
  space1:  4,
  space2:  8,
  space3:  12,
  space4:  16,
  space5:  20,
  space6:  24,
  space8:  32,
  space10: 40,

  // Font sizes
  textXs:  11,
  textSm:  13,
  textMd:  15,
  textLg:  17,
  textXl:  20,
  text2xl: 24,
  text3xl: 32,
  text4xl: 48,

  // Platform shadows
  shadowSm: Platform.select({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
    android: { elevation: 2 },
    default: {},
  }),
  shadow: Platform.select({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 12 },
    android: { elevation: 4 },
    default: {},
  }),
} as const
```

---

## Component structure

```tsx
import React, { useState } from 'react'
import {
  View, Text, ScrollView, Pressable, TextInput,
  StyleSheet, SafeAreaView, Image, FlatList,
} from 'react-native'
import { t } from '../tokens'

interface Props {
  // typed props
}

export default function ScreenName({ }: Props) {
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* content */}
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: t.bg },
  scroll: { flex: 1 },
})
```

---

## HTML → React Native mapping

| HTML / CSS | React Native |
|------------|-------------|
| `<div>` | `<View>` |
| `display: flex` (default column) | `<View style={{ flexDirection: 'row' }}>` for row |
| `<p>`, `<span>`, `<h1>` | `<Text>` |
| `<img>` | `<Image source={{ uri: '...' }} style={{ width, height }} />` |
| `<button>` | `<Pressable>` |
| `<input>` | `<TextInput>` |
| `<a>` | `<Pressable onPress={() => navigation.navigate('X')}>` |
| `overflow-y: scroll` | `<ScrollView>` |
| list of items | `<FlatList data={} renderItem={} keyExtractor={} />` |
| `position: fixed; bottom: 0` | `<View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>` |
| `border-radius: 10px` | `borderRadius: 10` (no `px`) |
| `padding: 16px` | `padding: 16` (no `px`) |
| `gap: 8px` in flex | `gap: 8` (RN 0.71+) or `marginBottom` per item |
| `flex: 1` | `flex: 1` |
| `width: 100%` | `alignSelf: 'stretch'` or `flex: 1` |

---

## Common patterns

### Card
```tsx
<View style={s.card}>
  <Text style={s.cardTitle}>Title</Text>
  <Text style={s.cardSub}>Subtitle</Text>
</View>

// styles
card: {
  backgroundColor: t.surface,
  borderRadius: t.radiusLg,
  padding: t.space4,
  borderWidth: 1,
  borderColor: t.border,
  ...t.shadowSm,
},
cardTitle: { fontSize: t.textMd, fontWeight: '600', color: t.text },
cardSub:   { fontSize: t.textSm, color: t.text2, marginTop: 4 },
```

### Primary button
```tsx
<Pressable
  style={({ pressed }) => [s.btn, pressed && s.btnPressed]}
  onPress={onPress}
>
  <Text style={s.btnLabel}>{label}</Text>
</Pressable>

// styles
btn:        { height: 48, backgroundColor: t.primary, borderRadius: t.radius, alignItems: 'center', justifyContent: 'center' },
btnPressed: { opacity: 0.85 },
btnLabel:   { fontSize: t.textMd, fontWeight: '600', color: t.primaryText },
```

### List item
```tsx
<Pressable style={s.item}>
  <View style={s.iconWrap}>
    {/* icon */}
  </View>
  <View style={s.itemBody}>
    <Text style={s.itemTitle}>Label</Text>
    <Text style={s.itemSub}>Subtitle</Text>
  </View>
  <Text style={s.itemTrail}>Value</Text>
</Pressable>

// styles
item:     { flexDirection: 'row', alignItems: 'center', gap: t.space3, paddingVertical: t.space3, borderBottomWidth: 1, borderBottomColor: t.border },
iconWrap: { width: 40, height: 40, borderRadius: t.radiusFull, backgroundColor: t.surface2, alignItems: 'center', justifyContent: 'center' },
itemBody: { flex: 1 },
itemTitle:{ fontSize: t.textMd, fontWeight: '500', color: t.text },
itemSub:  { fontSize: t.textSm, color: t.text2, marginTop: 2 },
itemTrail:{ fontSize: t.textSm, color: t.text3 },
```

### Gradient card (react-native-linear-gradient)
```tsx
import LinearGradient from 'react-native-linear-gradient'

<LinearGradient colors={['#6366F1', '#8B5CF6']} style={s.gradCard}>
  <Text style={s.gradLabel}>Total Balance</Text>
  <Text style={s.gradAmount}>$12,450</Text>
  <Text style={s.gradSub}>↑ 12.5% from last month</Text>
</LinearGradient>

// styles
gradCard:   { borderRadius: t.radiusXl, padding: t.space6 },
gradLabel:  { fontSize: t.textSm, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
gradAmount: { fontSize: t.text4xl, fontWeight: '700', color: '#fff', letterSpacing: -1 },
gradSub:    { fontSize: t.textSm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
```

---

## Rules

- **`StyleSheet.create()`** — all styles here, named short (`s`)
- **`SafeAreaView`** on every screen root
- **`Pressable`** over `TouchableOpacity` for new code
- **`Platform.select()`** for shadow (iOS vs Android elevation)
- **No `px` units** — unitless numbers only
- **`flex: 1`** instead of `width: '100%'`
- **`FlatList`** for long lists — not `ScrollView` + `map()`
- **TypeScript** — all props and state typed

---

## Example prompts

**Design from scratch:**
```
Read AI-AGENT.md and skills/react-native.md, then design and build
a finance app home screen in React Native:
- iOS safe area, status bar
- Gradient balance card (indigo → purple), balance $12,450
- Quick actions row: Send, Receive, Pay, More
- Recent transactions FlatList (5 items: icon, name, date, amount)
- Bottom tab bar: Home, Cards, Analytics, Profile

Output:
- src/screens/HomeScreen.tsx
- src/tokens.ts
```

**Convert from HTML:**
```
Read skills/react-native.md, then convert output/finance-home.html
to React Native. Mobile screen, iOS target.
Output to src/screens/HomeScreen.tsx
```

**Build a feature:**
```
Read skills/react-native.md, then build a complete auth flow
in React Native: Splash → Onboarding (3 steps) → Login → Home.
Use React Navigation stack. Output all screens + navigator.
```
