# DEPRECATED — superseded by the Web Dark Mode Bundle

> ⚠️ **This standalone userscript is deprecated as of v2.0 of the bundle.**
>
> All sites previously covered by this repo (and 10 others) are now consolidated into a single auto-updating Tampermonkey userscript:
>
> **https://github.com/BarnsAWS/Web-Dark-Mode-Bundle**
>
> Direct install URL:
>
> `https://raw.githubusercontent.com/BarnsAWS/Web-Dark-Mode-Bundle/main/web_dark_mode_bundle.user.js`
>
> ## Migration
>
> 1. Open Tampermonkey dashboard.
> 2. **Disable or remove** this script (otherwise two scripts will fight on the same page).
> 3. Open the install URL above and click **Install**.
> 4. Tampermonkey will auto-update from `main` going forward.
>
> ## Why the bundle exists
>
> - One install, one auto-update across all covered sites.
> - Shared Cloudscape v3.3 engine — every site gets the same standard at the same time.
> - Adding a new site is a one-file change to `SITES` in the bundle.
>
> The original README/ABOUT and userscript are retained below this notice for archival / reference.
>
> ---

# Amazon.com Dark Mode TamperMonkey Script

A Tampermonkey/Violentmonkey userscript that applies an AWS Cloudscape-aligned dark theme to **all of `amazon.com`** — Business Prime, Punchout, consumer shopping, product detail pages, cart, checkout, orders, account, and the Business Prime sub-nav and stat cards.

> **Note:** This repository was originally scoped to Business Prime / Punchout pages only. As of `v1.4` the `@match` block has been broadened to cover the full `amazon.com` surface (and `business.amazon.com`). The repo name retains the original "Business Prime" wording so the GitHub raw install URL stays stable for existing users; the script itself styles every Amazon page.

## What This Repository Contains

- `amazon_business_prime_dark_mode.user.js` — the Tampermonkey userscript (v1.4, broadened scope).
- `STANDARDS.md` — the Cloudscape-aligned dark-mode standard the script implements.
- `SANITIZATION.md` — what was scrubbed before this repo was made public.
- `LICENSE` — MIT.
- `README.md`, `ABOUT.md`.

## Behavior Coverage

The script follows the **Cloudscape Dark Mode Standard v3.3** (see `STANDARDS.md`):

- Forces a Cloudscape "Polaris Dark Mode" palette across every Amazon page surface — top bar (logo + delivery selector + search + cart), the Business Prime sub-nav (when present), product detail pages, image galleries, "Buying multiple items?" basket, color/size selectors, the right-rail buy box ("Add to cart", "Request for Quote", price, prime badge, returns policy), department category browse, search results grid, cart and checkout flows, orders/returns, account settings.
- Preserves the full Cloudscape text hierarchy (emphasis → heading → body → muted → disabled).
- Applies semantic alert tints (red error, blue info, green success badge) and Amazon Orange to primary action buttons (Add to Cart, Buy Now, Continue, Place Your Order).
- Forces dark surfaces on dropdowns, popovers, modals, menus, listboxes, tooltips, the "Hover Zoom" image lens, and any framework `awsui_*` surfaces.
- Runs the v3.3 `enforceDarkSurfaces()` JS pass which detects light surfaces via *both* `background-color` and `background-image` (so framework gradients with white stops are stripped), and routes them by luminance bucket to `--bg-secondary` (`#1b232d`) or `--bg-tertiary` (`#232b37`).
- Includes the v3.3 sub-component coverage block so card-internal `header` / `[class*="title"]` / `[class*="body"]` / `[class*="content"]` / `[class*="footer"]` drop to transparent and inherit the parent card's surface (covers Amazon's stat cards, info banners, "Organization preferred" green-tinted preference banner, the buy box, and product detail panels).
- Attaches the v3.3 tight-loop `MutationObserver` on `style` attribute mutations, batched via `requestAnimationFrame`, so framework writes during interaction (focus, blur, hover, async cart updates, lazy-loaded carousel pages, color-swatch selection) get corrected within ~16 ms.
- Includes the v3.1 inline-control rule so the search input, address pickers, quantity steppers, and any address-book/payment selects render as inset wells with a `#656871` border (passes WCAG 1.4.11).
- Includes the v3.2 generalized in-content selected rule so the active sub-nav tab, the selected color/size swatch, and selected list-item filters get appropriate emphasis surfaces.
- Pierces open shadow roots and re-applies the same stylesheet.
- Observes DOM mutations with a 250 ms main observer (`class` / `aria-*` / `data-*`) and a tight rAF observer (`style` only); runs delayed safety passes at 500 / 1500 / 3000 ms after `load`.
- **Hands off product images, video previews, and SVG icons** so product photography renders correctly. Star-rating SVGs, prime checkmarks, and brand logos keep their original colors.

## Match Scope

`v1.4+` activates on:

- `https://www.amazon.com/*`
- `https://amazon.com/*`
- `https://smile.amazon.com/*`
- `https://business.amazon.com/*`
- `https://www.amazon.com/ref=nodl_punchout*` (canonical Business Prime Punchout entry)
- `https://www.amazon.com/ap/*` (sign-in flow)

If you only want it on Business Prime pages and not consumer Amazon, edit the `@match` block at the top of the userscript and revert to the v1.3 path-gated patterns (`/*business*` / `/*punchout*` / `/*b2b*`).

## Install on Chrome

1. Install Tampermonkey: <https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo>
2. Open the Tampermonkey dashboard and confirm it is enabled.
3. Open the raw userscript URL and let Tampermonkey prompt for install:
   `https://raw.githubusercontent.com/BarnsAWS/Amazon-Business-Prime-Dark-Mode-TamperMonkey-Script/main/amazon_business_prime_dark_mode.user.js`
4. Click **Install**.
5. Visit any Amazon page and refresh once.

## Install on Firefox

1. Install Tampermonkey: <https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/>
2. Open the Tampermonkey dashboard.
3. Open the raw userscript URL above and click **Install**.
4. Visit any Amazon page and refresh once.

## Verification Checklist

- [ ] Page body and main content render on `#161d26`.
- [ ] Top bar (logo + delivery address chip + search + cart icon + account dropdown) renders dark with `#424650` bottom border.
- [ ] Business Prime sub-nav (when present): All / alexa for shopping / Business Essentials / etc. renders readable; the active item uses the Cloudscape underline.
- [ ] Search input is an inset `#0a0f15` well with a `#656871` border.
- [ ] Product detail page: title, price, "Custom Price ↓", "List Price" strikethrough, "You Save" red callout, "FREE delivery" copy, "In Stock" green text — all readable.
- [ ] Buy box (right rail, "Add to cart" yellow, "Request for Quote" white, "Secure transaction") renders on `#1b232d` with `#424650` border.
- [ ] "Add to cart" stays Amazon Yellow `#ffd814` per Amazon brand (the v3.3 stylesheet preserves yellow CTA colors).
- [ ] "Organization preferred" green-tinted banner renders with semantic-success tint and readable body text.
- [ ] Color swatches, size dropdowns, and "See available options" remain visually distinct.
- [ ] No card sub-component renders with a light surface.
- [ ] No element renders with a `background-image: linear-gradient(white, ...)`.
- [ ] No bright white flash on initial load.
- [ ] Star ratings keep their original gold `#ffa41c` color.

## Troubleshooting

- **Bright sections after load** — hard refresh (Ctrl+F5) and confirm Tampermonkey is enabled for the page.
- **A specific component still flashes white briefly** — the tight-loop `style` observer should correct within ~16 ms. If it persists, the framework may be writing `style.background` on a parent that the observer hasn't seen yet. Open DevTools, find the offending element's class, and add it to the sub-component coverage block in the script.
- **Embedded iframe still light** — Tampermonkey does not inject into cross-origin iframes by default. Some Amazon checkout / payment iframes are out of scope.
- **Want to revert to Business-Prime-only scope** — edit the `@match` block and change to the path-gated v1.3 patterns (`/*business*`, `/*punchout*`, `/*b2b*`).

## Source References

- `STANDARDS.md` (in this repo) — the Cloudscape-aligned dark-mode standard.
- `SANITIZATION.md` (in this repo) — sanitization log.
- AWS Cloudscape Design System: <https://cloudscape.design>

## License

MIT (see `LICENSE`).
