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
      PORTFOLIO_DOMAIN: "atbexo.com",
      PORTFOLIO_SUFFIX: ".atbexo.com",
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
        '<label for="hamburger-toggle" class="hamburger-icon" aria-label="Open menu" aria-controls="primary-nav">' +
        '<i class="ph-light ph-list"></i>' +
        "</label>" +
        '<ul class="navbar-links" id="primary-nav">' +
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
        '<li class="' +
        linkClass("contact") +
        '"><a href="' +
        root +
        'pages/contact.html">Contact</a></li>' +
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

      var toggle = document.getElementById("hamburger-toggle");
      var label = navMount.querySelector(".hamburger-icon");
      if (toggle && label) {
        var syncNav = function () {
          var open = toggle.checked;
          var menu = document.getElementById("primary-nav");
          document.body.classList.toggle("nav-open", open);
          if (menu) menu.classList.toggle("is-open", open);
          label.setAttribute("aria-label", open ? "Close menu" : "Open menu");
          label.setAttribute("aria-expanded", open ? "true" : "false");
          label.innerHTML = open
            ? '<i class="ph-light ph-x" aria-hidden="true"></i>'
            : '<i class="ph-light ph-list" aria-hidden="true"></i>';
        };
        toggle.addEventListener("change", syncNav);
        navMount.querySelectorAll(".navbar-links a").forEach(function (a) {
          a.addEventListener("click", function () {
            if (toggle.checked) {
              toggle.checked = false;
              syncNav();
            }
          });
        });
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && toggle.checked) {
            toggle.checked = false;
            syncNav();
          }
        });
        syncNav();
      }
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
        'pages/blog.html">Guides</a><br />' +
        '<a href="' +
        root +
        'pages/contact.html">Contact</a>' +
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
        '<p class="f-domain">you.<span>' +
        (cfg.PORTFOLIO_DOMAIN || "atbexo.com") +
        "</span></p>" +
        "</div>" +
        "</div>" +
        "</footer>";
    }

    document.querySelectorAll(".js-dash-login").forEach(function (el) {
      var plan =
        el.getAttribute("data-plan") ||
        (el.closest("[data-plan]") && el.closest("[data-plan]").getAttribute("data-plan"));
      if (plan && typeof cfg.checkoutLoginUrl === "function") {
        el.setAttribute("href", cfg.checkoutLoginUrl(plan));
      } else {
        el.setAttribute("href", login);
      }
    });

    // Sync portfolio / dash host copy from config (staging vs production).
    var portfolio = cfg.PORTFOLIO_DOMAIN || "atbexo.com";
    var suffix = cfg.PORTFOLIO_SUFFIX || "." + portfolio;
    var dashHost = String(cfg.DASH_ORIGIN || "https://dash.mybexo.com").replace(
      /^https?:\/\//,
      "",
    );
    document.querySelectorAll(".handle-suffix, .js-portfolio-suffix").forEach(function (el) {
      el.textContent = suffix;
    });
    document.querySelectorAll(".js-portfolio-domain").forEach(function (el) {
      el.textContent = portfolio;
    });
    document.querySelectorAll(".js-portfolio-host").forEach(function (el) {
      var sample = el.getAttribute("data-sample") || "yourname";
      el.textContent = sample + "." + portfolio;
    });
    document.querySelectorAll(".js-dash-host").forEach(function (el) {
      el.textContent = dashHost;
    });
    document.querySelectorAll(".js-marketing-host").forEach(function (el) {
      var origin = cfg.MARKETING_ORIGIN || "https://mybexo.com";
      el.textContent = String(origin).replace(/^https?:\/\//, "");
    });
  });
})();
