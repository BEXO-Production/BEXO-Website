/**
 * BEXO V2 — Shared Interactive Experience & Transitions Engine
 * Handles: Entry/Exit Curtains, Blackhole Transitions, Magnetic Cursor,
 * Card Tilts, Scroll Reveal Observers, and Smooth Scrolling.
 */

(function () {
  'use strict';

  // 1. Initial theme boot
  if (window.bxApplyStoredTheme) {
    window.bxApplyStoredTheme();
  }

  // 2. Lenis Smooth Scroll (if available)
  var lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 0.9
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // 3. Entry Curtain Animation
  window.addEventListener('DOMContentLoaded', function () {
    var curtain = document.getElementById('bxCurtain');
    var curtainGlow = document.getElementById('bxCurtainGlow');
    var curtainLogo = document.getElementById('bxCurtainLogo');
    var loadCopy = document.getElementById('bxLoadCopy');
    var heroInner = document.getElementById('bxHeroInner');
    var heroCardWrap = document.getElementById('bxHeroCardWrap');
    var progressBar = document.getElementById('bxProgress');

    // Page progress bar on scroll
    function updateProgress() {
      if (!progressBar) return;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      progressBar.style.width = p + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // Fade out load copy, slide up curtain
    if (curtain) {
      setTimeout(function () {
        if (loadCopy) loadCopy.style.opacity = '0';
      }, 100);

      setTimeout(function () {
        if (curtainLogo) {
          curtainLogo.style.opacity = '0';
          curtainLogo.style.transform = 'scale(0.85)';
        }
        if (curtainGlow) curtainGlow.style.opacity = '0';
        curtain.style.transform = 'translateY(-101%)';
        curtain.style.borderRadius = '0 0 48px 48px';
        curtain.style.pointerEvents = 'none';

        if (heroInner) {
          heroInner.style.opacity = '1';
          heroInner.style.transform = 'none';
        }
        if (heroCardWrap) {
          heroCardWrap.style.opacity = '1';
          heroCardWrap.style.transform = 'none';
        }
      }, 350);

      setTimeout(function () {
        curtain.style.display = 'none';
      }, 1050);
    }

    // 4. Custom Magnetic Cursor
    var cursor = document.getElementById('bxCursor');
    var cursorLabel = document.getElementById('bxCursorLabel');
    if (cursor) {
      var mouseX = window.innerWidth / 2;
      var mouseY = window.innerHeight / 2;
      var cursorX = mouseX;
      var cursorY = mouseY;
      var cursorVisible = false;

      window.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!cursorVisible) {
          cursorVisible = true;
          cursor.style.opacity = '1';
        }
      });

      window.addEventListener('mouseleave', function () {
        cursorVisible = false;
        cursor.style.opacity = '0';
      });

      function renderCursor() {
        cursorX += (mouseX - cursorX) * 0.18;
        cursorY += (mouseY - cursorY) * 0.18;
        cursor.style.transform = 'translate3d(' + cursorX.toFixed(1) + 'px, ' + cursorY.toFixed(1) + 'px, 0)';
        requestAnimationFrame(renderCursor);
      }
      requestAnimationFrame(renderCursor);

      // Interactive hover targets for cursor
      var viewTargets = document.querySelectorAll('[data-cursor-view]');
      viewTargets.forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          cursor.style.width = '72px';
          cursor.style.height = '72px';
          cursor.style.margin = '-36px 0 0 -36px';
          cursor.style.background = 'oklch(58% 0.129 55 / 0.85)';
          cursor.style.borderColor = 'oklch(58% 0.129 55)';
          if (cursorLabel) cursorLabel.style.opacity = '1';
        });
        el.addEventListener('mouseleave', function () {
          cursor.style.width = '34px';
          cursor.style.height = '34px';
          cursor.style.margin = '-17px 0 0 -17px';
          cursor.style.background = 'transparent';
          cursor.style.borderColor = 'oklch(6% 0.02 68 / 0.45)';
          if (cursorLabel) cursorLabel.style.opacity = '0';
        });
      });
    }

    // 5. Card 3D Tilt Effect
    var tiltElements = document.querySelectorAll('.bx-tilt');
    tiltElements.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var deltaX = (x - centerX) / centerX;
        var deltaY = (y - centerY) / centerY;
        var rotX = -deltaY * 8;
        var rotY = deltaX * 8;
        card.style.transform = 'perspective(900px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translateZ(8px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      });
    });

    // 6. Scroll Reveal Observer for elements with [data-reveal]
    var reveals = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window && reveals.length > 0) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      reveals.forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
        revealObserver.observe(el);
      });
    }

    // CSS class helper for revealed items
    var style = document.createElement('style');
    style.textContent = '.is-revealed { opacity: 1 !important; transform: none !important; }';
    document.head.appendChild(style);

    // 7. Page link transitions (Exit curtain)
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-page-link]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || a.target === '_blank') return;

      e.preventDefault();
      var c = document.getElementById('bxCurtain');
      if (c) {
        c.style.display = 'flex';
        c.style.transform = 'translateY(100%)';
        c.style.borderRadius = '48px 48px 0 0';
        c.style.pointerEvents = 'auto';
        requestAnimationFrame(function () {
          c.style.transition = 'transform 0.5s cubic-bezier(0.76, 0, 0.24, 1), border-radius 0.5s cubic-bezier(0.76, 0, 0.24, 1)';
          c.style.transform = 'translateY(0%)';
          c.style.borderRadius = '0';
        });
        setTimeout(function () {
          window.location.href = href;
        }, 520);
      } else {
        window.location.href = href;
      }
    });

    // 8. Blackhole Click Transition Effect
    window.bxTriggerBlackhole = function (e, targetUrl) {
      if (e && e.preventDefault) e.preventDefault();
      var blackhole = document.getElementById('bxBlackhole');
      var ringA = document.getElementById('bxRingA');
      var ringB = document.getElementById('bxRingB');
      if (!blackhole) {
        if (targetUrl) window.location.href = targetUrl;
        return;
      }

      var clientX = (e && e.clientX) ? e.clientX : window.innerWidth / 2;
      var clientY = (e && e.clientY) ? e.clientY : window.innerHeight / 2;

      blackhole.style.clipPath = 'circle(0px at ' + clientX + 'px ' + clientY + 'px)';
      blackhole.style.opacity = '1';
      blackhole.style.pointerEvents = 'auto';

      if (ringA) {
        ringA.style.left = clientX + 'px';
        ringA.style.top = clientY + 'px';
        ringA.style.opacity = '1';
        ringA.style.width = '20px';
        ringA.style.height = '20px';
        ringA.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1), height 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease';
        setTimeout(function () {
          ringA.style.width = Math.max(window.innerWidth, window.innerHeight) * 2.5 + 'px';
          ringA.style.height = Math.max(window.innerWidth, window.innerHeight) * 2.5 + 'px';
          ringA.style.opacity = '0';
        }, 10);
      }

      if (ringB) {
        ringB.style.left = clientX + 'px';
        ringB.style.top = clientY + 'px';
        ringB.style.opacity = '1';
        ringB.style.width = '10px';
        ringB.style.height = '10px';
        ringB.style.transition = 'width 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.08s, height 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.08s, opacity 0.9s ease 0.08s';
        setTimeout(function () {
          ringB.style.width = Math.max(window.innerWidth, window.innerHeight) * 2.2 + 'px';
          ringB.style.height = Math.max(window.innerWidth, window.innerHeight) * 2.2 + 'px';
          ringB.style.opacity = '0';
        }, 10);
      }

      var maxRadius = Math.hypot(
        Math.max(clientX, window.innerWidth - clientX),
        Math.max(clientY, window.innerHeight - clientY)
      ) * 1.2;

      blackhole.style.transition = 'clip-path 0.75s cubic-bezier(0.65, 0, 0.35, 1)';
      requestAnimationFrame(function () {
        blackhole.style.clipPath = 'circle(' + maxRadius.toFixed(0) + 'px at ' + clientX + 'px ' + clientY + 'px)';
      });

      setTimeout(function () {
        if (targetUrl) {
          window.location.href = targetUrl;
        } else {
          // Reset after 1.5s if no navigation
          setTimeout(function () {
            blackhole.style.opacity = '0';
            blackhole.style.pointerEvents = 'none';
          }, 600);
        }
      }, 700);
    };

    // Attach blackhole trigger to CTA buttons with [data-blackhole]
    var blackholeBtns = document.querySelectorAll('[data-blackhole]');
    blackholeBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var href = btn.getAttribute('href') || btn.getAttribute('data-href');
        window.bxTriggerBlackhole(e, href);
      });
    });
  });
})();
