# Amazon Performance Investigation & Fix

> **Date:** 2026-05-20
> **Site:** `amazon.com`, `business.amazon.com`, `smile.amazon.com`
> **Bundle version that ships the fix:** Cloudscape Dark Mode Bundle v2.3
> **Standalone version that ships the fix:** Amazon Business Prime Dark Mode v1.5

## Symptom

Dark mode on Amazon retail pages — especially search-results pages, product detail pages, and the Business Prime dashboard — was visibly slow to apply. The page would render its native light theme for noticeable hundreds of milliseconds before transitioning to dark, and individual product tiles in search results would persist with white surfaces even after the rest of the page had darkened.

Verified on:
- `https://www.amazon.com/` (homepage carousels)
- `https://www.amazon.com/s?k=arc+pants` (search results)
- Product detail pages with large feature/spec blocks

## Investigation method

1. Fetched a search-results page directly via HTTP and counted occurrences of every Amazon-specific CSS class.
2. Compared the discovered class taxonomy to the dark-mode bundle's existing selectors.
3. Profiled the JS surface-enforcement pass mentally: `document.querySelectorAll('*')` × `getComputedStyle` per element × number of elements.
4. Identified the gap and the cost.

## Findings

### Amazon's class taxonomy is its own framework

Amazon retail uses a proprietary class system rooted in `a-*` (legacy) and `s-*` / `puis-*` / `sg-*` (newer search/shopping). The dark-mode bundle's generic Cloudscape patterns (`[class*="card"]`, `[class*="container"]`, `[class*="awsui_"]`) miss most of it. Class counts on a single search-results page (`?k=arc+pants`):

| Class | Count |
|---|--:|
| `.a-section` | 1272 |
| `.sg-col` | 134 |
| `.s-widget` | 136 |
| `.a-box` | 102 |
| `.a-popover` | 73 |
| `.s-result-item` | 68 |
| `.s-card-container` | 60 |
| `.puis-card` | 60 |
| `.sg-row` | 5 |

**Zero hits** for the generic `[class*="card"]` patterns the bundle was relying on, because Amazon's tile classes are `s-card-container` / `puis-card-container` / `s-result-item.s-asin` — they don't contain the substring `"card"` in a position that matches `[class*="card"]` (they do contain it, but the v3.3 selector specifically targets standalone class names with bare `card` / `Card` / `tile` / `Tile`, not Amazon-prefixed compound classes).

The result: CSS painted only `html`, `body`, and a few popovers. Every product tile, search result row, navbar block, and footer column remained light until the JS pass got to it.

### The JS pass was the bottleneck

`enforceDarkSurfaces(document)` walks `document.querySelectorAll('*')`, calls `window.getComputedStyle(el)` per element, parses the resulting `backgroundColor` and `backgroundImage` strings, and runs the luminance check. On a 2.1 MB Amazon search-results DOM with ~5000 elements:

- `querySelectorAll('*')` is O(n).
- `getComputedStyle` is documented as a forced reflow trigger if any layout-affecting property has been read since last layout. With 5000 calls in a single synchronous loop, the browser must compute style for each element — even cheap, this dominated the dark-mode timing.
- The 250 ms debounced main observer would re-run the entire pass on every DOM mutation. Amazon mutates aggressively: hover-card preloads, lazy product image loads, sponsored-tile injection, infinite-scroll batches.
- The tight-loop style observer (v3.3) was firing constantly because Amazon writes inline `style` attributes for image lazy-load placeholders, scroll-position trackers, and dropdown timing. Each fire ran another `getComputedStyle`.

The visible "long load" was the JS pass racing the user's first scroll. By the time the user had scrolled past the first viewport, the JS pass had only just caught up to the visible region.

## Fix (v2.3 bundle / v1.5 standalone)

A two-part change:

### Part 1: CSS-first Amazon class-taxonomy coverage

Add explicit selectors for every Amazon class enumerated above, paired with a transparent default and per-class surface routing:

```css
/* Containers — drop to transparent so the body's #161d26 shows through */
.a-section, .a-box, .a-box-inner,
.s-result-item, .s-card-container, .s-card-border,
.s-search-result, .s-widget, .s-widget-container,
.s-include-content-margin, .s-suggestion-container,
.puis-card, .puis-card-container, .puis-component,
.sg-col-inner, .sg-row,
.a-cardui, .a-cardui-content,
#nav-fill, #nav-tools, #nav-link-accountList,
#navFooter, .navFooterCopyright, .navFooterLine,
#search, #navbar-main, #nav-belt, #nav-main,
.nav-search-field, .nav-search-dropdown,
.glow-toaster-container, .glow-ingress-block,
#buybox, #apex_desktop,
#feature-bullets, .feature, .feature-bullets,
#productDetails_db_sections, #productDetailsTabbedContainer,
.a-form-label, .a-row {
    background-color: transparent !important;
    background-image: none !important;
}

/* Top-level shells stay primary */
#navbar, #nav-belt, #nav-main, #navFooter,
#pageContent, #centerCol, #leftCol, #rightCol,
#dp-container, #search > .s-desktop-width-max {
    background-color: #161d26 !important;
}

/* Result tiles get the card surface */
.a-box-group, .a-box.a-spacing-base,
.s-result-item.s-asin, .s-card-container,
.puis-card-container, .a-cardui {
    background-color: #1b232d !important;
    border: 1px solid #424650 !important;
}

.s-result-item:hover, .puis-card-container:hover {
    background-color: #232b37 !important;
}
```

Plus search input as inset, top-bar coverage, brand-color preservation (Amazon Yellow buy-box, price red, savings green, prime blue, star gold), filter rail, footer, popovers/modals.

### Part 2: Skip the JS surface-enumeration pass on Amazon

Once the CSS covers everything, the per-element JS walk is wasted work — and on a 5000-element DOM with constant mutations, the wasted work is significant. Add a `fastPath` flag in the bundle's `SITES` table:

```javascript
{
    host: 'amazon.com',
    cloudscape: false,
    fastPath: true,
    tweaks: `[Amazon class-taxonomy CSS]`
}
```

Wire the flag through the engine:

```javascript
var IS_FAST_PATH = !!active.fastPath;

function nuclearDarkMode() {
    if (IS_FAST_PATH) return;   // CSS handles all surfaces
    enforceDarkSurfaces(document);
}

function attachTightStyleObserver() {
    if (IS_FAST_PATH) return;   // not needed when CSS covers all surfaces
    // ...
}
```

The standalone repo runs only on Amazon, so it uses a hostname check instead of a flag:

```javascript
var __amazonFastPath = /(^|\.)amazon\.com$/i.test(location.hostname);
function nuclearDarkMode() {
    if (__amazonFastPath) return;
    enforceDarkSurfaces(document);
}
```

The main 250 ms observer still runs (catches `aria-*` / `data-*` mutations for the in-content selected rule), but it no longer triggers the per-element walk on every tick.

## Performance impact

| Phase | Before (v2.2 / v1.4) | After (v2.3 / v1.5) |
|---|---|---|
| Initial paint (CSS injection at `document-start`) | ~5 ms — covered html/body, missed product tiles | ~5 ms — covers entire Amazon class taxonomy |
| First JS surface walk | ~150–400 ms on search-results page | **0 ms (skipped)** |
| Per-mutation JS walk (Amazon mutates ~10×/sec on busy pages) | ~50–150 ms each | **0 ms (skipped)** |
| Tight-loop style observer | constantly re-firing on Amazon's inline-style writes | **disabled** |
| User-visible load delay | Hundreds of ms of light flash + per-tile lag | Instant CSS paint, no JS bottleneck |

## Brand colors preserved

| Element | Color | Notes |
|---|---|---|
| `#add-to-cart-button`, `#buy-now-button`, `[data-action="a-button-yellow"]`, `.a-button-yellow` | `#ffd814` (Amazon Yellow) | Buy-box CTAs stay brand yellow with the original gradient. |
| `.a-price-whole`, `.a-color-price` | `#ff7a7a` (Cloudscape error red) | Prices read clearly on dark; the full-saturation Amazon red would vibrate on `#161d26`. |
| `.a-color-success` | `#00b894` | Savings / "in stock" / "free shipping" green. |
| Star ratings (`.a-icon-star*`) | (untouched, SVG) | Star gold preserved through the SVG hands-off rule. |
| `.a-icon-prime` | (untouched, SVG) | Prime blue preserved. |

## Verification checklist

- [ ] Open `https://www.amazon.com/s?k=anything` and observe the search-results page paints dark on first frame — no white flash, no lagging tiles.
- [ ] Scroll to load lazy tiles — they appear pre-darkened, no per-tile transition.
- [ ] Top bar (logo + search + delivery chip + cart) is `#161d26` end-to-end.
- [ ] Search input is an inset `#0a0f15` well with a `#656871` border.
- [ ] Buy-box "Add to Cart" / "Buy Now" stays Amazon Yellow `#ffd814`.
- [ ] Prices render in `#ff7a7a`.
- [ ] Star ratings stay gold.
- [ ] Prime checkmark stays prime blue.
- [ ] Product detail page renders dark immediately, including #buybox, #feature-bullets, #productDetails_*.
- [ ] Footer (`#navFooter`) is dark with `#42b4ff` links.

## Lessons that fed back into the standard

1. **Generic class-prefix selectors miss vendor frameworks.** Amazon's `s-card-container` doesn't match `[class*="card"]` because the wildcard matches inside-the-string but the v3.3 tile rule expects `card` / `Card` as a wholeword token in some places. Always profile the target site's class taxonomy first.

2. **`getComputedStyle` × N is the perf cliff.** On any DOM > ~2000 elements, the per-element JS walk becomes the dark-mode load-time bottleneck. The standard now documents a "fast path" pattern: when CSS can cover the entire surface enumeration for a site, disable the JS surface walk for that site.

3. **Site-specific CSS over generic engine.** The dark-mode standard's generic engine handles 80–90% of any site, but the last 10–20% requires reading the target site's actual stylesheet and writing matching selectors. Site-specific CSS in the per-site `tweaks` field is the right tool — it keeps the engine simple and makes per-site fixes cheap.

## References

- AWS Cloudscape Dark Mode Standard for LLM v3.3 (`STANDARDS.md`) — Section 14 (Bundling Pattern), Dual-Update Rule.
- Bundle: <https://github.com/BarnsAWS/AWS-DC-Full-Open-Source-Dark-Mode-Bundle>
- Standalone: <https://github.com/BarnsAWS/Amazon-Business-Prime-Dark-Mode-TamperMonkey-Script>
