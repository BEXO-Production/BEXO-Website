/**
 * Hero background video — load when it will play well,
 * and parallax the media so it drifts downward on scroll.
 * Falls back to poster on reduced-motion, Save-Data, or slow links.
 */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
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
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function shouldSkipVideo() {
      if (reduceMotion) return true;
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        if (conn.saveData) return true;
        if (/^(slow-2g|2g)$/.test(conn.effectiveType || "")) return true;
      }
      return false;
    }

    function markReady() {
      if (!video) return;
      video.classList.add("is-ready");
      hero.classList.add("hero--video-ready");
    }

    function tryPlay() {
      if (!video) return;
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
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

      if (!parallax || reduceMotion) return;

      // Drift the video downward as the section scrolls away.
      var shift = progress * viewH * 0.28;
      parallax.style.transform = "translate3d(0, " + shift.toFixed(2) + "px, 0)";
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateParallax);
    }

    if (video && !shouldSkipVideo()) {
      if (!video.querySelector("source")) {
        var source = document.createElement("source");
        source.src = src;
        source.type = "video/mp4";
        video.appendChild(source);
      }

      if (video.readyState >= 2) {
        tryPlay();
      } else {
        video.addEventListener("loadeddata", tryPlay, { once: true });
        video.load();
      }

      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
                tryPlay();
              } else if (playing) {
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
        } else if (!shouldSkipVideo()) {
          tryPlay();
        }
      });
    } else if (video) {
      video.removeAttribute("autoplay");
      try {
        video.pause();
      } catch (e) {}
    }

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  });
})();
