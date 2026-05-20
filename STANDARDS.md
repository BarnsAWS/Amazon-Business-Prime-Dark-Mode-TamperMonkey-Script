# Cloudscape-Aligned Dark Mode Standard for Web Userscripts

> **Version:** 3.3
> **Audience:** anyone writing a Tampermonkey/Violentmonkey userscript that re-themes a Cloudscape (formerly Polaris) web app to dark mode.
> **Color authority:** AWS Cloudscape Design System dark-mode tokens. Cloudscape is publicly documented at https://cloudscape.design.

This document is the canonical reference used by the dark-mode userscripts in this repository. It describes the palette, the CSS layer, the JS layer, the observers, and the contrast policies that together produce a high-contrast dark theme that survives SPA route changes, framework gradients, and inline framework writes.

---

## 1. Architecture

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: CSS (injected at document-start)          │
│  • Immediate paint — eliminates white flash         │
│  • Sub-component coverage (v3.3)                    │
│  • background-image: none paired with every dark bg │
│  • !important on everything                         │
└──────────────────────────┬──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│  Layer 2: JS (runs after DOMContentLoaded)          │
│  • isLightSurface()  — light-surface detector       │
│  • enforceDarkSurfaces() — universal pass           │
│  • forceTopBarDark()                                │
│  • forceInlineControlsDark() (v3.1)                 │
│  • forceSelectedRowsDark() (v3.2)                   │
│  • pierceShadowRoots()                              │
│  • Main observer: class/aria/data-*, 250ms debounce │
│  • Tight observer: style only, rAF batched (v3.3)   │
│  • Delayed safety passes 500/1500/3000ms            │
└─────────────────────────────────────────────────────┘
```

**Key principle:** CSS establishes the baseline dark theme; JS is the safety net that catches anything CSS misses, including framework gradients and late inline-style writes.

---

## 2. Color Palette

Surfaces, text tiers, semantic accents, and borders use the Cloudscape dark-mode tokens. Luminance values use `Y = 0.299·R + 0.587·G + 0.114·B`.

### Surfaces

| Token | Hex | RGB | Y | Usage |
|---|---|---|---:|---|
| `--bg-input` | `#0a0f15` | 10, 15, 21 | 13.5 | Inline form controls + selected sidebar rows |
| `--bg-primary` | `#161d26` | 22, 29, 38 | 23.5 | Page body, main, sidebar |
| `--bg-secondary` | `#1b232d` | 27, 35, 45 | 28.5 | Layered popovers, cards, inline-white fall-through |
| `--bg-tertiary` | `#232b37` | 35, 43, 55 | 36.0 | Hover lift, zebra rows, nested panels |
| `--bg-elevated` | `#424650` | 66, 70, 80 | 70.6 | Toggle, chip, button hover panel |
| `--bg-overlay` | `rgba(15, 20, 26, 0.7)` | — | — | Modal scrim |

### Text

| Token | Hex | RGB | Y | Usage |
|---|---|---|---:|---|
| `--text-primary` | `#f9f9fa` | 249, 249, 250 | 249.0 | Headings, logo, emphasis, selected-row text |
| `--text-heading` | `#ebebf0` | 235, 235, 240 | 235.5 | h2, h3 |
| `--text-secondary` | `#dedee3` | 222, 222, 227 | 222.5 | Nav items, h4–h6 |
| `--text-body` | `#c6c6cd` | 198, 198, 205 | 198.8 | Default body text |
| `--text-description` | `#a4a4ad` | 164, 164, 173 | 165.0 | Form descriptions, helper text |
| `--text-muted` | `#8c8c94` | 140, 140, 148 | 140.9 | Placeholders, breadcrumb inactive |
| `--text-disabled` | `#656871` | 101, 104, 113 | 105.0 | Disabled controls |

### Interactive / Semantic

| Token | Hex | Usage |
|---|---|---|
| `--link-default` | `#42b4ff` | Links, accent, left-rail accent |
| `--link-secondary` | `#539fe5` | Top-navigation links |
| `--accent-primary` | `#ff9900` | Primary action button (Amazon Orange brand) |
| `--accent-primary-text` | `#0f141a` | Text on primary buttons |
| `--accent-success` | `#00802f` | Success badge bg |
| `--accent-error` | `#ff7a7a` | Error text/border |
| `--accent-error-bg` | `#1f0000` | Error alert bg |
| `--accent-info` | `#42b4ff` | Info border, progress |
| `--accent-info-bg` | `#001129` | Info alert bg, in-content selected row bg |

### Borders

| Token | Hex | Usage |
|---|---|---|
| `--border-default` | `#424650` | Decorative dividers |
| `--border-disabled` | `#656871` | Inline-control border (3.82:1 vs body — passes WCAG 1.4.11) |
| `--border-focus` | `#42b4ff` | Focus rings |
| `--rail-selected` | `#42b4ff` 3px (in-content) / 4px (sidebar) | Left-rail accent on selected rows |

---

## 3. Surface Contrast Reference

| Surface A | Surface B | ΔY | Contrast | Adequate for |
|---|---|---|---:|---|
| `--bg-primary` | `--bg-input` | 10.0 | 1.34:1 (inverse) | Inline controls + border / selected sidebar + rail |
| `--bg-primary` | `--bg-secondary` | 5.0 | 1.21:1 | Layered popovers / cards **with drop-shadow** + inline-white fall-through |
| `--bg-primary` | `--bg-tertiary` | 12.5 | 1.53:1 | Hover lift, zebra rows, nested panels |
| `--bg-primary` | `--accent-info-bg` | 8.9 | 1.61:1 (inverse) | In-content selected row + 3px rail |
| `--bg-primary` | `--border-disabled` | 81.5 | 3.82:1 | Inline control border (passes 3:1) |
| `--bg-primary` | `--link-default` | 130.5 | 5.41:1 | Selected-nav left-rail accent (passes 4.5:1) |

**Decision rules:**
- Layered popover with drop-shadow → `--bg-secondary`
- Inline form control → `--bg-input` + `--border-disabled` border
- Selected sidebar row → `--bg-input` + 4px `--link-default` left-rail
- Selected in-content row → `--accent-info-bg` + 3px `--link-default` left-rail (tabs and listbox options keep their own conventions)
- Hover state on a row → `--bg-tertiary`
- Inline-white fall-through (`style="background: white"`) → `--bg-secondary`
- Card / tile / widget / container → `--bg-secondary` + 1px `--border-default` border

---

## 4. Text-on-Surface Contrast Matrix

Every pairing meets WCAG AA (4.5:1) for normal text unless flagged. ⚠ passes WCAG AA Large only (3:1, ≥18 pt or ≥14 pt bold). ❌ fails both.

| Text token | on `--bg-primary` | on `--bg-secondary` | on `--bg-tertiary` | on `--bg-input` | on `--accent-info-bg` | on `--accent-error-bg` |
|---|---:|---:|---:|---:|---:|---:|
| `--text-primary` (#f9f9fa) | 17.0:1 | 14.6:1 | 13.0:1 | 20.4:1 | 17.0:1 | 15.4:1 |
| `--text-heading` (#ebebf0) | 16.0:1 | 13.7:1 | 12.2:1 | 19.2:1 | 16.0:1 | 14.5:1 |
| `--text-secondary` (#dedee3) | 14.6:1 | 12.6:1 | 11.2:1 | 17.6:1 | 14.6:1 | 13.3:1 |
| `--text-body` (#c6c6cd) | 9.2:1 | 8.0:1 | 7.0:1 | 11.3:1 | 10.7:1 | 8.6:1 |
| `--text-description` (#a4a4ad) | 6.7:1 | 5.8:1 | 5.1:1 | 8.2:1 | 7.0:1 | 6.3:1 |
| `--text-muted` (#8c8c94) | 5.0:1 | 4.4:1 ⚠ | 3.9:1 ❌ | 6.1:1 | 5.2:1 | 4.7:1 |
| `--text-disabled` (#656871) | 3.4:1 ⚠ | 3.0:1 ⚠ | 2.7:1 ❌ | 4.2:1 ⚠ | 3.6:1 ⚠ | 3.2:1 ⚠ |
| `--link-default` (#42b4ff) | 5.4:1 | 4.7:1 | 4.2:1 ⚠ | 6.6:1 | 5.6:1 | 5.1:1 |
| `--accent-error` (#ff7a7a) | 4.4:1 ⚠ | 3.8:1 ❌ | 3.4:1 ❌ | 5.4:1 | 4.6:1 ⚠ | 4.1:1 ⚠ |

Hard rules:
- `--text-disabled` is only safe on `--bg-input`. Reserve for genuinely disabled controls.
- `--text-muted` on `--bg-tertiary` fails normal text — use `--text-description` instead.
- Error icon glyphs (`--accent-error`) on `--bg-secondary` or `--bg-tertiary` only qualify as "large" — use them for icons (≥18 px) or pair with `--accent-error-bg`.

---

## 5. Inline Control Contrast Rule (v3.1)

### The UX problem

Cloudscape's `--bg-secondary` (`#1b232d`) is only 1.21:1 against `--bg-primary` (`#161d26`). Adequate for layered surfaces with drop-shadow, **fails WCAG 1.4.11 (3:1 non-text UI)** for inline form controls.

### The fix

Inline controls get the **inset** surface `--bg-input` (`#0a0f15`, deliberately darker than the page) plus a `--border-disabled` (`#656871`) 1 px border. The border alone clears 3.82:1 against the page — passes WCAG 1.4.11.

```css
input, textarea, select,
[role="combobox"], [role="spinbutton"],
[role="textbox"]:not([contenteditable="true"]),
[class*="select-trigger"], [class*="dropdown-trigger"],
[class*="form-control"], [class*="select-field"],
[class*="text-field"]:not(label),
[class*="awsui_input"], [class*="awsui_select"], [class*="awsui_textarea"] {
    background-color: #0a0f15 !important;       /* --bg-input */
    background-image: none !important;
    color: #c6c6cd !important;
    -webkit-text-fill-color: #c6c6cd !important;
    border: 1px solid #656871 !important;       /* --border-disabled */
    caret-color: #f9f9fa !important;
}
```

A required `forceInlineControlsDark()` JS pass re-asserts these styles every observer tick because frameworks often write `style.background` directly on focus/blur.

---

## 6. In-Content Selected Rule (v3.2)

The generalized selected-row rule applies globally to `[aria-selected="true"]`, `[aria-current="*"]`, `[class*="selected"]`, `[class*="is-active"]`, `[class*="is-selected"]`, with explicit `:not([role="tab"]):not([role="option"])` exclusions. Tabs use the bottom-border underline pattern; listbox options use a row hover lift; sidebar nav has a stronger override (deeper inset + heavier rail) that wins via specificity.

```css
/* Tabs — must come BEFORE the general rule */
[role="tab"][aria-selected="true"], [role="tab"][aria-current="true"] {
    background-color: transparent !important;
    background-image: none !important;
    color: #f9f9fa !important;
    -webkit-text-fill-color: #f9f9fa !important;
    border-bottom: 2px solid #42b4ff !important;
}

/* Listbox options — must come BEFORE the general rule */
[role="option"]:hover { background-color: #232b37 !important; }
[role="option"][aria-selected="true"] {
    background-color: #232b37 !important;
    color: #f9f9fa !important;
    -webkit-text-fill-color: #f9f9fa !important;
}

/* General in-content selected rule */
[aria-selected="true"]:not([role="tab"]):not([role="option"]),
[aria-current="true"]:not([role="tab"]),
[aria-current="page"]:not([role="tab"]),
[class*="selected"]:not(button):not(input):not(label):not([role="tab"]):not([role="option"]),
[class*="is-active"]:not(button):not(input):not([role="tab"]),
[class*="is-selected"]:not(button):not(input):not([role="tab"]) {
    background-color: #001129 !important;       /* --accent-info-bg */
    background-image: none !important;
    color: #f9f9fa !important;
    -webkit-text-fill-color: #f9f9fa !important;
    border-left: 3px solid #42b4ff !important;
}

/* Sidebar wins via specificity */
aside [aria-current="page"], [class*="sidebar"] [aria-current="page"],
[class*="side-nav"] [aria-current="page"], nav[aria-label] [aria-current="page"] {
    background-color: #0a0f15 !important;       /* --bg-input */
    color: #f9f9fa !important;
    border-left: 4px solid #42b4ff !important;
}
```

Required `forceSelectedRowsDark()` JS pass re-asserts on every observer tick; auto-detects sidebar containers via `closest()` to apply the deeper-inset variant.

---

## 7. Inline-White Fall-through (v3.2)

Frameworks frequently inline `style="background: white"` on cards. v3.2 routes those to `--bg-secondary` (not `--bg-primary`), preserving card visual identity. The page itself stays anchored at `--bg-primary` via the `html, body` rule which must come earlier in the cascade.

```css
[style*="background-color: rgb(255, 255, 255)"],
[style*="background-color: rgba(255, 255, 255"],
[style*="background-color: white"],
[style*="background:#fff"],  [style*="background: #fff"],
[style*="background:#ffffff"], [style*="background: #ffffff"],
[style*="background: white"],
[style*="background-color:#fff"], [style*="background-color: #fff"],
[style*="background-color:#ffffff"], [style*="background-color: #ffffff"] {
    background-color: #1b232d !important;
    background-image: none !important;
}
```

Lavender / framework-selection tints `rgba(151..170, *, *, *)` route to `--accent-info-bg`.

---

## 8. Sub-Component Coverage (v3.3)

Card containers get `--bg-secondary` from a `[class*="card"]` rule, but their internal sub-components (header strip, body, content, footer, title bar) often have their own framework-supplied light surface. v3.3 drops those sub-components to **transparent** so the parent card surface shows through.

```css
[class*="card"] header,
[class*="card"] [class*="header"]:not(input):not([class*="page-header"]):not([class*="app-header"]):not([class*="topbar"]),
[class*="card"] [class*="title"], [class*="card"] [class*="Title"],
[class*="card"] [class*="body"]:not(input):not(textarea):not(button),
[class*="card"] [class*="content"]:not(input):not(textarea):not(button),
[class*="card"] [class*="footer"]:not(input):not(textarea):not(button),
/* Mirror across panel, widget, container, awsui_container, etc. */ {
    background-color: transparent !important;
    background-image: none !important;
}

/* Sub-component text colors */
[class*="card"] [class*="title"] {
    color: #ebebf0 !important;          /* --text-heading */
    -webkit-text-fill-color: #ebebf0 !important;
}
[class*="card"] [class*="body"], [class*="card"] [class*="content"] {
    color: #c6c6cd !important;          /* --text-body */
    -webkit-text-fill-color: #c6c6cd !important;
}
```

Critical exclusions: `:not(input):not(textarea):not(button)` prevents form controls inside cards from being recolored to transparent. `:not([class*="page-header"]):not([class*="app-header"]):not([class*="topbar"])` prevents the global page header from being misclassified as a card sub-component.

---

## 9. Background-Image Stripping (v3.3)

Frameworks paint card headers via `background-image: linear-gradient(white, white)` or `linear-gradient(180deg, #fff, #f5f5f7)`. The pre-v3.3 nuclear pass only checked `background-color` and ignored `background-image`, so these gradients survived.

**Two-pronged fix:**

**CSS:** every dark `background-color` rule pairs with `background-image: none !important`. Inline-style overrides match `[style*="linear-gradient"][style*="white"]` and friends.

```css
[style*="linear-gradient"][style*="white"],
[style*="linear-gradient"][style*="#fff"],
[style*="linear-gradient"][style*="rgb(255"],
[style*="background-image"][style*="white"],
[style*="background-image"][style*="#fff"],
[style*="background-image"][style*="rgb(255"] {
    background-image: none !important;
    background-color: #1b232d !important;
}
```

**JS:** `isLightSurface()` scans `computed.backgroundImage` for any rgb stop with luminance > 200 (or named `white`, `#fff`, `#ffffff`, `#fefefe`, `#f8f8f8`). When triggered, the universal pass strips the gradient and substitutes a dark surface.

```javascript
function isLightSurface(computed) {
    if (!computed) return { isLight: false, lum: 0, isImage: false };
    var bg = computed.backgroundColor;
    var bgImage = computed.backgroundImage;
    var m = bg && bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (m) {
        var r = +m[1], g = +m[2], b = +m[3];
        var a = m[4] !== undefined ? +m[4] : 1;
        if (a > 0.05) {
            var lum = r * 0.299 + g * 0.587 + b * 0.114;
            if (lum > 100) return { isLight: true, lum: lum, isImage: false };
        }
    }
    if (bgImage && bgImage !== 'none') {
        if (/\bwhite\b/i.test(bgImage) || /#fff\b/i.test(bgImage) ||
            /#ffffff\b/i.test(bgImage) || /#fefefe\b/i.test(bgImage) || /#f8f8f8\b/i.test(bgImage)) {
            return { isLight: true, lum: 240, isImage: true };
        }
        var rgbStops = bgImage.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/g);
        if (rgbStops) {
            for (var i = 0; i < rgbStops.length; i++) {
                var rm = rgbStops[i].match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (rm) {
                    var slum = +rm[1] * 0.299 + +rm[2] * 0.587 + +rm[3] * 0.114;
                    if (slum > 200) return { isLight: true, lum: slum, isImage: true };
                }
            }
        }
    }
    return { isLight: false, lum: 0, isImage: false };
}
```

---

## 10. Tight-Loop Style Observer (v3.3)

Frameworks write `style.background` directly on elements during interaction events. The 250 ms debounced main observer reacts too slowly — focused selects and freshly-loaded cards flash their native light surface for ~250 ms before correction. The fix is a second observer dedicated to `attributeFilter: ['style']` with `requestAnimationFrame` batching:

```javascript
function attachTightStyleObserver() {
    if (window.__darkModeTightObserver) return;
    var pending = new Set();
    var rafId = null;
    function flush() {
        rafId = null;
        pending.forEach(function(el) {
            if (!el || !el.isConnected) return;
            var tag = el.tagName ? el.tagName.toUpperCase() : '';
            if (tag === 'IMG' || tag === 'VIDEO' || tag === 'CANVAS' || tag === 'SVG' ||
                (el.closest && el.closest('svg'))) return;
            var computed;
            try { computed = window.getComputedStyle(el); } catch (_) { return; }
            var info = isLightSurface(computed);
            if (!info.isLight) return;
            if (info.isImage) {
                try { el.style.setProperty('background-image', 'none', 'important'); } catch (_) {}
            }
            var target = info.lum > 140 ? '#1b232d' : '#232b37';
            try { el.style.setProperty('background-color', target, 'important'); } catch (_) {}
        });
        pending.clear();
    }
    var obs = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
            var m = mutations[i];
            if (m.type === 'attributes' && m.target) pending.add(m.target);
        }
        if (rafId === null && pending.size > 0) rafId = requestAnimationFrame(flush);
    });
    try {
        obs.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style'],
            subtree: true
        });
        window.__darkModeTightObserver = obs;
    } catch (_) {}
}
```

The observer's own writes don't loop because `isLightSurface()` returns false on the now-dark surface and the work skips.

The main observer drops `style` from its `attributeFilter` (the tight observer handles it) and keeps `class`, `aria-selected`, `aria-current`, `data-state`, `data-active`, `data-selected`.

---

## 11. Anti-Patterns

| Anti-pattern | Why it fails | Do this instead |
|---|---|---|
| `filter: invert(1)` on body | Inverts images, breaks brand colors | Explicit overrides |
| Targeting only class names | Generated/hashed classes change on deploy | Use ARIA roles + structural selectors |
| Single `setTimeout` at load | Misses SPA route changes and lazy content | MutationObserver + delayed passes |
| Forgetting `-webkit-text-fill-color` | Some apps use this property to defeat `color` | Always set both |
| Styling `<img>` backgrounds | Breaks transparent PNGs | Always exclude media |
| Moderate specificity without `!important` | Site stylesheets win | `!important` on everything |
| `#000000` for backgrounds | Too harsh; Cloudscape uses warm dark blues | Use `#161d26` |
| Single white text token | Looks flat | Use the full text tier |
| `--bg-secondary` for inline form controls | 1.21:1 — fails WCAG 1.4.11 | `--bg-input` + `--border-disabled` border |
| `--accent-info-bg` for selected sidebar rows | Reads as info badge | `--bg-input` + 4px `--link-default` left-rail |
| `<main>` scoping for selected-row rule | Many apps don't use `<main>` | Apply un-scoped, exclude tabs/options explicitly |
| Routing inline `background: white` to `--bg-primary` | Cards collapse into the page | Route to `--bg-secondary` |
| Single rule for tabs + options + rows | Tabs/options inherit row affordance | Three dedicated rules in source order |
| `background-color` without `background-image: none` | Framework gradient survives | Pair them on every dark surface |
| Watching only `background-color` in JS | Misses gradients with white stops | Use `isLightSurface()` (color + image) |
| 250 ms debounced observer for everything | Framework writes flash for 250 ms | Add a tight rAF observer on `style` only |
| Light-detection threshold > 240 only | Misses off-whites like `#f5f5f7` | Detect anything with luminance > 100 (color) or any stop > 200 (gradient) |

---

## 12. Userscript Skeleton

```javascript
// ==UserScript==
// @name         <Tool> Dark Mode
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  High-contrast dark mode for <domain>
//               Color palette: AWS Cloudscape Polaris Dark Mode tokens v3.3
// @match        https://<domain>/*
// @match        https://*.<domain>/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // [Color constants block — see Section 2]
    // [DARK_CSS string — see Sections 5–9]

    function isLightSurface(computed) { /* Section 9 */ }
    function enforceDarkSurfaces(root) { /* JS pass that calls isLightSurface */ }
    function nuclearDarkMode() { enforceDarkSurfaces(document); }
    function forceTopBarDark() { /* selector + position-based */ }
    function forceInlineControlsDark() { /* Section 5 */ }
    function forceSelectedRowsDark() { /* Section 6 */ }
    function pierceShadowRoots(root) { /* + enforceDarkSurfaces inside shadow root */ }
    function attachTightStyleObserver() { /* Section 10 */ }

    function init() {
        injectGlobalCSS();
        nuclearDarkMode();
        forceTopBarDark();
        forceInlineControlsDark();
        forceSelectedRowsDark();
        pierceShadowRoots(document);
        attachTightStyleObserver();

        var observer = new MutationObserver(function() {
            clearTimeout(observer._t);
            observer._t = setTimeout(function() {
                nuclearDarkMode();
                forceTopBarDark();
                forceInlineControlsDark();
                forceSelectedRowsDark();
                pierceShadowRoots(document);
            }, 250);
        });
        observer.observe(document.body, {
            childList: true, subtree: true,
            attributes: true,
            attributeFilter: ['class', 'aria-selected', 'aria-current', 'data-state', 'data-active', 'data-selected']
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }

    window.addEventListener('load', function() {
        setTimeout(function() { nuclearDarkMode(); forceInlineControlsDark(); forceSelectedRowsDark(); }, 500);
        setTimeout(function() { nuclearDarkMode(); forceInlineControlsDark(); forceSelectedRowsDark(); }, 1500);
        setTimeout(function() { nuclearDarkMode(); forceInlineControlsDark(); forceSelectedRowsDark(); }, 3000);
    });
})();
```

---

## 13. QA Checklist

- [ ] Every CSS rule that sets a dark `background-color` ALSO sets `background-image: none !important`.
- [ ] Sub-component coverage block included for all card-like containers.
- [ ] Sub-component selectors include `:not(input):not(textarea):not(button)` exclusions.
- [ ] Inline-style block covers `[style*="linear-gradient"][style*="white"]` and friends.
- [ ] `isLightSurface()` and `enforceDarkSurfaces()` included verbatim.
- [ ] `attachTightStyleObserver()` called from `init()`.
- [ ] Main observer's `attributeFilter` is `['class', 'aria-selected', 'aria-current', 'data-state', 'data-active', 'data-selected']` (no `style`).
- [ ] Three delayed safety passes at 500 / 1500 / 3000 ms call all four passes.
- [ ] Visual regression: no card sub-component renders light.
- [ ] Visual regression: no element renders with a `background-image: linear-gradient(white, ...)`.
- [ ] Inline form controls render as inset wells with a visible 1 px `#656871` border.
- [ ] Selected sidebar rows have inset surface + 4 px blue left-rail.
- [ ] Selected in-content rows have `#001129` + 3 px blue left-rail + emphasis text.
- [ ] Tabs use bottom-border underline only.
- [ ] No light flash on initial load.
- [ ] SPA route changes don't leave bright residue.
- [ ] Text on every dark surface verified against the contrast matrix.

---

## License

MIT (see `LICENSE`).


---

## 14. Bundling Pattern (Multi-Site)

When more than ~3 sites share the same Cloudscape v3.3 implementation, bundle them into a single userscript instead of maintaining N standalones. The bundle pattern keeps one engine and a small per-site override table.

### Why bundle

- One install URL to share. One Tampermonkey "Check for updates" click pulls every site's latest fix.
- Per-site repos remain authoritative for fine-grained iteration. The bundle is a periodic snapshot.
- New sites added to the bundle need only a `SITES` table entry � no separate repo required if the site needs no per-site overrides beyond the baseline.

### Structure

The bundle file has three sections:

1. **`@match` block at the top** � a flat list of every host the bundle activates on, both bare domain and wildcard subdomain.
2. **`SITES` array** � one entry per host with optional per-site overrides.
3. **Engine** � the standard Cloudscape v3.3 CSS + JS layer documented in Sections 1�13. Unchanged from per-site scripts.

```javascript
const SITES = [
    { host: 'cloudscape-host.example.com', awsui: true },
    { host: 'vendor-host.example.com',     awsui: false },
    {
        host: 'retail.example.com',
        awsui: false,
        brandPreservation: `
            /* Brand-color CSS that wins over the Cloudscape primary token */
            #buy-button { background-color: #ffd814 !important; ... }
        `
    },
    {
        host: 'shopify-store.example.com',
        awsui: false,
        headerExtraSelectors: ['.shopify-section-header', '.site-header', /* ... */],
        logoSelectors:        ['.header__logo', '.site-header__logo', /* ... */]
    }
];
```

### Per-site override fields

| Field | Type | Purpose |
|---|---|---|
| `host` | string (required) | The hostname to match. Subdomains match via `endsWith('.' + host)`. |
| `awsui` | boolean | Set to `true` for hosts that use the Cloudscape framework (forces the `awsui-polaris-dark-mode` body class and attaches the class observer). |
| `brandPreservation` | CSS string | Raw CSS appended after the core stylesheet so it wins on equal-specificity ties. Use this for retail brand colors (Amazon Yellow buy-box, etc.). |
| `headerExtraSelectors` | string[] | Selectors that should be forced to `--bg-primary`. Use this for platform-specific header markup (Shopify, WordPress, etc.). |
| `logoSelectors` | string[] | Selectors that should get the lighter `--bg-tertiary` surface so the brand logo container reads as a distinct affordance. |

### Site resolution

```javascript
const HOST = location.hostname;
function findSite(host) {
    for (var i = 0; i < SITES.length; i++) {
        var s = SITES[i];
        if (host === s.host || host.endsWith('.' + s.host)) return s;
    }
    return { host: host, awsui: false }; // generic fallback
}
const SITE = findSite(HOST);
```

The fallback returns a config that still applies the Cloudscape baseline. Sites that need no per-site overrides can be added with a one-line `SITES` entry.

### Adding a new site

Three steps, no separate repo required:

1. Add `@match` lines at the top of the bundle for the new domain.
2. Add a `SITES` table entry. Most sites need only `{ host: 'example.com' }`.
3. Reload any tab on the new domain. Tampermonkey re-injects automatically.

### When to spin up a standalone repo instead

If a site needs more than ~20 lines of overrides (large brand-color block, custom JS pass, framework-specific quirks), put it in its own standalone repo and keep the bundle as a thin wrapper that defers to the same engine. The standalone repo continues to be the authoritative source; the bundle picks up the change at next sync.

### Bundle vs standalone � install order

If a user installs both the bundle and a per-site script for the same host, Tampermonkey runs them in install order. The more-specific match generally wins on equal-priority rules. Most users will pick one approach and stick with it.


### Pseudo-element hazard (added 2026-05-20)

Some themes paint a full-bleed white surface via a `::before` or `::after` pseudo-element with a positive `z-index`, sitting **on top of** the element you're trying to dark-mode. JS observers cannot see pseudo-elements (they aren't in the DOM tree), so `enforceDarkSurfaces()` will never touch them. CSS targeting the parent's `background-color` will be visually defeated by the overlay.

**Symptom:** the JS surface detector reports `isLight: false` for the parent, yet the page visually shows a white strip in that location.

**Detection:** open DevTools ? Elements panel ? click the offending strip ? check the Computed styles for the parent. If `background-color` is dark but the visual is white, expand the rule list and look for `::before` / `::after` lines or scroll the Pseudo column.

**Fix pattern:**

```css
.problem-element::after, .problem-element::before {
    background-color: transparent !important;
    background-image: none !important;
    display: none !important;
}
```

Use `display: none` if the pseudo-element exists purely for color (a decorative strip). Use `transparent` if the pseudo-element also positions an icon, badge, or arrow.

**Real-world example:** Ferro Concepts shipped on Shopify Timber paints `.nav-bar:after { background-color: #fff; z-index: 6 }` over its `.nav-bar` element. The fix in v2.2 of the Cloudscape Dark Mode Bundle is documented in detail in `FERRO_INVESTIGATION.md` in that repo.


### `fastPath` flag (Section 14 addendum, added 2026-05-20)

For sites with very large DOMs (=2,000 elements per page, =50 result tiles, frequent framework `style.background` writes during hover/focus), the per-element JS pass becomes the bottleneck. Add `fastPath: true` to the `SITES` entry to opt the site into a CSS-first execution profile:

| Pass | Generic site | `fastPath: true` |
|---|---|---|
| `enforceDarkSurfaces` per-element walk | runs every observer tick | no-op |
| Tight-loop style observer (rAF) | active | disabled |
| Main observer debounce | 250 ms | 600 ms |
| Safety pass at 3000 ms | runs | skipped |

Trade-off: the CSS rules for the site MUST cover every container surface (no JS safety net for missed surfaces). Profile the site first by enumerating class names with `Object.keys(...class lists...)` and write site-specific selectors that cover them. Real-world example: `amazon.com` uses `.a-section` (1,272 instances), `.a-box` (102), `.s-result-item` (68), `.s-card-container` (60), `.puis-card` (60), `.sg-col` (134) � all enumerated in `tweaks` for that site.

See `AMAZON_PERFORMANCE.md` in the bundle repo for the full investigation.


### Dual-Update Rule (added 2026-05-20)

**Whenever a site is added or its dark-mode rules are updated, both the consolidated bundle and the individual standalone repo for that site must be updated in the same change set.** Neither can drift behind the other.

The bundle (`AWS-DC-Full-Open-Source-Dark-Mode-Bundle`) is the single-install entrypoint most users prefer. The standalone repos remain authoritative per-site references for fine-grained iteration, audits, and per-site issue triage. Drift between the two means a user installing the bundle gets stale rules, or a user installing a standalone gets a fix that the bundle is also missing.

#### Order of operations

1. **Land the change in the standalone repo first.** This is where you iterate, profile, test, and capture the rationale (e.g., `FERRO_INVESTIGATION.md`, `AMAZON_PERFORMANCE.md`).
2. **Port the change into the bundle's `SITES` table.** Most changes are CSS strings that copy verbatim into the entry's `tweaks` field; behavioral flags (e.g. `fastPath: true`) go into the entry's top-level config.
3. **Bump versions on both files in the same commit batch.** Standalone gets a patch/minor bump in its own header; the bundle gets a corresponding bump in its `@version` line.
4. **Update the changelog/header comments on both** with a one-line summary of what changed.
5. **Push both repos in the same session** so the GitHub raw URLs serve the matched pair within seconds of each other.
6. **Verify both raw URLs serve the new versions** before declaring the change complete (see "Verification" below).

#### Versioning conventions

| Change type | Standalone bump | Bundle bump |
|---|---|---|
| New site added | n/a (new standalone repo at `v1.0`) | minor: `2.x` ? `2.x+1` |
| New rule for an existing site | patch: `1.x` ? `1.x+1` | patch: `2.x` ? `2.x+1` |
| Engine-level change (shared CSS or JS) | every standalone gets a patch bump | minor: `2.x` ? `2.x+1` |
| Standard-level change (token revision, anti-pattern added) | minor: `1.x` ? `1.x+1` everywhere | minor: `2.x` ? `2.x+1` |

#### Per-change checklist

- [ ] Standalone userscript header `@version` bumped.
- [ ] Bundle userscript header `@version` bumped.
- [ ] Bundle's `SITES` entry for that host updated (tweaks string and/or flags).
- [ ] Investigation/profile doc (if the change required research) committed to the standalone repo.
- [ ] Same investigation doc copied into the bundle repo (so a user reading just the bundle has full context).
- [ ] `STANDARDS.md` updated in `_dark-mode-shared` if a new pattern, anti-pattern, or hazard was discovered.
- [ ] Updated `STANDARDS.md` propagated to every repo so reference docs stay synchronized.
- [ ] Both repos pushed.
- [ ] Both raw URLs verified to serve the bumped version (`Invoke-WebRequest` + regex check).
- [ ] Tampermonkey install URLs opened in the active browser so the update prompt is visible.

#### Verification snippet (PowerShell)

```powershell
$repos = @(
    @{ url = 'https://raw.githubusercontent.com/.../bundle.user.js';     expected = '2.x' },
    @{ url = 'https://raw.githubusercontent.com/.../standalone.user.js'; expected = '1.x' }
)
foreach ($r in $repos) {
    $bytes = (Invoke-WebRequest -Uri $r.url -UseBasicParsing -Headers @{'User-Agent'='Mozilla/5.0 Firefox/130.0'} -TimeoutSec 30).Content
    $text  = if ($bytes -is [byte[]]) { [System.Text.Encoding]::UTF8.GetString($bytes) } else { [string]$bytes }
    $v     = [regex]::Match($text, '@version\s+([\d.]+)').Groups[1].Value
    Write-Host ("{0} | expected {1} | got {2} | {3}" -f $(if ($v -eq $r.expected) { 'OK' } else { 'STALE' }), $r.expected, $v, $r.url)
}
```

#### When the dual-update rule does NOT apply

- A site lives **only** in the bundle (no standalone repo). Adding a single-line `SITES` entry for a small site with no per-site overrides is bundle-only by design. Promote to a standalone if the site grows beyond ~20 lines of overrides.
- A site lives **only** as a standalone (the bundle has not yet absorbed it). The next bundle version should pull it in.

#### Why this rule exists

Without it, the bundle and standalone for a given site can drift in opposite directions, leading to user confusion ("the bundle's broken on Ferro but the standalone works"), duplicated investigation effort, and stale rules that re-introduce already-fixed bugs. The rule keeps the dual-distribution model honest at near-zero overhead � porting a CSS string from a standalone into a bundle's `tweaks` field is a 30-second operation when done in the same change set.


### CSS-Only Fast Path (Section 14 update � added 2026-05-20)

**Problem with v3.3 fastPath as originally designed:** marking a site `fastPath: true` only skipped `enforceDarkSurfaces()` and the tight-loop style observer. The other JS passes (`forceTopBarDark`, `forceInlineControlsDark`, `forceSelectedRowsDark`) and the load-event safety passes still ran on every observer tick. On Amazon's 2 MB / 5000-element search-results pages this still produced visible "dark mode is slow to load" delays of hundreds of milliseconds.

**v2.4 fix:** when `fastPath: true`, `init()` does CSS injection + theme-flag activation, then **returns immediately**. No JS passes, no observers, no load-event safety passes. Pure CSS.

```javascript
function init() {
    activateThemeFlag();
    injectGlobalCSS();
    if (IS_FAST_PATH) {
        // CSS-only mode: tweaks block must cover ALL surfaces.
        return;
    }
    // ... full engine for non-fastPath sites ...
}

// Load-event safety passes also gated on fastPath
if (!IS_FAST_PATH) {
    window.addEventListener('load', function () {
        setTimeout(safetyPass, 500);
        setTimeout(safetyPass, 1500);
        setTimeout(safetyPass, 3000);
    });
}
```

**Required when using `fastPath: true`:** the site's `tweaks` block must comprehensively cover every surface. There is no JS safety net. If a surface is missed, it stays light. This is the trade-off � the perf gain is total bypass of all per-tick work, but coverage burden moves from JS-discovers-light-surfaces to author-enumerates-CSS-selectors.

**Workflow for marking a site `fastPath: true`:**

1. Profile the site's class taxonomy (count `.a-section`, `.a-box`, etc. � anything that paints a surface).
2. Write CSS rules covering every container that should drop to transparent, every card that should be `--bg-secondary`, every nav that should be `--bg-primary`.
3. Add `fastPath: true` and the comprehensive `tweaks` block to the SITES entry in BOTH the bundle AND the standalone repo (per the Dual-Update Rule above).
4. Visual-regression test the site: load every major page type (homepage, search, detail, account) and look for any white surface. If found, add a CSS rule. Iterate until clean.
5. Document the profile and decision in a per-site `*_PERFORMANCE.md` doc (e.g., `AMAZON_PERFORMANCE.md`).

**Sites currently using `fastPath: true`:** `amazon.com`, `business.amazon.com`. See `AMAZON_PERFORMANCE.md` for the full profile and ruleset.
