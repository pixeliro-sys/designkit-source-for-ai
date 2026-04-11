# DesignKit CLI

502 HTML UI components + AI-powered design commands.

## Install

```bash
npm install -g designkit-ai
```

Or use without installing:

```bash
npx designkit-ai <command>
```

---

## Commands

### `designkit list`

Browse all 502 components.

```bash
designkit list
designkit list --kit web
designkit list --kit app-mobile --category buttons
designkit list --kit common
```

Options:
- `-k, --kit` — Filter by kit: `web`, `app-mobile`, `common`
- `-c, --category` — Filter by category (e.g. `cards`, `buttons`, `inputs`)

---

### `designkit search <query>`

Search components by name or tag.

```bash
designkit search pricing
designkit search chart --kit web
designkit search button --kit app-mobile
```

Options:
- `-k, --kit` — Limit search to a specific kit

---

### `designkit add <id>`

Copy a component HTML file to your project.

```bash
designkit add web/cards/card-pricing --output src/components/
designkit add app-mobile/buttons/button-filled --output ./ui/
```

Options:
- `-o, --output` — Output directory (default: current directory)

---

### `designkit init`

Add DesignKit design tokens to your project.

```bash
designkit init --format css --output src/
designkit init --format ts --output src/
designkit init --format js --output src/
designkit init --format json --output src/
```

Options:
- `-f, --format` — Output format: `css`, `js`, `ts`, `json` (default: `css`)
- `-o, --output` — Output directory (default: current directory)

Output files: `tokens.css`, `tokens.js`, `tokens.ts`, or `tokens.json`

---

## `designkit studio`

Open DesignKit Studio — a local web UI for generating and previewing designs in real time.

```bash
designkit studio
designkit studio --platform web
designkit studio --provider gemini --port 4000
```

Starts a local server at `http://localhost:3333` and opens it in your browser automatically.

**UI layout:**
- **Left panel** — prompt input, platform/provider selectors, screen list, live generation log
- **Right panel** — `Code | Both | Preview` toggle

**Modes:**
| Mode | View |
|------|------|
| `Code` | Editable HTML source — edit live, preview updates instantly |
| `Preview` | Rendered iframe at correct device size (390×844 mobile / 1280×900 web) |
| `Both` | Side-by-side code + preview |

**Keyboard shortcut:** `Cmd+Enter` (or `Ctrl+Enter`) in the prompt field to generate.

Options:
- `-p, --provider` — AI provider: `anthropic`, `gemini`, `openai` (reads from `designkit config`)
- `--platform` — `mobile` or `web` (reads from `designkit config`)
- `--port` — Port to listen on (default: `3333`)

---

## `designkit config`

Get or set default values saved to `~/.designkit/config.json`.

```bash
# Show all config
designkit config

# Set default AI provider
designkit config set provider anthropic
designkit config set provider gemini
designkit config set provider openai

# Set default platform
designkit config set platform mobile
designkit config set platform web

# Read a single value
designkit config get provider
```

Config keys:

| Key | Values | Default |
|-----|--------|---------|
| `provider` | `anthropic`, `gemini`, `openai` | `anthropic` |
| `platform` | `mobile`, `web` | `mobile` |

Once set, all AI commands (`design`, `convert`, `autogen`) use the saved default — no need to pass `--provider` every time.

---

## AI Commands

All AI commands require an API key set as an environment variable.

| Provider | Key |
|----------|-----|
| Anthropic (default) | `ANTHROPIC_API_KEY` |
| Google Gemini | `GEMINI_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |

---

### `designkit design <prompt>`

Generate a UI component or full screen using AI.

```bash
# Generate HTML (default)
designkit design "dark pricing card with 3 tiers" -o pricing.html

# Generate in a specific framework
designkit design "bottom nav bar for mobile" --skill flutter -o bottom_nav.dart
designkit design "hero section with gradient CTA" --skill react -o Hero.jsx
designkit design "settings screen" --skill swiftui -o SettingsView.swift

# Use a different AI provider
designkit design "login form" --provider gemini -o login.html
designkit design "dashboard layout" --provider openai --skill nextjs -o Dashboard.jsx
```

Options:
- `-s, --skill` — Skill to use (default: `design`)
- `-p, --provider` — AI provider: `anthropic`, `gemini`, `openai` (default: `anthropic`)
- `-o, --output` — Save output to file (default: print to terminal)

Available skills:

| Skill | Output | Description |
|-------|--------|-------------|
| `design` | `.html` | Self-contained HTML with `--kit-*` tokens |
| `react` | `.jsx` | React functional component |
| `nextjs` | `.jsx` | Next.js component with app router patterns |
| `vue` | `.vue` | Vue 3 SFC `<script setup>` |
| `svelte` | `.svelte` | Svelte component |
| `tailwind` | `.html` | HTML with Tailwind CSS classes |
| `flutter` | `.dart` | Flutter Widget |
| `swiftui` | `.swift` | SwiftUI View |
| `react-native` | `.jsx` | React Native component with StyleSheet |

---

### `designkit convert <file>`

Convert an existing HTML component to any framework using AI.

```bash
# Convert to framework (auto-detects output extension)
designkit convert card-pricing.html --to react
designkit convert card-pricing.html --to vue
designkit convert card-pricing.html --to flutter
designkit convert card-pricing.html --to swiftui

# Save to specific file
designkit convert card-pricing.html --to nextjs -o src/components/PricingCard.jsx

# Use a different provider
designkit convert card-pricing.html --to react --provider gemini
```

Options:
- `--to` — Target framework (required): `react`, `nextjs`, `vue`, `svelte`, `tailwind`, `flutter`, `swiftui`, `react-native`
- `-p, --provider` — AI provider: `anthropic`, `gemini`, `openai` (default: `anthropic`)
- `-o, --output` — Output file (default: same filename, new extension)

---

### `designkit autogen <prompt>`

Generate a complete multi-screen design project with consistent tokens and a gallery index.

Uses a 2-phase pipeline:
- **Phase 1** — 1 AI call → `design-spec.json` (color tokens, typography, screen list)
- **Phase 2** — 1 AI call per screen → `.html` files with shared spec injected
- **Gallery** — auto-generated `index.html` with iframe previews of all screens

```bash
# Mobile app, auto screens
designkit autogen "Personal finance app" --platform mobile

# Web app, specific pages
designkit autogen "SaaS dashboard" --platform web \
  --screens "landing,dashboard,reports,settings,pricing" \
  --output output/saas

# With real images folder
designkit autogen "Travel app" --images ./assets/travel --output output/travel

# Use a different AI provider
designkit autogen "E-commerce store" --provider gemini
```

Options:
- `--platform` — `mobile` or `web` (default: `web`)
- `--screens` — Comma-separated screen names (default: AI decides based on prompt)
- `-p, --provider` — AI provider: `anthropic`, `gemini`, `openai` (default: `anthropic`)
- `--images` — Path to local image folder (used as `src` with `onerror` fallback to placehold.jp)
- `-o, --output` — Output directory (default: `output/<slug>`)

Output structure:
```
output/<project-name>/
├── design-spec.json   ← Phase 1: token system + screen plan
├── index.html         ← Gallery: iframe previews of all screens
├── home.html
├── dashboard.html
└── ...
```

---

### `designkit imagine <prompt>`

Generate images using Gemini Imagen 3 or DALL-E 3.

```bash
# Generate with Gemini Imagen 3 (default)
designkit imagine "minimalist SaaS dashboard UI screenshot"

# Specify aspect ratio and output
designkit imagine "mobile finance app onboarding screen" --aspect 9:16 -o ./assets -n onboarding

# Generate multiple images
designkit imagine "dark mode analytics dashboard" --count 4 -o ./assets

# Generate with DALL-E 3
designkit imagine "ecommerce product card UI" --provider openai --size 1792x1024 --quality hd -o ./assets
```

Options:
- `-p, --provider` — Image provider: `gemini`, `openai` (default: `gemini`)
- `-m, --model` — Gemini model (default: `gemini-2.5-flash`)
- `-o, --output` — Output directory (default: current directory)
- `-n, --name` — Output filename without extension (default: `image`)
- `-c, --count` — Number of images to generate, 1–4 (default: `1`)
- `--aspect` — Aspect ratio: `1:1`, `16:9`, `9:16`, `4:3`, `3:4` (default: `1:1`)
- `--size` — DALL-E size: `1024x1024`, `1792x1024`, `1024x1792` (default: `1024x1024`)
- `--quality` — DALL-E quality: `standard`, `hd` (default: `standard`)

Available Gemini models:

| Model | Notes |
|-------|-------|
| `gemini-2.5-flash-image` | Default — fast, good quality |
| `gemini-3.1-flash-image-preview` | Newer flash preview |
| `gemini-3-pro-image-preview` | Pro quality |
| `imagen-4.0-generate-001` | Imagen 4 — highest quality |
| `imagen-4.0-fast-generate-001` | Imagen 4 Fast |
| `imagen-4.0-ultra-generate-001` | Imagen 4 Ultra |

---

## Workflow Examples

**Design → Convert → Ship**
```bash
# 1. Generate HTML prototype
designkit design "SaaS pricing page with 3 tiers" -o pricing.html

# 2. Convert to your framework
designkit convert pricing.html --to nextjs -o src/app/pricing/page.jsx

# 3. Get design tokens
designkit init --format ts --output src/
```

**Browse → Copy → Use**
```bash
# Find the right component
designkit search chart

# Copy it to your project
designkit add web/charts/area-chart --output src/components/

# Generate matching tokens
designkit init --format css --output src/
```

**Generate a complete app design**
```bash
# Full mobile app — AI picks screens automatically
designkit autogen "Food delivery app, dark modern" --platform mobile --output output/food-app

# Full web app — specify exact pages
designkit autogen "SaaS analytics platform" --platform web \
  --screens "landing,dashboard,reports,settings,pricing,login" \
  --output output/analytics
```

**Generate app assets**
```bash
# Generate app screenshots / mockup images
designkit imagine "iOS finance app dashboard, clean minimal design" --aspect 9:16 --count 4 -o marketing/
```

---

## Environment Variables

```bash
export ANTHROPIC_API_KEY=sk-ant-...   # for --provider anthropic (default)
export GEMINI_API_KEY=...             # for --provider gemini
export OPENAI_API_KEY=sk-...          # for --provider openai
```
