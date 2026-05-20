# Amazon Business Prime Dark Mode TamperMonkey Script

A Tampermonkey/Violentmonkey userscript that applies an AWS Cloudscape-aligned dark theme to Amazon Business / Business Prime / Punchout pages on `amazon.com` and `business.amazon.com`.

## What This Repository Contains

- `amazon_business_prime_dark_mode.user.js` — the Tampermonkey userscript.
- `STANDARDS.md` — the Cloudscape-aligned dark-mode standard the script implements.
- `SANITIZATION.md` — what was scrubbed before this repo was made public.
- `LICENSE` — MIT.
- `README.md`, `ABOUT.md`.

## Behavior Coverage

The script follows the **Cloudscape Dark Mode Standard v3.3** (see `STANDARDS.md`):

- Forces a Cloudscape "Polaris Dark Mode" palette on Business Prime / Punchout / B2B page surfaces — page shell, top bar (logo + delivery selector + business search), the Business Prime sub-nav, hero carousels, "Business Essentials" / "Summary" / "Your business savings" / "Shop small and local" / "Buy it again" cards, the "Explore departments" tile grid, and product detail pages.
- Preserves the full Cloudscape text hierarchy (emphasis → heading → body → muted → disabled).
- Applies semantic alert tints (red error, blue info, green success) and Amazon Orange to primary action buttons.
- Forces dark surfaces on dropdowns, popovers, modals, menus, listboxes, tooltips, and any framework `awsui_*` surfaces.
- Runs the v3.3 `enforceDarkSurfaces()` JS pass which detects light surfaces via *both* `background-color` and `background-image` (so framework gradients with white stops are stripped), and routes them by luminance bucket to `--bg-secondary` (`#1b232d`) or `--bg-tertiary` (`#232b37`).
- Includes the v3.3 sub-component coverage block so card-internal `header` / `[class*="title"]` / `[class*="body"]` / `[class*="content"]` / `[class*="footer"]` drop to transparent and inherit the parent card's `--bg-secondary` surface.
- Attaches the v3.3 tight-loop `MutationObserver` on `style` attribute mutations, batched via `requestAnimationFrame`, so framework writes during interaction (focus, blur, hover, async cart updates, lazy-loaded carousel pages) get corrected within ~16 ms.
- Includes the v3.1 inline-control rule so the search input, address pickers, quantity steppers, and any address-book/payment selects render as inset wells with a `#656871` border (passes WCAG 1.4.11).
- Includes the v3.2 generalized in-content selected rule so the active sub-nav tab and selected list-item filters get appropriate emphasis surfaces.
- Pierces open shadow roots and re-applies the same stylesheet.
- Observes DOM mutations with a 250 ms main observer (`class` / `aria-*` / `data-*`) and a tight rAF observer (`style` only); runs delayed safety passes at 500 / 1500 / 3000 ms after `load`.

## Match Scope

This script intentionally **does NOT** activate on the consumer Amazon shopping site. It's gated to:

- `https://www.amazon.com/*business*` / `*punchout*` / `*b2b*` URL paths
- `https://www.amazon.com/ref=nodl_punchout*` (the canonical Business Prime Punchout entry)
- `https://www.amazon.com/ap/*business*` (Business sign-in flow)
- `https://business.amazon.com/*` (Business-account portal)
- URL-pattern includes for "Business" / "?*=Business*"

If you want it active on the consumer site too, edit the `@match` block at the top of the userscript.

## Install on Chrome

1. Install Tampermonkey: <https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo>
2. Open the Tampermonkey dashboard and confirm it is enabled.
3. Open the raw userscript URL and let Tampermonkey prompt for install:
   `https://raw.githubusercontent.com/BarnsAWS/Amazon-Business-Prime-Dark-Mode-TamperMonkey-Script/main/amazon_business_prime_dark_mode.user.js`
4. Click **Install**.
5. Visit a Business Prime page and refresh once.

## Install on Firefox

1. Install Tampermonkey: <https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/>
2. Open the Tampermonkey dashboard.
3. Open the raw userscript URL above and click **Install**.
4. Visit a Business Prime page and refresh once.

## Verification Checklist

- [ ] Page body and main content render on `#161d26`.
- [ ] Top bar (Business Prime logo + delivery address chip + search) renders dark with `#424650` bottom border.
- [ ] The Business Prime sub-nav (All, alexa for shopping, Business Essentials, Memorial Day Sale, Small and Local Businesses, Buy Again, Your Catalog, Today's Deals, Subscribe & Save, Business Savings, Recommendations, Savings For You, Lists, Business Prime) renders readable on dark; the active tab uses the Cloudscape underline.
- [ ] Stat cards (Business Essentials / Summary / Your business savings / Shop small and local / Buy it again) render on `#1b232d` with `#424650` borders.
- [ ] Internal sub-components of those cards (titles, bodies, dollar figures, dates) all read on dark — no white strips.
- [ ] "Explore departments" tile grid renders dark with bright tile labels.
- [ ] Search input renders as an inset `#0a0f15` well with a `#656871` border.
- [ ] Primary CTAs (Add to Cart, Continue Checkout, Discover more savings) render in Amazon Orange `#ff9900` with dark text.
- [ ] Links are `#42b4ff` and lighten to `#89cbff` on hover.
- [ ] No card sub-component renders with a light surface.
- [ ] No element renders with a `background-image: linear-gradient(white, ...)`.
- [ ] No bright white flash on initial load.

## Troubleshooting

- **Bright sections after load** — hard refresh (Ctrl+F5) and confirm Tampermonkey is enabled for the page. Note that the `@match` is intentionally narrow — if Business Prime adds new path segments, they may need a new `@match` line.
- **Script also activates on consumer pages** — the `@match` patterns include "business" / "punchout" / "b2b" path tokens. If your account opens consumer URLs that contain those strings, the script will activate. Tighten the `@match` if needed.
- **Embedded iframe still light** — Tampermonkey does not inject into cross-origin iframes by default. If a Business Prime page embeds widgets from a different domain, they're out of scope.

## Source References

- `STANDARDS.md` (in this repo) — the Cloudscape-aligned dark-mode standard.
- `SANITIZATION.md` (in this repo) — sanitization log.
- AWS Cloudscape Design System: <https://cloudscape.design>

## License

MIT (see `LICENSE`).
