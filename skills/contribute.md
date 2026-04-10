# Skill: Contribute — Generate a DesignKit Component

You are a DesignKit component author.
When asked to create a new component, output a valid `.html` file
that meets every rule below. No exceptions.

---

## Step 1 — Determine placement

Ask yourself (or infer from the request):

| Question | Answer → |
|----------|----------|
| Is it for mobile app (iOS/Android)? | `components/app-mobile/{category}/` |
| Is it for web/desktop? | `components/web/{category}/` |
| Is it reusable across both (icon, illustration, mockup)? | `components/common/{category}/` |

**Existing categories — use these, don't invent new ones:**

```
app-mobile:  navbars, buttons, cards, inputs, lists, chips, feedback, tabs,
             toggles, menus, dialogs, surfaces, sliders, badges, dividers,
             native, patterns, charts, data-display, forms, ecommerce,
             finance, fitness, food, healthcare, education, social, travel,
             job, media, navigation, logistics

web:         navbars, buttons, cards, inputs, heroes, features, cta, pricing,
             social-proof, layout, tables, modals, feedback, charts, widgets,
             patterns, products, cart, account, tabs, forms, ecommerce,
             marketing, content, media, saas, job, real-estate, metrics,
             data-display, badges, dividers, navigation, surfaces, menus,
             toggles, logos, screenshots, social, social-media, presentation,
             promotions, print

common:      ui-icons, illustrations, decorations, mockup-elements
```

If none fit, pick the closest one.

---

## Step 2 — Write the file header

Every component file starts with this comment. Fill in all fields.

```html
<!--
  @name: {Title Case Name}
  @kit: {web | app-mobile | common}
  @category: {category folder name}
  @width: {intended render width in px, number only}
  @height: {intended render height in px, number only}
  @tags: {comma, separated, lowercase, keywords}
-->
```

Example:
```html
<!--
  @name: Pricing Card Pro
  @kit: web
  @category: pricing
  @width: 320
  @height: 480
  @tags: pricing, card, pro, tier, subscription, saas
-->
```

---

## Step 3 — Wrap with font root

The outer wrapper must set the font family so the component renders correctly
when opened standalone:

```html
<div data-component="{Name}" style="font-family:var(--kit-font,Inter,system-ui,sans-serif)">
  <!-- component content here -->
</div>
```

---

## Step 4 — Build with tokens

**Every** color, size, radius, shadow, and spacing value must use a `var(--kit-*)` with a hardcoded fallback.

### Token reference

```css
/* Colors */
var(--kit-primary,       #6366F1)
var(--kit-primary-text,  #FFFFFF)
var(--kit-secondary,     #64748B)
var(--kit-accent,        #F59E0B)
var(--kit-bg,            #FFFFFF)
var(--kit-surface,       #F8FAFC)
var(--kit-surface-2,     #F1F5F9)
var(--kit-text,          #0F172A)
var(--kit-text-2,        #475569)
var(--kit-text-3,        #94A3B8)
var(--kit-text-inverse,  #FFFFFF)
var(--kit-border,        #E2E8F0)
var(--kit-border-strong, #CBD5E1)
var(--kit-success,       #22C55E)
var(--kit-error,         #EF4444)
var(--kit-warning,       #F59E0B)
var(--kit-info,          #3B82F6)

/* Typography */
var(--kit-font,     'Inter',system-ui,sans-serif)
var(--kit-text-xs,  11px)
var(--kit-text-sm,  13px)
var(--kit-text-md,  15px)
var(--kit-text-lg,  17px)
var(--kit-text-xl,  20px)
var(--kit-text-2xl, 24px)
var(--kit-text-3xl, 32px)
var(--kit-text-4xl, 48px)

/* Spacing */
var(--kit-space-1,  4px)
var(--kit-space-2,  8px)
var(--kit-space-3,  12px)
var(--kit-space-4,  16px)
var(--kit-space-5,  20px)
var(--kit-space-6,  24px)
var(--kit-space-8,  32px)
var(--kit-space-10, 40px)

/* Border radius */
var(--kit-radius-sm,   6px)
var(--kit-radius,      10px)
var(--kit-radius-lg,   14px)
var(--kit-radius-xl,   20px)
var(--kit-radius-full, 9999px)

/* Shadows */
var(--kit-shadow-sm, 0 1px 3px rgba(0,0,0,0.08))
var(--kit-shadow,    0 4px 12px rgba(0,0,0,0.10))
var(--kit-shadow-lg, 0 8px 32px rgba(0,0,0,0.12))
var(--kit-shadow-xl, 0 20px 60px rgba(0,0,0,0.15))
```

### ❌ Never do this
```html
<div style="background:#6366F1; border-radius:10px; color:#fff">
```

### ✅ Always do this
```html
<div style="background:var(--kit-primary,#6366F1); border-radius:var(--kit-radius,10px); color:var(--kit-primary-text,#FFF)">
```

---

## Step 5 — Use semantic HTML

| Purpose | Use |
|---------|-----|
| Clickable action | `<button type="button">` |
| Navigation link | `<a href="#">` |
| Navigation group | `<nav>` |
| Page/section header | `<header>` |
| Main content | `<main>` |
| List of items | `<ul><li>` |
| Form field | `<input>`, `<label>`, `<textarea>`, `<select>` |
| Headings | `<h1>`–`<h6>` |
| Paragraph | `<p>` |

**Never use `<div>` for interactive elements.**

---

## Step 6 — No JavaScript

- No `<script>` tags
- No `onclick`, `onchange`, `oninput` attributes
- No CSS animations that require JS triggers
- Static design preview only — interactions are implied visually

---

## Step 7 — Images

Always use placeholder URLs. Never embed base64 or reference local files.

```html
<img src="https://placehold.jp/400x300.png" alt="product image" style="width:100%;border-radius:var(--kit-radius,10px);display:block;" />
```

Common sizes:
```
320x200   card image
400x300   product image
80x80     avatar
40x40     icon / thumbnail
1440x600  hero background
390x844   full mobile screen
```

---

## Full output format

```html
<!--
  @name: {Name}
  @kit: {web|app-mobile|common}
  @category: {category}
  @width: {W}
  @height: {H}
  @tags: {tag1, tag2, tag3}
-->
<div data-component="{Name}" style="font-family:var(--kit-font,Inter,system-ui,sans-serif)">

  <!-- component HTML here — inline styles, tokens, semantic elements -->

</div>
```

---

## Validation checklist

Before outputting, verify every item:

- [ ] File header present with all 6 fields
- [ ] Outer `data-component` wrapper with `font-family`
- [ ] Every color uses `var(--kit-*, fallback)`
- [ ] Every radius, shadow, spacing uses `var(--kit-*, fallback)`
- [ ] No hardcoded hex in component HTML
- [ ] Semantic HTML — no div-soup for interactive elements
- [ ] No `<script>` tags or JS event attributes
- [ ] Placeholder images via `placehold.jp`
- [ ] File path matches: `components/{kit}/{category}/{name}.html`

---

## Example prompts

**Create one component:**
```
Read skills/contribute.md, then create a new component:
A mobile "Story Row" — horizontal scrollable row of circular avatar stories
with an "Add story" button at the left.

Output to components/app-mobile/patterns/story-row-scrollable.html
```

**Create a set of related components:**
```
Read skills/contribute.md, then create 3 pricing card variants for web:
- card-pricing-starter.html  (basic tier, outlined)
- card-pricing-pro.html      (highlighted, filled primary)
- card-pricing-enterprise.html (dark, custom)

Output to components/web/pricing/
```

**Validate an existing component:**
```
Read skills/contribute.md, then review components/web/cards/card-basic.html
and check if it meets all contribution rules.
Report any violations.
```
