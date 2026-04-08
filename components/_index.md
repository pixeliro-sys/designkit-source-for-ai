# Components Index

## Kits

| Kit | Path | Platform | Components | Description |
|-----|------|----------|-----------|-------------|
| **App Mobile** | `app-mobile/` | iOS + Android | 134 | Unified mobile kit. Platform differences documented in README |
| **Web** | `web/` | Desktop/Web | 126 | Responsive web/desktop components. Tailwind-inspired |
| **Common** | `common/` | Cross-kit | 38 | SVG illustrations, decorations, mockup elements, UI icons |

Removed separate `apple-ios/` and `android-md3/` — merged into `app-mobile/` with platform difference annotations in README.

## How Platform Targeting Works

Components are platform-neutral by default. To target iOS or Android:

- Read `app-mobile/README.md` → "Platform Differences" section
- Apply radius, typography, navigation rules for target platform
- Same HTML components, different style values via tokens

## Categories — App Mobile (134)

| Category | Count | Description |
|----------|-------|-------------|
| navbars | 8 | Top app bars, bottom nav, bottom app bar |
| buttons | 11 | Filled, tonal, outlined, text, icon, FAB, segmented |
| cards | 3 | Filled, outlined, elevated |
| inputs | 10 | Text fields, search, select, date/time picker, OTP, password, file upload |
| lists | 3 | 1-line, 2-line, 3-line items |
| chips | 4 | Assist, filter, input, suggestion |
| feedback | 6 | Snackbar, progress, skeleton, banner, tooltip |
| tabs | 2 | Primary, secondary |
| toggles | 3 | Switch, checkbox, radio |
| menus | 2 | Dropdown, context |
| dialogs | 2 | Basic, fullscreen |
| surfaces | 4 | Bottom sheet, side sheet, drawer, rail |
| sliders | 2 | Continuous, discrete |
| badges | 3 | Dot, count, overflow |
| dividers | 2 | Full-width, inset |
| native | 15 | iOS-specific (action-sheet, alert, nav-bar, tab-bar, etc.) + Android (status-bar, gesture-nav, notification, permission) |
| patterns | 47 | E-commerce, social, chat, productivity, auth, data, navigation, media, maps |
| charts | 7 | Bar, line, donut, progress ring, sparkline, stat card, horizontal bar |

## Categories — Web (126)

| Category | Count | Description |
|----------|-------|-------------|
| navbars | 6 | Top nav, sidebar, breadcrumb, footer |
| buttons | 6 | Primary, secondary, danger, ghost, icon, group |
| cards | 6 | Basic, feature, image, pricing, stat, testimonial |
| inputs | 10 | Text, textarea, select, search, date, file, tags, checkbox, radio, toggle |
| layout | 6 | Hero sections, features grid, pricing, stats, CTA banner |
| tables | 2 | Simple table, data table |
| modals | 2 | Basic, form |
| feedback | 8 | Alert, empty-state, loading, progress, skeleton, toasts, tooltip |
| tabs | 2 | Pills, underline |
| toggles | 3 | Switch, group, dark mode |
| charts | 3 | Area, bar, donut |
| badges | 1 | Badge set |
| menus | 1 | Dropdown menu |
| dividers | 1 | Divider with text |
| surfaces | 1 | Slide-over |
| data-display | 2 | Grid view, list view |
| heroes | 3 | Gradient, image background, video |
| cta | 3 | Centered, split with image, newsletter |
| features | 3 | Icon list, alternating rows, bento grid |
| pricing | 2 | Comparison table, monthly/annual toggle |
| social-proof | 2 | Logo cloud, testimonial carousel |
| logos | 2 | Logo grid, logo ticker |
| products | 4 | Product cards, detail, grid, reviews |
| cart | 3 | Cart page, checkout, order confirmation |
| promotions | 2 | Coupon card, promo banner |
| account | 3 | Profile, subscription, payment method |
| widgets | 8 | SaaS dashboard widgets (API keys, billing, changelog, etc.) |
| content | 2 | Author card, blog card |
| metrics | 1 | KPI row |
| screenshots | 2 | Browser frame, gallery |
| presentation | 2 | Slide title, slide content |
| print | 1 | Business card |
| social-media | 1 | Instagram post |
| patterns | 22 | Auth, chat, kanban, calendar, settings, comparison, etc. |
