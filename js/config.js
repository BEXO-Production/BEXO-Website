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

  global.BEXO = {
    DASH_ORIGIN: isLocal
      ? "http://localhost:5173"
      : isCyou
        ? "https://dash.mybexo.cyou"
        : "https://dash.mybexo.com",
    /** Public API (handle checks from marketing). Local → API; hosted → dash rewrites. */
    API_ORIGIN: isLocal
      ? "http://localhost:5001"
      : isCyou
        ? "https://dash.mybexo.cyou"
        : "https://dash.mybexo.com",
    PORTFOLIO_DOMAIN: isCyou ? "mybexo.cyou" : "atbexo.com",
    MARKETING_ORIGIN: isLocal
      ? location.origin.replace(/\/$/, "")
      : isCyou
        ? "https://mybexo.cyou"
        : "https://mybexo.com",
    BRAND: "BEXO",
    COMPANY: "Ace Digital",
  };

  global.BEXO.loginUrl = function (next) {
    var base = global.BEXO.DASH_ORIGIN + "/login";
    if (next) return base + "?next=" + encodeURIComponent(next);
    return base;
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
