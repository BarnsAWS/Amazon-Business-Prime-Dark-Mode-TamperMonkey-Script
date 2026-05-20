# About This Repository

## Purpose

This repository delivers a Tampermonkey userscript that re-themes Amazon Business / Business Prime / Punchout pages on `amazon.com` and `business.amazon.com` using the AWS Cloudscape "Polaris Dark Mode" token palette.

## Design Principles

- **Cloudscape palette as ground truth.** Surfaces, text tiers, links, borders, focus rings, and primary actions all use Cloudscape v3.3 tokens (`#161d26` body, `#1b232d` cards, `#0a0f15` inset controls, `#42b4ff` link/accent, `#ff9900` primary CTA). No hand-picked hex values. See `STANDARDS.md`.
- **Two-layer architecture.** CSS injected at `document-start` for an immediate dark paint; JS surface-enforcement passes as the safety net for inline styles, runtime injections, framework gradients, and shadow roots.
- **Narrow match scope.** The script is gated to Business / Punchout / B2B URL paths and the dedicated `business.amazon.com` subdomain. Consumer Amazon shopping pages are intentionally excluded.
- **Hands off media + chart content.** Images, video, canvas, picture, and SVG content are excluded from color overrides — Business Prime stat cards rely on inline SVG icons that need their original fills.
- **Hands off the cascade.** No `filter: invert(1)`. Brand colors (Amazon Orange CTA, Business Prime blue accents, semantic alerts) are preserved.

## Script Architecture

`amazon_business_prime_dark_mode.user.js` runs in seven phases:

1. **Framework hook.** Sets `color-scheme: dark`, `data-color-scheme=dark` on `<html>`, plus the `awsui-polaris-dark-mode` body class (harmless on non-Cloudscape hosts; lets shared rules cascade if Cloudscape components are present).
2. **CSS injection at `document-start`.** A single stylesheet covers nuclear text, transparent cascade, headings, links, inputs, buttons, primary CTAs, cards/widgets/containers, the v3.3 sub-component block, tables with zebra striping including `[role="row"]` / `[role="listitem"]`, modals/menus/dropdowns/popovers, the navigation, the top bar, banners, tabs, listbox options, in-content selected rows, sidebar selected rows, badges/pills/chips, breadcrumbs, progress bars, scrollbars, and inline-style overrides including v3.3 gradient-killers.
3. **JS `enforceDarkSurfaces()` pass.** Walks every non-media, non-input element, calls `isLightSurface()` (which scans both `backgroundColor` and `backgroundImage`), strips light gradients, and routes by luminance bucket.
4. **Top-bar detection.** Selector- and position-based.
5. **Inline control + selected row passes.** v3.1 + v3.2 — re-assert inset surfaces.
6. **Tight-loop style observer.** v3.3 — flushed in one rAF frame.
7. **Main mutation observer + load-time safety net.** 250 ms debounce on `class` / `aria-*` / `data-*`; explicit re-runs at 500 / 1500 / 3000 ms after `load`. Open shadow roots receive the same stylesheet appended and `enforceDarkSurfaces()` runs inside them.

## Why This Repository Exists

Amazon Business Prime / Punchout pages share most of the consumer Amazon UI but with a B2B sub-nav, business stat cards (running totals, recent orders, subscribe-and-save savings), and procurement integration banners. The default light theme is jarring against a dark workflow. This script delivers a single, predictable, Cloudscape-aligned dark experience scoped tightly to Business pages so consumer browsing is unaffected.

## Maintenance Notes

- Keep `amazon_business_prime_dark_mode.user.js` at the repository root so the GitHub raw URL is the canonical Tampermonkey install link.
- Cloudscape tokens are the source of truth. If Cloudscape revises the dark palette, update the constants block at the top of the userscript and the surface table in `STANDARDS.md`.
- Validate after any Amazon Business UI redesign — Amazon revs the Business Prime sub-nav and stat-card layouts periodically.
- Keep the `@match` block narrow. Broadening it to all of `amazon.com` will theme the consumer site, which most users do not want.

## Source References

- `STANDARDS.md` — the Cloudscape-aligned dark-mode standard this script implements.
- `SANITIZATION.md` — sanitization log for this repository.
- AWS Cloudscape Design System: <https://cloudscape.design>

## License

MIT (see `LICENSE`).
