/**
 * Hero subdomain availability checker.
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
    var domain = window.BEXO.PORTFOLIO_DOMAIN || "atbexo.com";
    var suffix = window.BEXO.PORTFOLIO_SUFFIX || "." + domain;
    var timer = null;
    var latest = "";

    var suffixEl = root.querySelector(".handle-suffix, .js-portfolio-suffix");
    if (suffixEl) suffixEl.textContent = suffix;

    function setStatus(kind, message) {
      statusEl.className = "handle-status handle-status--" + kind;
      statusEl.textContent = message;
      statusEl.hidden = !message;
    }

    function setClaim(enabled, handle) {
      if (!claimBtn) return;
      if (enabled && handle) {
        claimBtn.hidden = false;
        claimBtn.href = window.BEXO.claimLoginUrl(handle);
        claimBtn.setAttribute("aria-disabled", "false");
      } else {
        claimBtn.hidden = true;
        claimBtn.removeAttribute("href");
        claimBtn.setAttribute("aria-disabled", "true");
      }
    }

    function validateShape(handle) {
      if (!handle) return { ok: false, idle: true };
      if (handle.length < 3) {
        return { ok: false, msg: "At least 3 characters." };
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle)) {
        return { ok: false, msg: "Use letters, numbers, and hyphens only." };
      }
      return { ok: true };
    }

    async function check(handle) {
      latest = handle;
      var shape = validateShape(handle);
      if (shape.idle) {
        setStatus("idle", "Type a name to see if it’s free.");
        setClaim(false);
        return;
      }
      if (!shape.ok) {
        setStatus("invalid", shape.msg);
        setClaim(false);
        return;
      }

      setStatus("checking", "Checking " + handle + "." + domain + "…");
      setClaim(false);

      try {
        var url = window.BEXO.apiUrl(
          "/api/profile/check-handle?handle=" + encodeURIComponent(handle),
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
            handle + "." + domain + " is available — claim it while you sign up.",
          );
          setClaim(true, handle);
        } else if (data.reason === "reserved") {
          setStatus("taken", "That name is reserved. Try another.");
          setClaim(false);
        } else {
          setStatus("taken", "Taken. Try a variation — add a number or middle name.");
          setClaim(false);
        }
      } catch (err) {
        if (latest !== handle) return;
        setStatus(
          "error",
          "Can’t reach BEXO right now. You can still sign up and pick a name later.",
        );
        setClaim(false);
      }
    }

    function schedule() {
      var handle = sanitize(input.value);
      if (input.value !== handle) input.value = handle;
      clearTimeout(timer);
      timer = setTimeout(function () {
        check(handle);
      }, 380);
    }

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

    setStatus("idle", "Type a name to see if it’s free.");
    setClaim(false);

    // Prefill from ?claim= or ?name= for shared links
    try {
      var params = new URLSearchParams(window.location.search);
      var pre = sanitize(params.get("claim") || params.get("name") || "");
      if (pre) {
        input.value = pre;
        check(pre);
      }
    } catch (_) {
      /* ignore */
    }
  });
})();
