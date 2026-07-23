/**
 * Hero subdomain availability checker — Interactive & Mobile-Optimized.
 * Uses GET /api/profile/check-handle (optional auth — public).
 */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function sanitize(raw) {
    return String(raw || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32);
  }

  ready(function () {
    var root = document.getElementById("handle-check");
    if (!root || !window.BEXO) return;

    var input = root.querySelector("[data-handle-input]");
    var statusEl = root.querySelector("[data-handle-status]");
    var claimBtn = root.querySelector("[data-handle-claim]");
    var previewEl = root.querySelector("[data-preview-handle]");
    var triggerBtn = root.querySelector("[data-check-trigger]");
    var chips = root.querySelectorAll("[data-chip]");

    var domain = window.BEXO.PORTFOLIO_DOMAIN || "atbexo.com";
    var suffix = window.BEXO.PORTFOLIO_SUFFIX || "." + domain;
    var timer = null;
    var latest = "";

    var suffixEls = document.querySelectorAll(".handle-suffix, .js-portfolio-suffix");
    suffixEls.forEach(function (el) {
      el.textContent = suffix;
    });

    function updatePreview(val) {
      if (!previewEl) return;
      var clean = sanitize(val);
      previewEl.textContent = clean || "yourname";
    }

    function setStatus(kind, message) {
      if (!statusEl) return;
      statusEl.className = "handle-status handle-status--" + kind;
      
      var icon = "";
      if (kind === "checking") icon = '<i class="ph-bold ph-spinner spinner"></i> ';
      else if (kind === "available") icon = '<i class="ph-bold ph-check-circle"></i> ';
      else if (kind === "taken" || kind === "invalid") icon = '<i class="ph-bold ph-warning-circle"></i> ';
      else if (kind === "idle") icon = '<i class="ph-bold ph-magnifying-glass"></i> ';
      
      statusEl.innerHTML = icon + message;
      statusEl.hidden = !message;
    }

    function setClaim(enabled, handle) {
      if (!claimBtn) return;
      if (enabled && handle) {
        claimBtn.hidden = false;
        claimBtn.href = window.BEXO.claimLoginUrl(handle);
        claimBtn.setAttribute("aria-disabled", "false");
        claimBtn.innerHTML = 'Claim <strong>' + handle + suffix + '</strong> <i class="ph-bold ph-arrow-right"></i>';
      } else {
        claimBtn.hidden = true;
        claimBtn.removeAttribute("href");
        claimBtn.setAttribute("aria-disabled", "true");
      }
    }

    function validateShape(handle) {
      if (!handle) return { ok: false, idle: true };
      if (handle.length < 3) {
        return { ok: false, msg: "At least 3 characters needed." };
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle)) {
        return { ok: false, msg: "Letters, numbers, and hyphens only." };
      }
      return { ok: true };
    }

    async function check(handle) {
      latest = handle;
      updatePreview(handle);
      var shape = validateShape(handle);

      if (shape.idle) {
        setStatus("idle", "Type a name to check availability");
        setClaim(false);
        return;
      }
      if (!shape.ok) {
        setStatus("invalid", shape.msg);
        setClaim(false);
        return;
      }

      setStatus("checking", "Checking <strong>" + handle + suffix + "</strong>…");
      setClaim(false);

      try {
        var url = window.BEXO.apiUrl(
          "/api/profile/check-handle?handle=" + encodeURIComponent(handle)
        );
        var res = await fetch(url, { credentials: "omit" });
        if (latest !== handle) return;

        if (!res.ok) {
          setStatus("error", "Couldn’t check right now — try again in a moment.");
          return;
        }

        var data = await res.json();
        if (latest !== handle) return;

        if (data.available) {
          setStatus(
            "available",
            "<strong>" + handle + suffix + "</strong> is available!"
          );
          setClaim(true, handle);
        } else if (data.reason === "reserved") {
          setStatus("taken", "That name is reserved. Try another.");
          setClaim(false);
        } else {
          setStatus("taken", "Name taken. Try adding a role or location.");
          setClaim(false);
        }
      } catch (err) {
        if (latest !== handle) return;
        setStatus(
          "error",
          "Can’t reach server right now. You can still sign up and claim later."
        );
        setClaim(false);
      }
    }

    function schedule() {
      var handle = sanitize(input.value);
      if (input.value !== handle) input.value = handle;
      updatePreview(handle);
      clearTimeout(timer);
      timer = setTimeout(function () {
        check(handle);
      }, 350);
    }

    if (input) {
      input.addEventListener("input", schedule);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          clearTimeout(timer);
          var handle = sanitize(input.value);
          check(handle).then(function () {
            if (claimBtn && !claimBtn.hidden && claimBtn.href) {
              window.location.href = claimBtn.href;
            }
          });
        }
      });
    }

    if (triggerBtn) {
      triggerBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var handle = sanitize(input.value);
        check(handle);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function (e) {
        e.preventDefault();
        var val = chip.getAttribute("data-chip");
        if (val && input) {
          input.value = val;
          check(val);
          input.focus();
        }
      });
    });

    setStatus("idle", "Type a name to check availability");
    setClaim(false);

    // Prefill from ?claim= or ?name= for shared links
    try {
      var params = new URLSearchParams(window.location.search);
      var pre = sanitize(params.get("claim") || params.get("name") || "");
      if (pre && input) {
        input.value = pre;
        check(pre);
      }
    } catch (_) {
      /* ignore */
    }
  });
})();
