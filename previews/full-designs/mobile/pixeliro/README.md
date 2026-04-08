# Pixeliro Mobile App — Full Design Spec

> Designed by [pixeliro.com](https://pixeliro.com)

## Overview
Pixeliro is a design platform for **design tokens, color brand systems, and UI specs** — all driven by chat commands.

The mobile app is the primary interface: users type slash commands to generate palettes, brand systems, token sets, and component previews — without touching a traditional design tool.

Hybrid architecture: WebView shell + native IAP/camera/push.

## File Structure

```
pixeliro/
├── index.html          ← Design spec index (thumbnail grid of all screens)
├── README.md
└── pages/
    ├── splash.html
    ├── onboarding.html
    ├── login.html
    ├── chat.html
    ├── commands.html
    ├── palette-result.html
    ├── brand-result.html
    ├── token-preview.html
    ├── workspace.html
    ├── editor.html
    ├── settings.html
    └── upgrade.html
```

## Screens (12 pages)

| # | Screen | File | Description |
|---|--------|------|-------------|
| 1 | Splash | pages/splash.html | Brand splash with logo + tagline |
| 2 | Onboarding | pages/onboarding.html | 3-step feature intro with illustrations |
| 3 | Login | pages/login.html | Google OAuth + email/password |
| 4 | Chat (Home) | pages/chat.html | Main screen — chat input + command results |
| 5 | Command Picker | pages/commands.html | Slash command grid with categories |
| 6 | Color Palette Result | pages/palette-result.html | Generated palette with swatches + actions |
| 7 | Brand System Result | pages/brand-result.html | Full brand system with roles + CSS export |
| 8 | Token Preview | pages/token-preview.html | Live preview with component thumbnails |
| 9 | My Workspace | pages/workspace.html | Saved palettes, tokens, designs list |
| 10 | Design Editor (mini) | pages/editor.html | Simplified canvas with layers |
| 11 | Settings | pages/settings.html | Account, plan, theme, security |
| 12 | Upgrade Pro | pages/upgrade.html | In-app purchase screen (native IAP trigger) |

## Navigation
- Bottom tab bar: Chat | Workspace | Settings
- Chat is the primary screen (like ChatGPT app)
- Commands open as bottom sheet overlays
- Results render inline in chat feed

## Design Tokens
- Uses standard Kit zone tokens (`--kit-primary`, `--kit-bg`, etc.)
- Primary: `#6366F1` (Indigo)
- Dark mode ready via token swap

## Platform Specs
| Property | Value |
|----------|-------|
| Target width | 430px (iPhone 16 Pro Max logical width) |
| Status bar | 54px |
| Bottom nav | 83px (with safe area) |
| Content area | auto-height, scroll |
| Architecture | WebView shell + native IAP/camera/push |
