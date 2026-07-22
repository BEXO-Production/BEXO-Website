/**
 * Shared nav + footer for BEXO marketing pages.
 * Set data-root on <html> to "" (home) or "../" (pages/).
 */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var cfg = window.BEXO || {
      DASH_ORIGIN: "https://dash.mybexo.com",
      loginUrl: function () {
        return "https://dash.mybexo.com/login";
      },
      legalUrl: function (p) {
        return "https://dash.mybexo.com/" + p;
      },
    };
    var root = document.documentElement.getAttribute("data-root") || "";
    var login = cfg.loginUrl();
    var active = document.body.getAttribute("data-page") || "home";

    function linkClass(id) {
      return active === id ? "navbar-item is-active" : "navbar-item";
    }

    var navMount = document.getElementById("site-nav");
    if (navMount) {
      navMount.innerHTML =
        '<nav class="navbar" aria-label="Primary">' +
        '<div class="container">' +
        '<div class="navbar-logo">' +
        '<a href="' +
        root +
        'index.html" class="brand-link">' +
        '<img src="' +
        root +
        'assets/bexo-logo.png" alt="BEXO" width="36" height="36" />' +
        "<span>BEXO</span>" +
        "</a>" +
        "</div>" +
        '<div class="navbar-items">' +
        '<input type="checkbox" id="hamburger-toggle" />' +
        '<label for="hamburger-toggle" class="hamburger-icon" aria-label="Open menu">' +
        '<i class="ph-light ph-list"></i>' +
        "</label>" +
        '<ul class="navbar-links">' +
        '<li class="' +
        linkClass("home") +
        '"><a href="' +
        root +
        'index.html">Product</a></li>' +
        '<li class="' +
        linkClass("pricing") +
        '"><a href="' +
        root +
        'pages/pricing.html">Pricing</a></li>' +
        '<li class="' +
        linkClass("about") +
        '"><a href="' +
        root +
        'pages/about.html">About</a></li>' +
        '<li class="' +
        linkClass("stories") +
        '"><a href="' +
        root +
        'pages/customers.html">Stories</a></li>' +
        '<li class="' +
        linkClass("guides") +
        '"><a href="' +
        root +
        'pages/blog.html">Guides</a></li>' +
        '<li class="navbar-item navbar-login"><a class="js-dash-login" href="' +
        login +
        '">Log in</a></li>' +
        '<li><div class="btn"><a class="js-dash-login" href="' +
        login +
        '">Sign up</a></div></li>' +
        "</ul>" +
        "</div>" +
        "</div>" +
        "</nav>";
    }

    var footMount = document.getElementById("site-footer");
    if (footMount) {
      footMount.innerHTML =
        '<footer class="site-footer">' +
        '<div class="container">' +
        '<div class="f-row footer-links">' +
        '<div class="f-logo">' +
        '<a href="' +
        root +
        'index.html" class="brand-link">' +
        '<img src="' +
        root +
        'assets/bexo-logo.png" alt="" width="28" height="28" />' +
        "<span>BEXO</span>" +
        "</a>" +
        '<p class="f-tagline">Placement-ready portfolios from Ace Digital.</p>' +
        "</div>" +
        '<div class="f-links">' +
        '<div class="f-links-col">' +
        "<p>Product</p>" +
        '<a href="' +
        root +
        'index.html#how">How it works</a><br />' +
        '<a href="' +
        root +
        'pages/pricing.html">Pricing</a><br />' +
        '<a class="js-dash-login" href="' +
        login +
        '">Open dashboard</a>' +
        "</div>" +
        '<div class="f-links-col">' +
        "<p>Company</p>" +
        '<a href="' +
        root +
        'pages/about.html">About</a><br />' +
        '<a href="' +
        root +
        'pages/customers.html">Stories</a><br />' +
        '<a href="' +
        root +
        'pages/blog.html">Guides</a>' +
        "</div>" +
        '<div class="f-links-col">' +
        "<p>Legal</p>" +
        '<a href="' +
        cfg.legalUrl("terms") +
        '">Terms</a><br />' +
        '<a href="' +
        cfg.legalUrl("privacy") +
        '">Privacy</a><br />' +
        '<a href="' +
        cfg.legalUrl("refund") +
        '">Refunds</a>' +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="divider"></div>' +
        '<div class="f-ctext">' +
        "<p>© 2026 BEXO From Ace Digital. All rights reserved.</p>" +
        '<p class="f-domain">you.<span>atbexo.com</span></p>' +
        "</div>" +
        "</div>" +
        "</footer>";
    }

    document.querySelectorAll(".js-dash-login").forEach(function (el) {
      el.setAttribute("href", login);
    });
  });
})();
