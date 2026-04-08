# App Mobile UI Kit

**134 components** across 18 categories. Unified kit for both iOS and Android.

All components use `var(--kit-*)` tokens. Platform-specific differences are handled via metadata comments and minor style variations — not separate file sets.

---

## Platform Differences (iOS vs Android)

AI and designers should apply these rules based on target platform:

### Shape & Radius

| Element | iOS | Android (MD3) |
|---------|-----|---------------|
| Cards | 12-16px radius | 12-16px radius |
| Buttons | 8-12px (rect) or full-round | 20px (full-round pill) |
| FAB | full-round (circle) | 16px (rounded square) |
| Bottom sheet | 12px top corners | 28px top corners |
| Dialog | 14px | 28px |
| Chips | full-round | 8px |
| Input fields | 8-10px | 4px (outlined) or 0 top (filled) |
| Nav bar | 0 (flat edge) | 0 (flat edge) |

### Typography

| Element | iOS (SF Pro) | Android (Roboto) |
|---------|-------------|-----------------|
| Large title | 34px bold | 30px regular |
| Title | 17px semibold | 20px regular |
| Body | 17px regular | 16px regular |
| Caption | 12px regular | 12px regular |
| Font family | -apple-system, SF Pro | Roboto, system-ui |
| Font weight style | Uses semibold (600) heavily | Uses regular (400) + medium (500) |

### Navigation

| Pattern | iOS | Android |
|---------|-----|---------|
| Primary nav | Tab bar (bottom, 49px + safe area) | Bottom nav (80px) with pill indicator |
| Back | `< Back` text + chevron (left) | `←` arrow icon |
| Title | Large title collapses on scroll | Small/Medium/Large app bar |
| Tab indicator | None (icon fills/colors) | Pill shape behind active icon |
| Drawer | Rare (use tabs instead) | Common (hamburger → drawer) |
| Gesture nav | Home indicator (134x5px) | Home indicator (same) |

### Status Bar

| | iOS | Android |
|--|-----|---------|
| Height | 44px (notch), 20px (no notch) | 24px |
| Style | Time left, icons right | Time left, icons right |
| Dynamic Island | iPhone 14+ (centered notch) | No equivalent |

### Specific Component Differences

| Component | iOS Style | Android Style |
|-----------|----------|---------------|
| Switch | Green track when on, round thumb | Primary color track, round thumb |
| Alert/Dialog | Rounded rect, stacked buttons | 28px radius, inline buttons |
| Action sheet | Bottom sheet with cancel button | Bottom sheet with drag handle |
| Search | Rounded rect in nav area | Full-round pill, prominent |
| Segmented | Sliding background pill | Outlined with border segments |
| List separator | Left-inset line | Full-width or inset |
| Selection | Checkmark right side | Checkbox left side |
| Date picker | Spinning wheel | Calendar grid |

### Spacing

| | iOS | Android |
|--|-----|---------|
| Horizontal padding | 16px | 16px |
| Section gap | 24-32px | 16-24px |
| List item height | 44px (compact), 60px (subtitle) | 56px (1-line), 72px (2-line) |
| Touch target | 44x44px min | 48x48px min |
| Tab bar | 49px + 34px safe area = 83px | 80px |

---

## How to Use

Components are **platform-neutral by default** (work for both).

To style for a specific platform, the AI should:

1. **iOS:** Use `-apple-system` font, 600 weight for titles, smaller radii on buttons (8-12px), checkmark for selection, `< Back` text nav
2. **Android:** Use `system-ui` font, 400-500 weight, 20px pill buttons, pill indicator on nav, hamburger menu, 28px dialog radius

Example — the same `bottom-nav-5.html` works for both:
- **iOS mode:** Remove pill indicator, use filled/outline icon swap, add 34px safe area
- **Android mode:** Keep pill indicator, 80px height, as-is

---

## Component Inventory (134 total)

| Category | Count | Components |
|----------|-------|------------|
| navbars | 8 | top-app-bar (center/small/medium/large), bottom-nav (3/4/5), bottom-app-bar |
| buttons | 11 | filled, tonal, outlined, text, icon, icon-filled, icon-tonal, fab, fab-small, fab-extended, segmented |
| cards | 3 | filled, outlined, elevated |
| inputs | 10 | text-field (outlined/filled), search-bar, select, textarea, date-picker, time-picker, otp-input, password-field, file-upload |
| lists | 3 | 1-line, 2-line, 3-line |
| chips | 4 | assist, filter, input, suggestion |
| feedback | 6 | snackbar, progress-linear, progress-circular, skeleton, banner, tooltip |
| tabs | 2 | primary, secondary |
| toggles | 3 | switch, checkbox, radio |
| menus | 2 | dropdown, context |
| dialogs | 2 | basic, fullscreen |
| surfaces | 4 | bottom-sheet, side-sheet, nav-drawer, nav-rail |
| sliders | 2 | continuous, discrete |
| badges | 3 | dot, count, large (99+) |
| dividers | 2 | full-width, inset |
| native | 15 | status-bar, gesture-nav-bar, notification-item, permission-dialog, ios-action-sheet, ios-alert, ios-home-indicator, ios-list-cell, ios-nav-bar, ios-page-sheet, ios-search-bar, ios-segmented-control, ios-status-bar, ios-tab-bar, ios-wheel-picker |
| patterns | 47 | accordion, activity-feed, audio-waveform, avatar-group, breadcrumb, calendar-month, camera-viewfinder, card-horizontal, cart-item, category-pills, chat-bubble-received, chat-bubble-sent, chat-conversation, chat-input-bar, code-editor, comment-item, contact-card, data-table, empty-state, error-screen, event-card, image-editor, image-grid, login-form, map-card, media-player, notification-list, onboarding-slide, order-summary, order-tracker, pagination, post-card, product-card, profile-header, rating-stars, review-card, search-results, settings-group, stepper-horizontal, story-circle, swipe-action, tag-pills, timeline-item, todo-item, video-editor-timeline, video-player, wallet-card |
| charts | 7 | bar, line, donut, progress-ring, sparkline, stat-card, horizontal-bar |
