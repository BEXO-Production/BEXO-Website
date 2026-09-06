/**
 * BEXO — Theme Manager (System Default + Persistent User Override)
 */
(function () {
  "use strict";

  var THEMES = {
    dark: {
      "--paper": "#1a1611",
      "--paper-2": "#221c15",
      "--ink": "#f3ede1",
      "--ink-2": "#cabfab",
      "--ink-3": "#948a76",
      "--line": "rgba(243,237,225,.14)",
      "--card-bg": "#221c15",
      "--bexo-bg": "#1a1611",
      "--bexo-text": "#f3ede1"
    },
    light: {
      "--paper": "#f5f2ea",
      "--paper-2": "#ece7d9",
      "--ink": "#1c1712",
      "--ink-2": "#4a4238",
      "--ink-3": "#7c7364",
      "--line": "rgba(28,23,18,.12)",
      "--card-bg": "#fffdf8",
      "--bexo-bg": "#ece7d9",
      "--bexo-text": "#1c1712"
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
