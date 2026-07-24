/**
 * Hero background video — only when the device can play it smoothly.
 * Mobile / low-power / Save-Data / reduced-motion → poster still only.
 */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function isCoarseMobile() {
    try {
      if (window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 900) return true;
    } catch (e) {}
    return (navigator.maxTouchPoints || 0) > 1 && window.innerWidth < 900;
  }

  function shouldSkipVideo() {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    } catch (e) {}

    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      if (conn.saveData) return true;
      if (/^(slow-2g|2g)$/.test(conn.effectiveType || "")) return true;
      if (typeof conn.downlink === "number" && conn.downlink > 0 && conn.downlink < 0.7) return true;
    }

    var memory = typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : null;
    var cores = navigator.hardwareConcurrency || null;
    if ((memory !== null && memory <= 2) || (cores !== null && cores <= 2)) return true;

    // Phones: default to still — decode + glass UI often tanks older devices.
    if (isCoarseMobile()) {
      if (memory !== null && memory <= 4) return true;
      if (memory === null && cores !== null && cores <= 6) return true;
      // Unknown mid phones: still skip video for a snappier first paint.
      return true;
    }

    return false;
  }

  ready(function () {
    var hero = document.querySelector(".hero");
    var video = document.querySelector(".hero-video-bg");
    var parallax = document.querySelector("[data-hero-parallax]");
    if (!hero) return;

    var root = document.documentElement.getAttribute("data-root") || "";
    var src = root + "assets/atmosphere/hero-bg-web.mp4";
    var playing = false;
    var ticking = false;
    var loopBound = false;
    var skip = shouldSkipVideo();

    document.documentElement.dataset.bexoHeroVideo = skip ? "off" : "on";
    if (isCoarseMobile()) document.documentElement.classList.add("is-mobile-ua");

    function markReady() {
      if (!video) return;
      video.classList.add("is-ready");
      hero.classList.add("hero--video-ready");
    }

    function tryPlay() {
      if (!video || skip) return;
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("loop", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");

      if (!loopBound) {
        loopBound = true;
        video.addEventListener("ended", function () {
          video.currentTime = 0;
          video.play().catch(function () {});
        });
      }

      var play = video.play();
      if (play && typeof play.then === "function") {
        play
          .then(function () {
            playing = true;
            markReady();
          })
          .catch(function () {
            playing = false;
          });
      } else {
        playing = !video.paused;
        if (playing) markReady();
      }
    }

    function updateParallax() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      var viewH = window.innerHeight || 1;
      var progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));

      if (progress > 0.04) hero.classList.add("is-scrolled");
      else hero.classList.remove("is-scrolled");

      if (!parallax || skip) return;
      try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      } catch (e) {}

      var shift = progress * viewH * 0.22;
      parallax.style.transform = "translate3d(0, " + shift.toFixed(2) + "px, 0)";
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateParallax);
    }

    if (video && !skip) {
      if (!video.querySelector("source")) {
        var source = document.createElement("source");
        source.src = src;
        source.type = "video/mp4";
        video.appendChild(source);
      }

      if (video.readyState >= 2) tryPlay();
      else {
        video.addEventListener("loadeddata", tryPlay, { once: true });
        video.load();
      }

      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && entry.intersectionRatio > 0.2) tryPlay();
              else if (playing) {
                video.pause();
                playing = false;
              }
            });
          },
          { threshold: [0, 0.2, 0.5] },
        );
        io.observe(hero);
      }

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          video.pause();
          playing = false;
        } else if (!skip) tryPlay();
      });
    } else if (video) {
      video.removeAttribute("autoplay");
      video.removeAttribute("src");
      while (video.firstChild) video.removeChild(video.firstChild);
      try {
        video.pause();
        video.load();
      } catch (e) {}
      hero.classList.add("hero--still");
    }

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  });
})();
