/**
 * Live pricing from BEXO API (/api/pricing).
 * Falls back to static HTML prices if the request fails.
 */
(function () {
  function fmt(n) {
    var v = Math.round(Number(n) || 0);
    return "₹" + v.toLocaleString("en-IN");
  }

  function periodSuffix(period) {
    if (period === "monthly") return "/ month";
    if (period === "yearly") return "/ year";
    if (period === "lifetime") return " once";
    return "";
  }

  function applyPlan(card, plan) {
    if (!card || !plan) return;
    var title = card.querySelector("h3");
    var price = card.querySelector(".price");
    if (title && plan.displayName) {
      title.textContent = plan.displayName.replace(/\s*Plan\s*$/i, "") || plan.displayName;
    }
    if (price) {
      var periodEl = price.querySelector(".price-period, small");
      var amount = fmt(plan.priceInrExGst);
      var suffix = periodSuffix(plan.billingPeriod);
      if (price.querySelector(".dl")) {
        price.innerHTML =
          '<span class="dl">₹</span>' +
          amount.replace(/^₹/, "") +
          ' <span class="price-period">' +
          suffix +
          "</span>";
      } else if (periodEl) {
        price.innerHTML = amount + " <small>" + suffix + "</small>";
      } else {
        price.textContent = amount + " " + suffix;
      }
    }
    var details = card.querySelector(".price-details");
    if (details && plan.subtitle) details.textContent = plan.subtitle;

    if (Array.isArray(plan.features) && plan.features.length) {
      var info = card.querySelector(".p-card-info, ul");
      if (info) {
        var tag = info.tagName === "UL" ? "li" : "p";
        info.innerHTML = plan.features
          .slice(0, 6)
          .map(function (f) {
            return (
              "<" +
              tag +
              '><i class="ph-fill ph-check-circle"></i> ' +
              String(f)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;") +
              "</" +
              tag +
              ">"
            );
          })
          .join("");
      }
    }
    if (plan.isHighlighted) card.classList.add("is-featured");
  }

  function run() {
    if (!window.BEXO || !window.BEXO.apiUrl) return;
    var url = window.BEXO.apiUrl("/api/pricing");
    fetch(url, { credentials: "omit" })
      .then(function (r) {
        return r.ok ? r.json() : Promise.reject(new Error("pricing " + r.status));
      })
      .then(function (data) {
        var plans = (data && data.plans) || [];
        var byId = {};
        plans.forEach(function (p) {
          if (p && p.id) byId[p.id] = p;
        });

        // Home pricing strip — Identity / Essential / Growth cards in order
        var stripCards = document.querySelectorAll(".pricing-strip .plan-card");
        if (stripCards.length >= 3) {
          applyPlan(stripCards[0], byId.identity);
          applyPlan(stripCards[1], byId.essential);
          applyPlan(stripCards[2], byId.growth);
        }

        // Full pricing page cards marked with data-plan
        document.querySelectorAll("[data-plan]").forEach(function (el) {
          var id = el.getAttribute("data-plan");
          applyPlan(el, byId[id]);
        });
      })
      .catch(function () {
        /* keep static fallbacks */
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
