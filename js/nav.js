(function () {
  "use strict";

  function BxNav(root) {
    this.wrap = root.querySelector(".bx-nav-wrap");
    this.nav = root.querySelector(".bx-nav");
    this.burger = root.querySelector(".bx-nav-burger");
    this.overlay = document.getElementById("bxNavOverlay");
    this.overlayClose = document.getElementById("bxOverlayClose");
    this.menuOpen = false;
    this.menuTimer = null;
    this.active = root.getAttribute("data-active") || "";
    this.init();
  }

  BxNav.prototype.init = function () {
    if (window.bxApplyStoredTheme) window.bxApplyStoredTheme();

    // mark active links
    var self = this;
    document.querySelectorAll(".bx-nav-link[data-key], .bx-mlink[data-key]").forEach(function (a) {
      if (a.getAttribute("data-key") === self.active) a.classList.add("is-active");
    });

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onKey = this.onKey.bind(this);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });
    window.addEventListener("keydown", this.onKey);
    this.onScroll();

    if (this.burger) this.burger.addEventListener("click", this.toggleMenu.bind(this));
    if (this.overlayClose) this.overlayClose.addEventListener("click", this.toggleMenu.bind(this));
    if (this.overlay) {
      this.overlay.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          if (self.menuOpen) self.toggleMenu();
        });
      });
    }
  };

  BxNav.prototype.onScroll = function () {
    var scrolled = window.scrollY > 24;
    this.wrap.classList.toggle("is-scrolled", scrolled);
  };

  BxNav.prototype.onResize = function () {
    var isDesktop = window.innerWidth >= 940;
    if (isDesktop && this.menuOpen) this.toggleMenu();
  };

  BxNav.prototype.onKey = function (e) {
    if (e.key === "Escape" && this.menuOpen) this.toggleMenu();
  };

  BxNav.prototype.toggleMenu = function () {
    var opening = !this.menuOpen;
    clearTimeout(this.menuTimer);
    if (!this.overlay || !this.burger) return;

    if (opening) {
      this.menuOpen = true;
      document.body.style.overflow = "hidden";
      this.overlay.hidden = false;
      this.burger.classList.add("is-open");
      this.burger.setAttribute("aria-expanded", "true");
      this.burger.setAttribute("aria-label", "Close menu");
      // force reflow before adding visible class so the clip-path transition runs
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {});
      });
      var self = this;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          self.overlay.classList.add("is-visible");
        });
      });
    } else {
      this.menuOpen = false;
      document.body.style.overflow = "";
      this.overlay.classList.remove("is-visible");
      this.burger.classList.remove("is-open");
      this.burger.setAttribute("aria-expanded", "false");
      this.burger.setAttribute("aria-label", "Open menu");
      this.menuTimer = setTimeout(function (overlay) {
        overlay.hidden = true;
      }, 380, this.overlay);
    }
  };

  function boot() {
    document.querySelectorAll("[data-bx-nav]").forEach(function (root) {
      new BxNav(root);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
