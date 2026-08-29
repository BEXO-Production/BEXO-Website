/**
 * BEXO — Theme Manager (System Default + Persistent User Override)
 */
(function () {
  "use strict";

  var THEMES = {
    dark: {
      "--paper": "oklch(16% 0.03 258)",
      "--paper-2": "oklch(12% 0.026 258)",
      "--ink": "oklch(97% 0.01 258)",
      "--ink-2": "oklch(78% 0.02 258)",
      "--ink-3": "oklch(60% 0.02 258)",
      "--line": "oklch(90% 0.01 258 / 0.14)",
      "--card-bg": "oklch(16% 0.03 258)",
      "--bexo-bg": "oklch(12% 0.026 258)",
      "--bexo-text": "oklch(97% 0.01 258)"
    },
    light: {
      "--paper": "oklch(97% 0.012 258)",
      "--paper-2": "oklch(93% 0.015 258)",
      "--ink": "oklch(16% 0.03 258)",
      "--ink-2": "oklch(36% 0.02 258)",
      "--ink-3": "oklch(52% 0.02 258)",
      "--line": "oklch(20% 0.02 258 / 0.12)",
      "--card-bg": "oklch(99% 0.005 258)",
      "--bexo-bg": "oklch(95% 0.012 258)",
      "--bexo-text": "oklch(16% 0.03 258)"
    }
  };

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function getSavedTheme() {
    // Prefer real cookie (v2), fall back to localStorage for migration
    if (window.bxCookie) {
      var c = window.bxCookie.get("bx_theme");
      if (c === "dark" || c === "light") return c;
    }
    try {
      return localStorage.getItem("bx-theme");
    } catch (e) {
      return null;
    }
  }

  function apply(theme) {
    var t = THEMES[theme] || THEMES.light;
    var roots = document.querySelectorAll("[data-bx-theme-root]");
    
    roots.forEach(function (root) {
      Object.keys(t).forEach(function (k) {
        root.style.setProperty(k, t[k]);
      });
      root.setAttribute("data-theme", theme);
    });

    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    window.__bxTheme = theme;

    try {
      window.dispatchEvent(new CustomEvent("bx-theme-change", { detail: theme }));
    } catch (e) {}
  }

  window.bxSetTheme = function (theme) {
    window.__bxExplicit = true;
    // Write real cookie (essential — always allowed)
    if (window.bxCookie) {
      window.bxCookie.setRegistered("bx_theme", theme);
    }
    // Clean up legacy localStorage
    try { localStorage.removeItem("bx-theme"); } catch (e) {}
    apply(theme);
  };

  window.bxToggleTheme = function () {
    var next = window.__bxTheme === "dark" ? "light" : "dark";
    window.bxSetTheme(next);
  };

  window.bxApplyStoredTheme = function () {
    var saved = getSavedTheme();
    if (saved && (saved === "dark" || saved === "light")) {
      window.__bxExplicit = true;
      apply(saved);
    } else {
      window.__bxExplicit = false;
      apply("light");
    }
  };

  // Immediate execution to prevent flash
  window.bxApplyStoredTheme();

  // Listen for OS system theme changes
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var handler = function (e) {
      if (!window.__bxExplicit) {
        apply(e.matches ? "dark" : "light");
      }
    };
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
    } else if (mq.addListener) {
      mq.addListener(handler);
    }
  }

  // Re-apply once DOM is ready so data-bx-theme-root elements get custom properties
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.bxApplyStoredTheme);
  }
})();
