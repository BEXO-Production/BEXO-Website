/**
 * BEXO — Footer Controller & Theme Toggle Component
 */
(function () {
  "use strict";

  function BxFooter(btn) {
    this.btn = btn;
    this.icon = btn.querySelector("i");
    this.label = btn.querySelector("[data-theme-text]");
    this.onThemeChange = this.onThemeChange.bind(this);
    this.init();
  }

  BxFooter.prototype.init = function () {
    if (window.bxApplyStoredTheme) window.bxApplyStoredTheme();
    this.render(window.__bxTheme || "dark");
    window.addEventListener("bx-theme-change", this.onThemeChange);
    
    var self = this;
    this.btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (window.bxToggleTheme) window.bxToggleTheme();
    });
  };

  BxFooter.prototype.onThemeChange = function (e) {
    this.render(e.detail);
  };

  BxFooter.prototype.render = function (theme) {
    var isDark = theme === "dark";
    this.btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    this.btn.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
    
    if (this.icon) {
      this.icon.className = isDark ? "ph-fill ph-sun" : "ph-fill ph-moon";
    }
    if (this.label) {
      this.label.textContent = isDark ? "Light mode" : "Dark mode";
    }
  };

  function boot() {
    document.querySelectorAll("[data-bx-theme-toggle]").forEach(function (btn) {
      new BxFooter(btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
