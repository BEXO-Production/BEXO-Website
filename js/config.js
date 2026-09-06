/**
 * BEXO — Global Configuration and URL Router
 * Development: mybexo.cyou + dash.mybexo.cyou
 * Production:  atbexo.com + mybexo.com + dash.mybexo.com
 */
(function (global) {
  "use strict";

  var host = typeof location !== "undefined" ? location.hostname : "";
  var isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  var isCyou = host === "mybexo.cyou" || host.endsWith(".mybexo.cyou");

  // Production defaults
  var dashOrigin = "https://dash.mybexo.com";
  var portfolioDomain = "atbexo.com";
  var marketingOrigin = "https://atbexo.com";

  if (isLocal) {
    dashOrigin = "http://localhost:5173";
    marketingOrigin = location.origin.replace(/\/$/, "");
  } else if (isCyou) {
    dashOrigin = "https://dash.mybexo.cyou";
    portfolioDomain = "mybexo.cyou";
    marketingOrigin = "https://mybexo.cyou";
  }

  global.BEXO = {
    DASH_ORIGIN: dashOrigin,
    API_ORIGIN: isLocal ? "http://localhost:5001" : dashOrigin,
    PORTFOLIO_DOMAIN: portfolioDomain,
    PORTFOLIO_SUFFIX: "." + portfolioDomain,
    MARKETING_ORIGIN: marketingOrigin,
    BRAND: "BEXO",
    COMPANY: "Ace Digital"
  };

  global.BEXO.loginUrl = function (next) {
    var base = global.BEXO.DASH_ORIGIN + "/login";
    if (next) return base + "?next=" + encodeURIComponent(next);
    return base;
  };

  global.BEXO.checkoutLoginUrl = function (plan) {
    var clean = String(plan || "").toLowerCase().replace(/[^a-z0-9_+-]/g, "");
    if (!clean) return global.BEXO.loginUrl();
    return global.BEXO.loginUrl("/checkout?plan=" + encodeURIComponent(clean));
  };

  global.BEXO.claimLoginUrl = function (handle) {
    var clean = String(handle || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 48);
    var base = global.BEXO.DASH_ORIGIN + "/login";
    if (!clean) return base;
    return base + "?claim=" + encodeURIComponent(clean);
  };

  global.BEXO.apiUrl = function (path) {
    var p = String(path || "");
    if (p.charAt(0) !== "/") p = "/" + p;
    return global.BEXO.API_ORIGIN.replace(/\/$/, "") + p;
  };

  // Wire all login and dashboard links on page load
  function wireInteractiveLinks() {
    var loginUrl = global.BEXO.loginUrl();
    var dashUrl = global.BEXO.DASH_ORIGIN;

    document.querySelectorAll(".bx-nav-login, [data-bx-login]").forEach(function (el) {
      if (!el.getAttribute("href") || el.getAttribute("href") === "#") {
        el.setAttribute("href", loginUrl);
      }
    });

    document.querySelectorAll(".bx-footer-link").forEach(function (el) {
      if (el.textContent.trim().toLowerCase() === "open dashboard") {
        el.setAttribute("href", dashUrl);
      }
    });

    // "Create My Card" / "Create your Card" buttons always pointed at the
    // production dashboard regardless of environment. Route them through
    // the same environment-aware origin as everything else.
    document.querySelectorAll(".bx-nav-cta, .bx-overlay-cta").forEach(function (el) {
      if (el.tagName === "A") el.setAttribute("href", dashUrl);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireInteractiveLinks);
  } else {
    wireInteractiveLinks();
  }
})(typeof window !== "undefined" ? window : this);
