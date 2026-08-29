/**
 * BEXO — Cookie Consent Banner  (v2 — real cookies)
 * ──────────────────────────────────────────────────
 * Depends on: js/cookie-utils.js  (must load first)
 *
 * Flow:
 *   1. Read  bx_consent  cookie.
 *   2. If consent exists  → silently fire functional cookies (if "all").
 *   3. If consent missing → show the banner, wait for choice.
 *   4. On "Accept all"    → set bx_consent=all,  fire functional cookies.
 *   5. On "Essential only" → set bx_consent=essential, clear functional.
 *   6. On dismiss (×)     → set bx_consent=dismissed, clear functional.
 */
(function () {
  "use strict";

  /* ─── Functional-cookie payloads ────────────────────────────── */

  /**
   * bx_count — anonymous page-view counter (24 h).
   * Stores: { pages: <int>, started: <timestamp> }
   */
  function firePageCounter() {
    if (!window.bxCookie || !window.bxCookie.hasConsent("functional")) return;

    var raw = window.bxCookie.get("bx_count");
    var data;
    try { data = JSON.parse(raw); } catch (e) { data = null; }

    if (!data || typeof data.pages !== "number") {
      data = { pages: 0, started: Date.now() };
    }
    data.pages += 1;
    data.last = Date.now();

    window.bxCookie.setRegistered("bx_count", JSON.stringify(data));
  }

  /**
   * bx_prefs — UI preference snapshot (1 year).
   * Stores: { motion, locale, lastVisit }
   */
  function firePrefs() {
    if (!window.bxCookie || !window.bxCookie.hasConsent("functional")) return;

    var raw = window.bxCookie.get("bx_prefs");
    var prefs;
    try { prefs = JSON.parse(raw); } catch (e) { prefs = {}; }

    // Detect reduced motion
    var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    prefs.motion    = prefersReduced ? "reduced" : "full";
    prefs.locale    = navigator.language || "en";
    prefs.lastVisit = Date.now();

    window.bxCookie.setRegistered("bx_prefs", JSON.stringify(prefs));
  }

  /** Fire all functional cookies (called after "all" consent or on returning visit). */
  function fireFunctional() {
    firePageCounter();
    firePrefs();
  }

  /* ─── Consent persistence ───────────────────────────────────── */

  function saveConsent(level) {
    if (!window.bxCookie) return;
    window.bxCookie.set("bx_consent", JSON.stringify({
      level: level,
      ts: Date.now(),
      v: 2
    }), { days: 365 });
  }

  /* ─── URL helper ────────────────────────────────────────────── */

  function getCookiePolicyUrl() {
    var path = window.location.pathname;
    if (path.indexOf("/pages/") !== -1 || path.indexOf("/blog/") !== -1) return "cookies.html";
    return "pages/cookies.html";
  }

  /* ─── Banner UI ─────────────────────────────────────────────── */

  function createConsentBanner() {
    var cookieUrl = getCookiePolicyUrl();

    var banner = document.createElement("div");
    banner.id = "bxCookieBanner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie Consent");
    banner.style.cssText = [
      "position:fixed",
      "bottom:24px",
      "left:24px",
      "right:24px",
      "max-width:480px",
      "margin:0 auto 0 0",
      "background:oklch(14% 0.028 258 / 0.94)",
      "backdrop-filter:blur(16px)",
      "-webkit-backdrop-filter:blur(16px)",
      "border:1px solid var(--line, oklch(90% 0.01 258 / 0.14))",
      "border-radius:20px",
      "padding:22px 24px",
      "box-shadow:0 30px 60px -20px oklch(6% 0.02 258 / 0.65), 0 0 0 1px oklch(58% 0.19 264 / 0.15)",
      "color:var(--ink, oklch(97% 0.01 258))",
      "font-family:var(--sans, 'Plus Jakarta Sans', system-ui, sans-serif)",
      "z-index:390",
      "opacity:0",
      "transform:translateY(24px) scale(0.96)",
      "transition:opacity 0.45s cubic-bezier(0.16,1,0.3,1), transform 0.45s cubic-bezier(0.16,1,0.3,1)",
      "display:flex",
      "flex-direction:column",
      "gap:14px"
    ].join(";");

    banner.innerHTML = [
      '<div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">',
      '  <div style="display:flex; align-items:center; gap:8px;">',
      '    <span style="width:28px; height:28px; border-radius:8px; background:oklch(58% 0.19 264 / 0.15); display:inline-flex; align-items:center; justify-content:center; color:var(--green, oklch(58% 0.19 264)); font-size:16px;">',
      '      <i class="ph-fill ph-cookie"></i>',
      '    </span>',
      '    <span style="font-size:13.5px; font-weight:700; letter-spacing:-0.01em; color:var(--ink);">Cookie preferences</span>',
      '  </div>',
      '  <button id="bxCookieClose" aria-label="Dismiss cookie notice" style="background:none; border:none; color:var(--ink-3, oklch(60% 0.02 258)); font-size:18px; cursor:pointer; padding:4px; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; transition:color 0.2s ease;">',
      '    <i class="ph-bold ph-x"></i>',
      '  </button>',
      '</div>',
      '<p style="font-size:13.5px; line-height:1.55; color:var(--ink-2, oklch(78% 0.02 258)); margin:0;">',
      '  We use <strong style="color:var(--ink);">2 essential</strong> cookies (theme &amp; this consent choice) and <strong style="color:var(--ink);">2 optional</strong> cookies (anonymous page count &amp; UI preferences). No ads, no tracking pixels, no cross-site surveillance. <a href="' + cookieUrl + '" style="color:var(--green, oklch(58% 0.19 264)); text-decoration:underline; font-weight:500;">Cookie Policy</a>.',
      '</p>',
      '<div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top:2px;">',
      '  <button id="bxCookieAcceptAll" style="flex:1; min-width:110px; background:linear-gradient(180deg, oklch(66% 0.19 264) 0%, var(--green, oklch(58% 0.19 264)) 60%); color:#fff; border:none; border-radius:999px; padding:10px 18px; font-size:13.5px; font-weight:600; font-family:inherit; cursor:pointer; box-shadow:inset 0 1px 0 rgba(255,255,255,.35), 0 10px 24px -8px oklch(58% 0.19 264 / 0.5); transition:transform 0.2s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease;">',
      '    Accept all',
      '  </button>',
      '  <button id="bxCookieEssential" style="background:var(--paper-2, oklch(12% 0.026 258)); border:1px solid var(--line, oklch(90% 0.01 258 / 0.14)); color:var(--ink-2, oklch(78% 0.02 258)); border-radius:999px; padding:10px 16px; font-size:13px; font-weight:500; font-family:inherit; cursor:pointer; transition:background 0.2s ease, color 0.2s ease;">',
      '    Essential only',
      '  </button>',
      '</div>'
    ].join("");

    document.body.appendChild(banner);

    // Animate in
    setTimeout(function () {
      banner.style.opacity = "1";
      banner.style.transform = "translateY(0) scale(1)";
    }, 800);

    // Dismiss handler
    function dismiss(level) {
      saveConsent(level);

      if (level === "all") {
        fireFunctional();
      } else {
        // "essential" or "dismissed" — clear functional cookies
        if (window.bxCookie) window.bxCookie.clearFunctional();
      }

      banner.style.opacity = "0";
      banner.style.transform = "translateY(24px) scale(0.96)";
      setTimeout(function () {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 450);
    }

    var btnAcceptAll = document.getElementById("bxCookieAcceptAll");
    var btnEssential = document.getElementById("bxCookieEssential");
    var btnClose     = document.getElementById("bxCookieClose");

    if (btnAcceptAll) btnAcceptAll.addEventListener("click", function () { dismiss("all"); });
    if (btnEssential) btnEssential.addEventListener("click", function () { dismiss("essential"); });
    if (btnClose) btnClose.addEventListener("click", function () { dismiss("dismissed"); });
  }

  /* ─── Init ──────────────────────────────────────────────────── */

  function init() {
    if (!window.bxCookie) {
      console.warn("[bxConsent] cookie-utils.js not loaded. Consent banner disabled.");
      return;
    }

    var level = window.bxCookie.getConsentLevel();

    if (level) {
      // Returning visitor — silently fire functional cookies if allowed
      if (level === "all") fireFunctional();
    } else {
      // First visit — show the banner
      createConsentBanner();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
