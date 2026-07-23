/**
 * BEXO marketing site — URL map.
 * Development: mybexo.cyou + dash.mybexo.cyou + *.mybexo.cyou
 * Production:  mybexo.com + dash.mybexo.com + *.atbexo.com
 */
(function (global) {
  var host = typeof location !== "undefined" ? location.hostname : "";
  var isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  var isCyou = host === "mybexo.cyou" || host.endsWith(".mybexo.cyou");

  // Production defaults (also used when host is not staging/local).
  var dashOrigin = "https://dash.mybexo.com";
  var portfolioDomain = "atbexo.com";
  var marketingOrigin = "https://mybexo.com";
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
    /** Public API (handle checks from marketing). Local → API; hosted → dash rewrites. */
    API_ORIGIN: isLocal ? "http://localhost:5001" : dashOrigin,
    /** Portfolio subdomain apex, e.g. atbexo.com → yourname.atbexo.com */
    PORTFOLIO_DOMAIN: portfolioDomain,
    /** Leading-dot suffix for UI, e.g. ".atbexo.com" */
    PORTFOLIO_SUFFIX: "." + portfolioDomain,
    MARKETING_ORIGIN: marketingOrigin,
    BRAND: "BEXO",
    COMPANY: "Ace Digital",
  };

  global.BEXO.loginUrl = function (next) {
    var base = global.BEXO.DASH_ORIGIN + "/login";
    if (next) return base + "?next=" + encodeURIComponent(next);
    return base;
  };

  /** Deep-link into dash checkout for a specific plan. */
  global.BEXO.checkoutLoginUrl = function (plan) {
    var clean = String(plan || "")
      .toLowerCase()
      .replace(/[^a-z0-9_+-]/g, "");
    if (!clean) return global.BEXO.loginUrl();
    return global.BEXO.loginUrl("/checkout?plan=" + encodeURIComponent(clean));
  };

  /** Sign up while carrying a handle claim into onboarding. */
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

  global.BEXO.legalUrl = function (path) {
    return global.BEXO.DASH_ORIGIN + "/" + String(path || "").replace(/^\//, "");
  };
})(typeof window !== "undefined" ? window : this);
