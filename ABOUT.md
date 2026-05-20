# About This Repository

## Purpose

This repository delivers a Tampermonkey userscript that re-themes **all of `amazon.com`** (Business Prime, Punchout, consumer shopping, product detail, cart, checkout, orders, account) using the AWS Cloudscape "Polaris Dark Mode" token palette.

The repo name still says "Business Prime" because that's what it was originally scoped for; as of v1.4 the `@match` was broadened to cover the entire amazon.com surface. The original install URL stays stable so existing users get the broader coverage as an automatic Tampermonkey update.

## Design Principles

- **Cloudscape palette as ground truth.** Surfaces, text tiers, links, borders, focus rings, and primary actions all use Cloudscape v3.3 tokens (`#161d26` body, `#1b232d` cards, `#0a0f15` inset controls, `#42b4ff` link/accent, `#ff9900` primary CTA). No hand-picked hex values. See `STANDARDS.md`.
- **Two-layer architecture.** CSS injected at `document-start` for an immediate dark paint; JS surface-enforcement passes as the safety net for inline styles, runtime injections, framework gradients, and shadow roots.
- **Hands off media + brand color.** Product images, video, canvas, picture, and SVG content (star ratings, prime checkmarks, brand logos) are excluded from color overrides. The buy-box "Add to cart" and "Buy now" yellow CTAs keep Amazon's original brand color.
- **Hands off the cascade.** No `filter: invert(1)`. Brand colors, semantic alerts, the green "Organization preferred" preference banner, and red sale callouts are preserved.
- **Site-wide match.** Activates on `www.amazon.com`, bare `amazon.com`, `smile.amazon.com`, `business.amazon.com`, and the Punchout / sign-in entry paths. If you want it gated to Business pages only, edit the `@match` block.

## Script Architecture

`amazon_business_prime_dark_mode.user.js` runs in seven phases:

1. **Framework hook.** Sets `color-scheme: dark`, `data-color-scheme=dark` on `<html>`, plus the `awsui-polaris-dark-mode` body class (harmless on non-Cloudscape hosts; lets shared rules cascade).
2. **CSS injection at `document-start`.** A single stylesheet covers nuclear text, transparent cascade, headings, links, inputs, buttons, primary CTAs, cards/widgets/containers, the v3.3 sub-component block, tables with zebra striping including `[role="row"]` / `[role="listitem"]`, modals/menus/dropdowns/popovers, the navigation, the top bar, banners, tabs, listbox options, in-content selected rows, sidebar selected rows, badges/pills/chips, breadcrumbs, progress bars, scrollbars, and inline-style overrides including v3.3 gradient-killers.
3. **JS `enforceDarkSurfaces()` pass.** Walks every non-media, non-input element, calls `isLightSurface()` (which scans both `backgroundColor` and `backgroundImage`), strips light gradients, and routes by luminance bucket to `--bg-secondary` (>140) or `--bg-tertiary` (≤140). Excludes all SVG descendants so star ratings and brand glyphs keep their colors.
4. **Top-bar detection.** Selector- and position-based.
5. **Inline control + selected row passes.** v3.1 + v3.2 — re-assert inset surfaces.
6. **Tight-loop style observer.** v3.3 — flushed in one rAF frame.
7. **Main mutation observer + load-time safety net.** 250 ms debounce on `class` / `aria-*` / `data-*`; explicit re-runs at 500 / 1500 / 3000 ms after `load`. Open shadow roots receive the same stylesheet appended and `enforceDarkSurfaces()` runs inside them.

## Why This Repository Exists

Amazon's main consumer site, Business Prime, and Punchout flows all run on the same UI framework with mostly-shared components. The default light theme is jarring against a dark workflow at night. This script delivers a single, predictable, Cloudscape-aligned dark experience across the full amazon.com surface while preserving every brand-critical color (Amazon Orange CTA, Amazon Yellow buy-box, prime blue, star-rating gold, semantic green/red).

## Maintenance Notes

- Keep `amazon_business_prime_dark_mode.user.js` at the repository root so the GitHub raw URL is the canonical Tampermonkey install link.
- Cloudscape tokens are the source of truth. If Cloudscape revises the dark palette, update the constants block at the top of the userscript and the surface table in `STANDARDS.md`.
- Validate after any Amazon retail / Business UI redesign.
- The `@match` is intentionally broad. If a future change conflicts with Amazon retail expectations (e.g., brand-required photo backgrounds), tighten the patterns or add specific exclusion rules.

## Source References

- `STANDARDS.md` — the Cloudscape-aligned dark-mode standard this script implements.
- `SANITIZATION.md` — sanitization log for this repository.
- AWS Cloudscape Design System: <https://cloudscape.design>

## License

MIT (see `LICENSE`).
