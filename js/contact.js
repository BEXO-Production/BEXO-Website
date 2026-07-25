(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var statusEl = document.getElementById("contact-status");
    var submitBtn = document.getElementById("contact-submit");
    var apiBase =
      (window.BEXO && typeof window.BEXO.apiUrl === "function"
        ? window.BEXO.apiUrl("/api/marketing/contact")
        : "/api/marketing/contact");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!statusEl || !submitBtn) return;
      statusEl.textContent = "";
      statusEl.className = "form-status";

      var fd = new FormData(form);
      var payload = {
        name: String(fd.get("name") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        subject: String(fd.get("subject") || "").trim(),
        message: String(fd.get("message") || "").trim(),
        website: String(fd.get("website") || "").trim(),
        source: "marketing_contact",
        pageUrl: location.href,
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { ok: res.ok, body: body };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            throw new Error((result.body && result.body.error) || "Could not send.");
          }
          statusEl.textContent = "Thanks — we received your message and will reply by email.";
          statusEl.className = "form-status is-ok";
          form.reset();
        })
        .catch(function (err) {
          statusEl.textContent = err.message || "Something went wrong. Please try again.";
          statusEl.className = "form-status is-error";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send message";
        });
    });
  });
})();
