/**
 * Hero background video — load only when it will actually play well.
 * Falls back to poster image on reduced-motion, Save-Data, or slow links.
 */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var video = document.querySelector(".hero-video-bg");
    if (!video) return;

    var root = document.documentElement.getAttribute("data-root") || "";
    var src = root + "assets/atmosphere/hero-bg-web.mp4";
    var playing = false;

    function shouldSkipVideo() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        if (conn.saveData) return true;
        if (/^(slow-2g|2g)$/.test(conn.effectiveType || "")) return true;
      }
      return false;
    }

    function markReady() {
      video.classList.add("is-ready");
      var hero = video.closest(".hero");
      if (hero) hero.classList.add("hero--video-ready");
    }

    function tryPlay() {
      video.muted = true;
      video.playsInline = true;
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

    if (shouldSkipVideo()) {
      video.removeAttribute("autoplay");
      try {
        video.pause();
      } catch (e) {}
      return;
    }

    // Defer source attach so first paint can use the poster.
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

    // Pause when mostly off-screen to save battery/CPU.
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
      io.observe(video.closest(".hero") || video);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        video.pause();
        playing = false;
      } else if (!shouldSkipVideo()) {
        tryPlay();
      }
    });
  });
})();
