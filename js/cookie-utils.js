/**
 * BEXO — Cookie Utilities
 * Real document.cookie CRUD with proper security attributes.
 * Every cookie the marketing site sets flows through these helpers.
 */
(function () {
  "use strict";

  var IS_SECURE = location.protocol === "https:";

  /* ─── Cookie Registry ───────────────────────────────────────────
     Single source of truth for every cookie the site may set.
     category: "essential" (always allowed) | "functional" (needs "all" consent)
  ──────────────────────────────────────────────────────────────── */
  var REGISTRY = {
    bx_consent: { category: "essential", days: 365, desc: "Stores your cookie-consent choice" },
    bx_theme:   { category: "essential", days: 365, desc: "Remembers light / dark mode" },
    bx_prefs:   { category: "functional", days: 365, desc: "UI preferences (reduced-motion, locale)" },
    bx_count:   { category: "functional", days: 1,   desc: "Anonymous page-view counter" }
  };

  /* ─── Low-level helpers ─────────────────────────────────────── */

  /**
   * Set a real browser cookie.
   * @param {string} name
   * @param {string} value
   * @param {Object} [opts] – { days, path, sameSite, secure }
   */
  function setCookie(name, value, opts) {
    opts = opts || {};
    var maxAge = typeof opts.days === "number" ? opts.days * 86400 : null;
    var parts = [
      encodeURIComponent(name) + "=" + encodeURIComponent(value),
      "Path=" + (opts.path || "/"),
      "SameSite=" + (opts.sameSite || "Lax")
    ];
    if (maxAge !== null) parts.push("Max-Age=" + maxAge);
    if (opts.secure !== false && IS_SECURE) parts.push("Secure");
    document.cookie = parts.join("; ");
  }

  /**
   * Read a cookie by name.
   * @param {string} name
   * @returns {string|null}
   */
  function getCookie(name) {
    var escaped = encodeURIComponent(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var match = document.cookie.match(new RegExp("(?:^|;\\s*)" + escaped + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  /**
   * Read + JSON.parse a cookie, always returning a plain object.
   * JSON.parse(null) legitimately returns null (no exception), so callers
   * that do `JSON.parse(get(name))` and then assign properties onto the
   * result need this rather than a bare try/catch around JSON.parse.
   * @param {string} name
   * @returns {Object}
   */
  function getJSON(name) {
    var raw = getCookie(name);
    var parsed;
    try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
    return (parsed && typeof parsed === "object") ? parsed : {};
  }

  /**
   * Delete a cookie.
   * @param {string} name
   * @param {string} [path="/"]
   */
  function deleteCookie(name, path) {
    document.cookie = encodeURIComponent(name) + "=; Max-Age=0; Path=" + (path || "/");
  }

  /* ─── Consent helpers ───────────────────────────────────────── */

  /**
   * What consent level is active?
   * @returns {"all"|"essential"|"dismissed"|null}
   */
  function getConsentLevel() {
    var raw = getCookie("bx_consent");
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      return parsed.level || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Can we set cookies in this category?
   * @param {"essential"|"functional"} category
   * @returns {boolean}
   */
  function hasConsent(category) {
    if (category === "essential") return true;
    return getConsentLevel() === "all";
  }

  /**
   * Smart setter: checks consent before writing functional cookies.
   * @param {string} name — must exist in REGISTRY
   * @param {string} value
   * @returns {boolean} — true if cookie was set
   */
  function setRegistered(name, value) {
    var entry = REGISTRY[name];
    if (!entry) { console.warn("[bxCookie] Unknown cookie: " + name); return false; }
    if (!hasConsent(entry.category)) return false;
    setCookie(name, value, { days: entry.days });
    return true;
  }

  /**
   * List all BEXO cookies currently in the browser.
   * @returns {Object} — { name: value, ... }
   */
  function getAllBexoCookies() {
    var result = {};
    var pairs = document.cookie.split(";");
    for (var i = 0; i < pairs.length; i++) {
      var kv = pairs[i].trim().split("=");
      var key = decodeURIComponent(kv[0]);
      if (key.indexOf("bx_") === 0) {
        result[key] = decodeURIComponent(kv.slice(1).join("="));
      }
    }
    return result;
  }

  /**
   * Wipe all functional cookies (called when user downgrades to essential-only).
   */
  function clearFunctional() {
    Object.keys(REGISTRY).forEach(function (name) {
      if (REGISTRY[name].category === "functional") deleteCookie(name);
    });
  }

  /**
   * Migrate from old localStorage keys to real cookies (one-time).
   */
  function migrateFromLocalStorage() {
    try {
      // Migrate theme
      var oldTheme = localStorage.getItem("bx-theme");
      if (oldTheme && !getCookie("bx_theme")) {
        setCookie("bx_theme", oldTheme, { days: 365 });
        localStorage.removeItem("bx-theme");
      }
      // Migrate consent
      var oldConsent = localStorage.getItem("bx_cookie_consent");
      if (oldConsent && !getCookie("bx_consent")) {
        try {
          var parsed = JSON.parse(oldConsent);
          var level = parsed.consent || "dismissed";
          setCookie("bx_consent", JSON.stringify({
            level: level,
            ts: parsed.timestamp || Date.now(),
            v: 2
          }), { days: 365 });
        } catch (e) {}
        localStorage.removeItem("bx_cookie_consent");
      }
    } catch (e) {
      // localStorage blocked — skip migration
    }
  }

  // Run migration on first load
  migrateFromLocalStorage();

  /* ─── Public API ────────────────────────────────────────────── */
  window.bxCookie = {
    set:            setCookie,
    get:            getCookie,
    getJSON:        getJSON,
    del:            deleteCookie,
    setRegistered:  setRegistered,
    hasConsent:     hasConsent,
    getConsentLevel: getConsentLevel,
    clearFunctional: clearFunctional,
    getAll:         getAllBexoCookies,
    REGISTRY:       REGISTRY
  };
})();
