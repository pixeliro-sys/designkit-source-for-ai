# Web Tailwind UI Kit

**126 components** across 34 categories. Responsive desktop/web design system.

All components use `var(--kit-*)` tokens. Dark mode via token overrides — no separate component files.

---

## Design Principles

- Clean, minimal, lots of white space
- 8px grid, Inter font (system-ui fallback)
- Responsive: all components use `width:100%`, flex-wrap, min-width for reflow
- Rounded corners: 6-8px buttons, 12-16px cards, 24px modals
- Subtle shadows, 1px borders for structure
- Dark mode via token overrides (no separate components)

## Responsive Patterns

- All components: `width:100%` — parent controls size
- Grid: `display:flex;flex-wrap:wrap;gap:16px` + `flex:1 1 280px;min-width:0`
- Sidebar: `width:240px` on desktop, collapses to icons or off-screen on mobile
- Tables: horizontal scroll wrapper on mobile
- Typography: use relative sizes via tokens, not fixed px

## Breakpoints (reference)

| Name | Width | Layout |
|------|-------|--------|
| Mobile | <768px | Single column, bottom nav |
| Tablet | 768-1024px | 2-col, collapsible sidebar |
| Desktop | 1024-1440px | Sidebar + content |
| Wide | >1440px | Centered max-width container |

---

## Component Inventory (126 total)

| Category | Count | Components |
|----------|-------|------------|
| navbars | 6 | topnav, topnav-search, sidebar, sidebar-dark, breadcrumb, footer |
| buttons | 6 | primary, secondary, danger, ghost, icon, group |
| cards | 6 | basic, feature, image, pricing, stat, testimonial |
| inputs | 10 | text-input, textarea, select, search-command, date-input, file-upload, tag-input, checkbox, radio-group, toggle |
| layout | 6 | hero-centered, hero-split, features-grid, pricing-section, stats-row, cta-banner |
| tables | 2 | table-simple, data-table |
| modals | 2 | modal-basic, modal-form |
| feedback | 8 | alert-banner, empty-state, loading-spinner, progress-bar, skeleton, toast-success, toast-error, tooltip |
| tabs | 2 | tabs-pills, tabs-underline |
| toggles | 3 | toggle-switch, toggle-group, toggle-dark-mode |
| charts | 3 | chart-area, chart-bar, chart-donut |
| badges | 1 | badge-set |
| menus | 1 | dropdown-menu |
| dividers | 1 | divider-text |
| surfaces | 1 | slide-over |
| data-display | 2 | grid-view, list-view |
| heroes | 3 | hero-gradient, hero-image-bg, hero-video |
| cta | 3 | cta-centered, cta-with-image, cta-newsletter |
| features | 3 | features-icon-list, features-alternating, features-bento |
| pricing | 2 | pricing-table, pricing-toggle |
| social-proof | 2 | logo-cloud, testimonial-carousel |
| logos | 2 | logo-grid, logo-ticker |
| products | 4 | product-card-horizontal, product-detail, product-grid, review-section |
| cart | 3 | cart-page, checkout-form, order-confirmation |
| promotions | 2 | coupon-card, promo-banner |
| account | 3 | profile-card, subscription-card, payment-method |
| widgets | 8 | api-key-row, billing-card, changelog-item, integration-card, onboarding-checklist, pricing-toggle, team-member-row, usage-meter |
| content | 2 | author-card, blog-card-horizontal |
| metrics | 1 | kpi-row |
| screenshots | 2 | app-screenshot, screenshot-gallery |
| presentation | 2 | slide-title, slide-content |
| print | 1 | business-card |
| social-media | 1 | instagram-post |
| patterns | 22 | accordion, activity-feed, auth-login, avatar-group, calendar-month, category-pills, chat-web, code-editor, comparison-table, cookie-banner, error-page, file-list, filter-toolbar, kanban-column, notification-list, order-tracker, pagination, product-card-web, settings-form, stepper, user-table-row, video-player |

---

## Category Descriptions

| Category | Purpose |
|----------|---------|
| navbars | Top navigation, sidebar, breadcrumb, footer |
| buttons | Action buttons (primary, secondary, danger, ghost, icon, group) |
| cards | Content containers (basic, feature, pricing, stat, testimonial) |
| inputs | Form controls (text, select, date, file, tags, checkbox, radio) |
| layout | Full-width page sections (hero, features, pricing, stats, CTA) |
| tables | Data tables (simple, sortable/filterable) |
| modals | Overlay dialogs (basic, form) |
| feedback | Status indicators (alerts, toasts, loading, skeleton, progress) |
| tabs | Tab navigation (pills, underline) |
| toggles | Toggle controls (switch, group, dark mode) |
| charts | Data visualization (area, bar, donut) |
| heroes | Landing page hero sections (gradient, image, video) |
| cta | Call-to-action blocks (centered, split, newsletter) |
| features | Feature showcase sections (icon list, alternating, bento grid) |
| pricing | Pricing displays (comparison table, toggle monthly/annual) |
| social-proof | Trust indicators (logo cloud, testimonial carousel) |
| logos | Logo displays (grid, ticker) |
| products | E-commerce product displays (cards, detail, grid, reviews) |
| cart | Shopping cart flow (cart page, checkout, order confirmation) |
| promotions | Marketing elements (coupons, banners) |
| account | User account pages (profile, subscription, payment) |
| widgets | SaaS dashboard widgets (API keys, billing, changelog, integrations) |
| content | Blog/content elements (author card, blog card) |
| metrics | KPI and metric displays |
| screenshots | App screenshot showcases (browser frame, gallery) |
| presentation | Slide deck elements (title, content) |
| print | Print-ready elements (business card) |
| social-media | Social media components (Instagram post) |
| patterns | Complex UI patterns (auth, chat, kanban, calendar, settings, etc.) |
