// ==UserScript==
// @name         Amazon Business Prime Dark Mode
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  High-contrast dark mode for amazon.com (Business Prime / Punchout / consumer / product detail / cart / checkout / orders) â€” nuclear approach.
//               Color palette: AWS Cloudscape "Polaris Dark Mode" tokens v3.3.
// @author       BarnsAWS
// @match        https://www.amazon.com/*
// @match        https://amazon.com/*
// @match        https://smile.amazon.com/*
// @match        https://business.amazon.com/*
// @match        https://www.amazon.com/ref=nodl_punchout*
// @match        https://www.amazon.com/ap/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // === EARLY PAINT (v1.7) — sync <html> background on first script line === 
    try {
        if (document.documentElement) {
            document.documentElement.style.backgroundColor = '#161d26';
            document.documentElement.style.colorScheme = 'dark';
        }
    } catch (_) {}

    // ===== PRE-FLASH PAINT (v1.7 — synchronous, before DOM tree exists) =====
    // Sets <html> background-color BEFORE the browser parses any other markup.
    // Eliminates the sub-100ms light flash on heavy Amazon pages.
    // See FLASH_FIX_INVESTIGATION.md in the bundle repo.
    try {
        if (document.documentElement) {
            document.documentElement.style.backgroundColor = '#161d26';
            document.documentElement.style.colorScheme = 'dark';
        }
    } catch (_) { /* noop */ }

    const SCRIPT_NAME = 'Amazon Business Prime Dark Mode';
    const STYLE_ID = 'amazon-business-prime-dark-mode-style';

    function activateCloudscapeFlag() {
        try {
            if (document.documentElement) {
                document.documentElement.style.colorScheme = 'dark';
                document.documentElement.setAttribute('data-color-scheme', 'dark');
            }
            if (document.body) {
                document.body.classList.add('awsui-polaris-dark-mode');
                document.body.classList.add('awsui-visual-refresh');
            }
        } catch (_) { /* noop */ }
    }

    // Source pattern: Amazon AWS Dark Mode Standard v3.3 - Core CSS + Sub-Component Coverage
    const DARK_CSS = `
    *:not(svg):not(svg *):not(img):not(video):not(canvas) {
        color: #c6c6cd !important;
        -webkit-text-fill-color: #c6c6cd !important;
    }
    * { border-color: #424650 !important; }
    html, body {
        background-color: #161d26 !important;
        color-scheme: dark !important;
    }

    div, section, article, aside, main, footer,
    header, nav, form, fieldset, ul, ol, li,
    table, thead, tbody, tfoot, tr, th, td,
    span, p, h1, h2, h3, h4, h5, h6,
    details, summary, figure, figcaption,
    blockquote, pre, code {
        background-color: transparent !important;
    }

    h1 { color: #f9f9fa !important; -webkit-text-fill-color: #f9f9fa !important; }
    h2, h3 { color: #ebebf0 !important; -webkit-text-fill-color: #ebebf0 !important; }
    h4, h5, h6 { color: #dedee3 !important; -webkit-text-fill-color: #dedee3 !important; }

    a, a *, [role="link"], [role="link"] * {
        color: #42b4ff !important;
        -webkit-text-fill-color: #42b4ff !important;
        text-decoration-color: #42b4ff !important;
    }
    a:hover, a:hover *, [role="link"]:hover, [role="link"]:hover * {
        color: #89cbff !important;
        -webkit-text-fill-color: #89cbff !important;
    }

    /* Inputs (v3.1) */
    input, textarea, select,
    [role="combobox"], [role="spinbutton"],
    [role="textbox"]:not([contenteditable="true"]),
    [class*="select-trigger"], [class*="dropdown-trigger"],
    [class*="form-control"], [class*="select-field"],
    [class*="text-field"]:not(label),
    [class*="awsui_input"], [class*="awsui_select"], [class*="awsui_textarea"] {
        background-color: #0a0f15 !important;
        background-image: none !important;
        color: #c6c6cd !important;
        -webkit-text-fill-color: #c6c6cd !important;
        border: 1px solid #656871 !important;
        caret-color: #f9f9fa !important;
    }
    input::placeholder, textarea::placeholder {
        color: #8c8c94 !important;
        -webkit-text-fill-color: #8c8c94 !important;
        opacity: 1 !important;
    }
    input:focus, textarea:focus, select:focus,
    [role="combobox"]:focus, [class*="select-trigger"]:focus, [class*="dropdown-trigger"]:focus {
        border-color: #42b4ff !important;
        outline: 2px solid #42b4ff !important;
        outline-offset: 1px !important;
    }

    /* Buttons */
    button, input[type="submit"], input[type="button"], .btn, [role="button"] {
        background-color: #161d26 !important;
        background-image: none !important;
        color: #42b4ff !important;
        -webkit-text-fill-color: #42b4ff !important;
        border-color: #42b4ff !important;
    }
    button:hover, .btn:hover, [role="button"]:hover {
        background-color: #232b37 !important;
    }
    button[class*="primary"], [class*="variant-primary"],
    [class*="awsui_variant-primary"], button[class*="Connect"] {
        background-color: #ff9900 !important;
        background-image: none !important;
        color: #0f141a !important;
        -webkit-text-fill-color: #0f141a !important;
        border-color: #ff9900 !important;
        border-radius: 20px !important;
    }
    button[class*="primary"]:hover, [class*="variant-primary"]:hover {
        background-color: #ffac33 !important;
        border-color: #ffac33 !important;
    }
    button:disabled, button[disabled], [class*="disabled"] {
        background-color: #161d26 !important;
        color: #8c8c94 !important;
        -webkit-text-fill-color: #8c8c94 !important;
        border-color: #656871 !important;
    }


    /* ===== AMAZON RETAIL BRAND PRESERVATION (v1.4) =====
       Amazon.com uses Amazon Yellow (#ffd814) for buy-box CTAs (Add to Cart,
       Buy Now, Continue) - NOT Cloudscape orange. This block preserves the
       Amazon Yellow brand color for the retail buy-box buttons. */
    #add-to-cart-button, #buy-now-button,
    [name="submit.buy-now"], [name="submit.add-to-cart"],
    [data-action="a-button-yellow"], .a-button-yellow .a-button-inner,
    .a-button-yellow .a-button-text,
    [class*="button-yellow"], [id*="buybox-action-buybox"] {
        background-color: #ffd814 !important;
        background-image: linear-gradient(to bottom, #f7ca00, #f0b800) !important;
        color: #0f1111 !important;
        -webkit-text-fill-color: #0f1111 !important;
        border-color: #fcd200 !important;
    }

    /* ===== AMAZON CLASS TAXONOMY (v1.5 — CSS-first fast path) =====
       Amazon's search-results page is 2 MB+ HTML with 5000+ elements,
       1272 .a-section, 102 .a-box, 68 .s-result-item nodes. The generic
       [class*="card"] selectors don't match Amazon's class taxonomy, and
       walking every element with getComputedStyle was the dark-mode-load
       bottleneck. v1.5 covers Amazon's classes directly with CSS so the
       theme paints at document-start with zero JS surface enumeration on
       Amazon pages. See AMAZON_PERFORMANCE.md for the full profile. */
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
    /* Result tiles get card surface */
    .a-box-group, .a-box.a-spacing-base,
    .s-result-item.s-asin, .s-card-container,
    .puis-card-container, .a-cardui {
        background-color: #1b232d !important;
        border: 1px solid #424650 !important;
    }
    .s-result-item:hover, .puis-card-container:hover {
        background-color: #232b37 !important;
    }
    /* Top bar + search */
    #navbar-main, #nav-belt, #nav-main, .nav-sprite-v1,
    #navbar.nav-fixed, .nav-progressive-content {
        background-color: #161d26 !important;
        background-image: none !important;
        border-bottom: 1px solid #424650 !important;
    }
    #twotabsearchtextbox, .nav-search-field input,
    input[name="field-keywords"] {
        background-color: #0a0f15 !important;
        color: #c6c6cd !important;
        -webkit-text-fill-color: #c6c6cd !important;
        border: 1px solid #656871 !important;
    }
    #searchDropdownBox, .nav-search-dropdown select {
        background-color: #0a0f15 !important;
        color: #c6c6cd !important;
        border: 1px solid #656871 !important;
    }
    /* Amazon-specific text colors */
    .a-color-base, .a-color-secondary, .a-color-tertiary,
    .a-text-bold, .a-text-normal,
    #productTitle, #title, .product-title-word-break {
        color: #c6c6cd !important;
        -webkit-text-fill-color: #c6c6cd !important;
    }
    .a-color-link {
        color: #42b4ff !important;
        -webkit-text-fill-color: #42b4ff !important;
    }
    /* PRESERVE: price red, savings green, prime blue */
    .a-price-whole, .a-price-fraction, .a-price-symbol,
    .a-color-price {
        color: #ff7a7a !important;
        -webkit-text-fill-color: #ff7a7a !important;
    }
    .a-color-success {
        color: #00b894 !important;
        -webkit-text-fill-color: #00b894 !important;
    }
    /* Popovers / modals */
    .a-popover, .a-popover-inner, .a-popover-content,
    .a-modal, .a-modal-scroller {
        background-color: #1b232d !important;
        background-image: none !important;
        border-color: #424650 !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.6) !important;
    }
    /* Filter rail */
    #s-refinements, .s-refinements,
    #leftNav, .left-nav, .a-filter-by {
        background-color: #161d26 !important;
    }
    /* Footer */
    #navFooter a, #navFooter a:link {
        color: #42b4ff !important;
        -webkit-text-fill-color: #42b4ff !important;
    }

    /* Cards */
    [class*="card"], [class*="Card"],
    [class*="tile"], [class*="Tile"],
    [class*="awsui_container"], [class*="awsui_root"],
    [class*="awsui_box"], [class*="awsui_content-wrapper"],
    [class*="container"]:not([class*="Container-fluid"]),
    [data-test-component*="Card"] {
        background-color: #1b232d !important;
        background-image: none !important;
        border: 1px solid #424650 !important;
    }

    /* v3.3 Sub-component coverage */
    [class*="card"] header, [class*="card"] [class*="header"]:not(input):not([class*="page-header"]):not([class*="app-header"]):not([class*="topbar"]),
    [class*="card"] [class*="title"], [class*="card"] [class*="Title"],
    [class*="card"] [class*="body"]:not(input):not(textarea):not(button),
    [class*="card"] [class*="Body"]:not(input):not(textarea):not(button),
    [class*="card"] [class*="content"]:not(input):not(textarea):not(button),
    [class*="card"] [class*="Content"]:not(input):not(textarea):not(button),
    [class*="card"] [class*="footer"]:not(input):not(textarea):not(button),
    [class*="Card"] header, [class*="Card"] [class*="header"]:not(input):not([class*="page-header"]):not([class*="app-header"]):not([class*="topbar"]),
    [class*="Card"] [class*="title"], [class*="Card"] [class*="body"]:not(input):not(textarea):not(button),
    [class*="Card"] [class*="content"]:not(input):not(textarea):not(button),
    [class*="awsui_container"] header, [class*="awsui_container"] [class*="header"],
    [class*="awsui_container"] [class*="title"],
    [class*="awsui_container"] [class*="content"]:not(input):not(textarea):not(button),
    [class*="awsui_container"] [class*="footer"]:not(input):not(textarea):not(button) {
        background-color: transparent !important;
        background-image: none !important;
    }
    [class*="card"] [class*="title"], [class*="Card"] [class*="title"],
    [class*="awsui_container"] [class*="title"] {
        color: #ebebf0 !important;
        -webkit-text-fill-color: #ebebf0 !important;
    }

    /* Awsui list rows */
    [class*="awsui_list-item"], [class*="awsui_list-row"],
    [class*="awsui_row"]:not(thead [class*="awsui_row"]) {
        background-color: #1b232d !important;
        background-image: none !important;
    }

    /* Tables + ARIA grids */
    table, th, td, tr {
        background-color: #1b232d !important;
        border-color: #424650 !important;
    }
    tr:nth-child(even), [role="row"]:nth-child(even),
    [role="listitem"]:nth-child(even),
    [class*="list-row"]:nth-child(even),
    [class*="row-item"]:nth-child(even) {
        background-color: #232b37 !important;
    }
    th, [role="columnheader"] {
        background-color: #232b37 !important;
        color: #ebebf0 !important;
        -webkit-text-fill-color: #ebebf0 !important;
    }
    tr:hover, [role="row"]:hover, [role="listitem"]:hover {
        background-color: #232b37 !important;
    }

    /* Modals/menus/popovers */
    [role="dialog"], [role="menu"], [role="listbox"], [role="tooltip"],
    [class*="modal"], [class*="Modal"],
    [class*="overlay"], [class*="Overlay"],
    [class*="popup"], [class*="Popup"],
    [class*="popover"], [class*="Popover"],
    [class*="menu"]:not([class*="menu-trigger"]):not([class*="menu-button"]),
    [class*="Menu"]:not([class*="MenuTrigger"]):not([class*="MenuButton"]),
    [class*="dropdown"]:not([class*="dropdown-trigger"]),
    [class*="Dropdown"]:not([class*="DropdownTrigger"]),
    [class*="awsui_dropdown"]:not([class*="trigger"]),
    [class*="awsui_popover"] {
        background-color: #1b232d !important;
        background-image: none !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6) !important;
    }
    [role="menuitem"]:hover { background-color: #232b37 !important; }

    /* Sidebar */
    aside, [class*="sidebar"], [class*="Sidebar"],
    [class*="side-nav"], [class*="SideNav"],
    [class*="awsui_navigation"], [class*="awsui_drawer"],
    nav[aria-label] {
        background-color: #161d26 !important;
        background-image: none !important;
        border-right: 1px solid #424650 !important;
    }
    aside *, [class*="sidebar"] *, [class*="side-nav"] *,
    [class*="awsui_navigation"] *, nav[aria-label] * {
        background-color: transparent !important;
    }
    aside [role="menuitem"]:hover, aside li:hover,
    [class*="sidebar"] [role="menuitem"]:hover, [class*="sidebar"] li:hover,
    [class*="awsui_navigation"] [role="menuitem"]:hover,
    [class*="awsui_navigation"] li:hover,
    nav[aria-label] [role="menuitem"]:hover,
    nav[aria-label] li:hover {
        background-color: #1b232d !important;
    }

    /* Top bar */
    [class*="topbar"], [class*="TopBar"],
    [class*="top-navigation"], [class*="TopNavigation"],
    [class*="awsui_top-navigation"],
    [class*="header"][class*="awsui"] {
        background-color: #161d26 !important;
        background-image: none !important;
        border-bottom-color: #424650 !important;
    }

    /* Alerts */
    [role="alert"][class*="error"], [class*="type-error"],
    [class*="alert-error"], [class*="flash-error"],
    [class*="awsui_type-error"] {
        background-color: #1f0000 !important;
        background-image: none !important;
        border-color: #ff7a7a !important;
        border-left-width: 3px !important;
        border-radius: 12px !important;
    }
    [role="alert"][class*="info"], [class*="type-info"],
    [class*="alert-info"], [class*="flash-info"],
    [class*="awsui_type-info"] {
        background-color: #001129 !important;
        background-image: none !important;
        border-color: #42b4ff !important;
        border-left-width: 3px !important;
        border-radius: 12px !important;
    }

    /* Tabs */
    [role="tab"] {
        color: #8c8c94 !important;
        -webkit-text-fill-color: #8c8c94 !important;
    }
    [role="tab"][aria-selected="true"], [role="tab"][aria-current="true"] {
        background-color: transparent !important;
        background-image: none !important;
        color: #f9f9fa !important;
        -webkit-text-fill-color: #f9f9fa !important;
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
        border-bottom: 2px solid #42b4ff !important;
    }

    /* Listbox options */
    [role="option"]:hover { background-color: #232b37 !important; }
    [role="option"][aria-selected="true"] {
        background-color: #232b37 !important;
        background-image: none !important;
        color: #f9f9fa !important;
        -webkit-text-fill-color: #f9f9fa !important;
    }

    /* In-content selected (v3.2) */
    [aria-selected="true"]:not([role="tab"]):not([role="option"]),
    [aria-current="true"]:not([role="tab"]),
    [aria-current="page"]:not([role="tab"]),
    [aria-current="step"]:not([role="tab"]),
    [aria-current="location"]:not([role="tab"]),
    [class*="selected"]:not(button):not(input):not(label):not([role="tab"]):not([role="option"]),
    [class*="-active"]:not(button):not(input):not([role="tab"]):not([class*="-inactive"]),
    [class*="is-active"]:not(button):not(input):not([role="tab"]),
    [class*="is-selected"]:not(button):not(input):not([role="tab"]) {
        background-color: #001129 !important;
        background-image: none !important;
        color: #f9f9fa !important;
        -webkit-text-fill-color: #f9f9fa !important;
        border-left: 3px solid #42b4ff !important;
        border-right: none !important;
        border-top: none !important;
        border-bottom: none !important;
    }
    [aria-selected="true"]:not([role="tab"]):not([role="option"]) *:not(svg):not(svg *),
    [aria-current="true"]:not([role="tab"]) *:not(svg):not(svg *),
    [aria-current="page"]:not([role="tab"]) *:not(svg):not(svg *),
    [class*="selected"]:not([role="tab"]):not([role="option"]) *:not(svg):not(svg *):not(button):not(input),
    [class*="-active"]:not([role="tab"]) *:not(svg):not(svg *):not(button):not(input),
    [class*="is-active"]:not([role="tab"]) *:not(svg):not(svg *):not(button):not(input),
    [class*="is-selected"]:not([role="tab"]) *:not(svg):not(svg *):not(button):not(input) {
        background-color: transparent !important;
        background-image: none !important;
        color: #f9f9fa !important;
        -webkit-text-fill-color: #f9f9fa !important;
    }

    /* Sidebar selected (v3.1) */
    aside [aria-selected="true"], aside [aria-current="true"], aside [aria-current="page"],
    aside [class*="selected"]:not(button):not(input),
    aside [class*="active"]:not(button):not(input),
    [class*="sidebar"] [aria-selected="true"], [class*="sidebar"] [aria-current="true"],
    [class*="sidebar"] [aria-current="page"],
    [class*="sidebar"] [class*="selected"]:not(button):not(input),
    [class*="sidebar"] [class*="active"]:not(button):not(input),
    [class*="awsui_navigation"] [aria-current="page"],
    [class*="awsui_navigation"] [aria-selected="true"],
    [class*="awsui_navigation"] [class*="selected"]:not(button):not(input),
    [class*="awsui_navigation"] [class*="active"]:not(button):not(input),
    nav[aria-label] [aria-current="page"],
    nav[aria-label] [aria-selected="true"],
    nav[aria-label] [class*="selected"]:not(button):not(input) {
        background-color: #0a0f15 !important;
        background-image: none !important;
        color: #f9f9fa !important;
        -webkit-text-fill-color: #f9f9fa !important;
        border-left: 4px solid #42b4ff !important;
    }

    /* Chat bubbles */
    [class*="message-bubble"], [class*="MessageBubble"],
    [class*="chat-bubble"], [class*="user-message"] {
        background-color: #232b37 !important;
        background-image: none !important;
        border-color: #424650 !important;
    }

    /* Progress */
    [role="progressbar"], [class*="progress"], [class*="Progress"],
    [class*="slider-track"] {
        background-color: #656871 !important;
    }
    [role="progressbar"] > *, [class*="progress"] > *:first-child,
    [class*="slider-range"], [class*="progress-fill"] {
        background-color: #42b4ff !important;
    }

    /* Badges */
    [class*="badge-color-green"], [class*="status-success"] {
        background-color: #00802f !important;
        color: #f9f9fa !important;
        -webkit-text-fill-color: #f9f9fa !important;
        border-radius: 4px !important;
    }
    [class*="badge-color-red"], [class*="status-error"] {
        background-color: #5a0000 !important;
        color: #ff7a7a !important;
        -webkit-text-fill-color: #ff7a7a !important;
        border-radius: 4px !important;
    }
    [class*="badge-color-blue"], [class*="status-info"] {
        background-color: #001129 !important;
        color: #42b4ff !important;
        -webkit-text-fill-color: #42b4ff !important;
        border-radius: 4px !important;
    }

    /* Breadcrumbs */
    [class*="breadcrumb"] a, [class*="breadcrumb"] [role="link"] {
        color: #42b4ff !important;
        -webkit-text-fill-color: #42b4ff !important;
    }
    [class*="breadcrumb"] span:not([role="link"]),
    [class*="breadcrumb"] [class*="last"] {
        color: #8c8c94 !important;
        -webkit-text-fill-color: #8c8c94 !important;
    }

    /* Inline overrides */
    [style*="color: rgb(0, 0, 0)"],
    [style*="color:rgb(0,0,0)"],
    [style*="color: black"],
    [style*="color:#000"] {
        color: #c6c6cd !important;
        -webkit-text-fill-color: #c6c6cd !important;
    }
    [style*="background-color: rgb(255, 255, 255)"],
    [style*="background-color: rgba(255, 255, 255"],
    [style*="background-color: white"],
    [style*="background:#fff"], [style*="background: #fff"],
    [style*="background:#ffffff"], [style*="background: #ffffff"],
    [style*="background: white"],
    [style*="background-color:#fff"], [style*="background-color: #fff"],
    [style*="background-color:#ffffff"], [style*="background-color: #ffffff"] {
        background-color: #1b232d !important;
        background-image: none !important;
    }
    [style*="background-color: rgb(245"],
    [style*="background-color: rgb(248"],
    [style*="background-color: rgb(250"],
    [style*="background-color: rgb(252"] {
        background-color: #1b232d !important;
        background-image: none !important;
    }
    [style*="background-color: rgb(240"],
    [style*="background-color: rgb(235"],
    [style*="background-color: rgb(230"],
    [style*="background-color: rgb(225"],
    [style*="background-color: rgb(220"] {
        background-color: #232b37 !important;
        background-image: none !important;
    }
    [style*="linear-gradient"][style*="white"],
    [style*="linear-gradient"][style*="#fff"],
    [style*="linear-gradient"][style*="rgb(255"],
    [style*="background-image"][style*="white"],
    [style*="background-image"][style*="#fff"],
    [style*="background-image"][style*="rgb(255"] {
        background-image: none !important;
        background-color: #1b232d !important;
    }
    [style*="rgba(151"], [style*="rgba(155"], [style*="rgba(146"],
    [style*="rgba(160"], [style*="rgba(170"] {
        background-color: #001129 !important;
    }

    img, video, canvas, picture {
        background-color: transparent !important;
        filter: none !important;
    }

    ::-webkit-scrollbar { width: 10px; height: 10px; background: #161d26; }
    ::-webkit-scrollbar-track { background: #161d26; }
    ::-webkit-scrollbar-thumb { background: #424650; border-radius: 5px; }
    ::-webkit-scrollbar-thumb:hover { background: #656871; }
    * { scrollbar-color: #424650 #161d26; scrollbar-width: thin; }
    `;

    function log() {
        try {
            var args = Array.prototype.slice.call(arguments);
            args.unshift('[' + SCRIPT_NAME + ']');
            console.debug.apply(console, args);
        } catch (_) { /* noop */ }
    }

    function injectGlobalCSS() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.type = 'text/css';
        style.textContent = DARK_CSS;
        var target = document.head || document.documentElement;
        if (target) target.appendChild(style);
        if (typeof GM_addStyle !== 'undefined') {
            try { GM_addStyle(DARK_CSS); } catch (e) { log('GM_addStyle failed:', e && e.message); }
        }
    }

    // Source pattern: Cloudscape Dark Mode Standard v3.3 - Light-Surface Detector
    function isLightSurface(computed) {
        if (!computed) return { isLight: false, lum: 0, isImage: false };
        var bg = computed.backgroundColor;
        var bgImage = computed.backgroundImage;
        var m = bg && bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (m) {
            var r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
            var a = m[4] !== undefined ? parseFloat(m[4]) : 1;
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
                        var rr = parseInt(rm[1], 10), gg = parseInt(rm[2], 10), bb = parseInt(rm[3], 10);
                        var slum = rr * 0.299 + gg * 0.587 + bb * 0.114;
                        if (slum > 200) return { isLight: true, lum: slum, isImage: true };
                    }
                }
            }
        }
        return { isLight: false, lum: 0, isImage: false };
    }

    // Source pattern: Cloudscape Dark Mode Standard v3.3 - Aggressive Surface Enforcement
    function enforceDarkSurfaces(root) {
        var scope = root || document;
        var all;
        try { all = scope.querySelectorAll('*'); } catch (_) { return; }
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            var tag = el.tagName ? el.tagName.toUpperCase() : '';
            if (tag === 'IMG' || tag === 'VIDEO' || tag === 'CANVAS' || tag === 'SVG' ||
                tag === 'PATH' || tag === 'CIRCLE' || tag === 'RECT' || tag === 'POLYGON' ||
                tag === 'LINE' || tag === 'POLYLINE' || tag === 'ELLIPSE' || tag === 'G' ||
                tag === 'DEFS' || tag === 'USE' || tag === 'SYMBOL' || tag === 'CLIPPATH' ||
                tag === 'MASK') continue;
            if (el.closest && el.closest('svg')) continue;
            var computed;
            try { computed = window.getComputedStyle(el); } catch (_) { continue; }
            var info = isLightSurface(computed);
            if (!info.isLight) continue;
            if (info.isImage) {
                try { el.style.setProperty('background-image', 'none', 'important'); } catch (_) {}
            }
            var target = info.lum > 140 ? '#1b232d' : '#232b37';
            try { el.style.setProperty('background-color', target, 'important'); } catch (_) {}
            var color = computed.color;
            var cm = color && color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (cm) {
                var cr = parseInt(cm[1], 10), cg = parseInt(cm[2], 10), cb = parseInt(cm[3], 10);
                var cLum = cr * 0.299 + cg * 0.587 + cb * 0.114;
                if (cLum < 100) {
                    var isLink = (tag === 'A') || (el.closest && el.closest('a, [role="link"]'));
                    try {
                        el.style.setProperty('color', isLink ? '#42b4ff' : '#c6c6cd', 'important');
                        el.style.setProperty('-webkit-text-fill-color', isLink ? '#42b4ff' : '#c6c6cd', 'important');
                    } catch (_) {}
                }
            }
        }
    }

    // v1.5 AMAZON_FAST_PATH: skip per-element JS walk on amazon.com.
    // The CSS class-taxonomy block above covers all Amazon surfaces, so the
    // 5000-element getComputedStyle pass is wasted work. See AMAZON_PERFORMANCE.md.
    var __amazonFastPath = /(^|\.)amazon\.com$/i.test(location.hostname);
    function nuclearDarkMode() {
        if (__amazonFastPath) return;
        enforceDarkSurfaces(document);
    }

    function forceTopBarDark() {
        var topSelectors = 'body > div:first-child, body > header, body > nav, ' +
            '[id*="header"], [class*="header"], [class*="navbar"], [class*="topbar"], ' +
            '[class*="top-navigation"], [class*="awsui_top-navigation"]';
        document.querySelectorAll(topSelectors).forEach(function(el) {
            try {
                el.style.setProperty('background-color', '#161d26', 'important');
                el.style.setProperty('background-image', 'none', 'important');
            } catch (_) {}
        });
        document.querySelectorAll('div, header, nav, ul').forEach(function(el) {
            var pos, top, h;
            try {
                pos = window.getComputedStyle(el).position;
                top = el.getBoundingClientRect().top;
                h = el.offsetHeight;
            } catch (_) { return; }
            if ((pos === 'fixed' || pos === 'sticky' || pos === 'absolute') && top < 100) {
                el.style.setProperty('background-color', '#161d26', 'important');
                el.style.setProperty('background-image', 'none', 'important');
            }
            if (top >= 0 && top < 80 && h > 20 && h < 100) {
                var elBg;
                try { elBg = window.getComputedStyle(el).backgroundColor; } catch (_) { return; }
                var m = elBg && elBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (m) {
                    var l = parseInt(m[1], 10) * 0.299 + parseInt(m[2], 10) * 0.587 + parseInt(m[3], 10) * 0.114;
                    if (l > 50) {
                        el.style.setProperty('background-color', '#161d26', 'important');
                        el.style.setProperty('background-image', 'none', 'important');
                    }
                }
            }
        });
    }

    function forceInlineControlsDark() {
        var sel = 'input, textarea, select, [role="combobox"], [role="textbox"], ' +
                  '[class*="select-trigger"], [class*="dropdown-trigger"], ' +
                  '[class*="form-control"], [class*="select-field"], [class*="awsui_input"]';
        document.querySelectorAll(sel).forEach(function(el) {
            try {
                el.style.setProperty('background-color', '#0a0f15', 'important');
                el.style.setProperty('background-image', 'none', 'important');
                el.style.setProperty('border', '1px solid #656871', 'important');
                el.style.setProperty('color', '#c6c6cd', 'important');
                el.style.setProperty('-webkit-text-fill-color', '#c6c6cd', 'important');
            } catch (_) {}
        });
    }

    function forceSelectedRowsDark() {
        var sel = '[aria-selected="true"]:not([role="tab"]):not([role="option"]), ' +
                  '[aria-current="true"]:not([role="tab"]), ' +
                  '[aria-current="page"]:not([role="tab"]), ' +
                  '[class*="selected"]:not(button):not(input):not(label):not([role="tab"]):not([role="option"]), ' +
                  '[class*="is-active"]:not(button):not(input):not([role="tab"]), ' +
                  '[class*="is-selected"]:not(button):not(input):not([role="tab"])';
        document.querySelectorAll(sel).forEach(function(el) {
            if (el.closest && el.closest('aside, [class*="sidebar"], [class*="side-nav"], [class*="awsui_navigation"], nav[aria-label]')) {
                try {
                    el.style.setProperty('background-color', '#0a0f15', 'important');
                    el.style.setProperty('background-image', 'none', 'important');
                    el.style.setProperty('border-left', '4px solid #42b4ff', 'important');
                    el.style.setProperty('color', '#f9f9fa', 'important');
                    el.style.setProperty('-webkit-text-fill-color', '#f9f9fa', 'important');
                } catch (_) {}
                return;
            }
            try {
                el.style.setProperty('background-color', '#001129', 'important');
                el.style.setProperty('background-image', 'none', 'important');
                el.style.setProperty('border-left', '3px solid #42b4ff', 'important');
                el.style.setProperty('color', '#f9f9fa', 'important');
                el.style.setProperty('-webkit-text-fill-color', '#f9f9fa', 'important');
            } catch (_) {}
        });
    }

    function pierceShadowRoots(root) {
        if (!root || !root.querySelectorAll) return;
        var hosts;
        try { hosts = root.querySelectorAll('*'); } catch (_) { return; }
        for (var i = 0; i < hosts.length; i++) {
            var host = hosts[i];
            if (host.shadowRoot) {
                try {
                    if (!host.shadowRoot.getElementById(STYLE_ID + '-shadow')) {
                        var s = document.createElement('style');
                        s.id = STYLE_ID + '-shadow';
                        s.textContent = DARK_CSS;
                        host.shadowRoot.appendChild(s);
                    }
                    enforceDarkSurfaces(host.shadowRoot);
                } catch (_) { /* closed shadow root */ }
            }
        }
    }

    // Source pattern: Cloudscape Dark Mode Standard v3.3 - Tight-Loop Style Observer
    function attachTightStyleObserver() {
        if (__amazonFastPath) return;   // not needed when CSS covers all surfaces
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
        } catch (_) { /* noop */ }
    }

    function init() {
        log('Initializing v1.6 (fastPath CSS-only on amazon.com)');
        activateCloudscapeFlag();
        injectGlobalCSS();
        // v1.6: on amazon.com, CSS covers all surfaces — skip JS passes entirely.
        if (__amazonFastPath) {
            try { console.debug('[Amazon Business Prime Dark Mode] fastPath: CSS-only mode'); } catch (_) {}
            return;
        }
        nuclearDarkMode();
        forceTopBarDark();
        forceInlineControlsDark();
        forceSelectedRowsDark();
        pierceShadowRoots(document);
        attachTightStyleObserver();

        var observer = new MutationObserver(function() {
            clearTimeout(observer._t);
            observer._t = setTimeout(function() {
                activateCloudscapeFlag();
                nuclearDarkMode();
                forceTopBarDark();
                forceInlineControlsDark();
                forceSelectedRowsDark();
                pierceShadowRoots(document);
            }, 250);
        });
        try {
            observer.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'aria-selected', 'aria-current', 'data-state', 'data-active', 'data-selected']
            });
        } catch (e) { log('Observer attach failed:', e && e.message); }

        var classObserver = new MutationObserver(function() {
            if (document.body && !document.body.classList.contains('awsui-polaris-dark-mode')) {
                document.body.classList.add('awsui-polaris-dark-mode');
            }
        });
        try {
            classObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        } catch (_) { /* noop */ }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    if (!__amazonFastPath) {
        window.addEventListener('load', function() {
            setTimeout(function() { nuclearDarkMode(); forceTopBarDark(); forceInlineControlsDark(); forceSelectedRowsDark(); pierceShadowRoots(document); }, 500);
            setTimeout(function() { nuclearDarkMode(); forceTopBarDark(); forceInlineControlsDark(); forceSelectedRowsDark(); pierceShadowRoots(document); }, 1500);
            setTimeout(function() { nuclearDarkMode(); forceTopBarDark(); forceInlineControlsDark(); forceSelectedRowsDark(); pierceShadowRoots(document); }, 3000);
        });
    }
})();
