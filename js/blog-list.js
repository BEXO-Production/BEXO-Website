/**
 * Guides index — loads DB-shaped manifest from /content/blogs/manifest.json
 */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function categoryLabel(key) {
    var map = {
      placements: "Placements",
      branding: "Personal brand",
      recruiters: "Recruiters",
      "getting-started": "Getting started",
      students: "Students",
      tips: "Practical tips",
      freelance: "Freelance",
      writing: "Writing",
      career: "Career",
      design: "Design",
      motivation: "Mindset",
    };
    return map[key] || key;
  }

  ready(function () {
    var grid = document.getElementById("guides-grid");
    var filters = document.getElementById("guides-filters");
    if (!grid) return;

    var root = document.documentElement.getAttribute("data-root") || "../";
    var manifestUrl = root + "content/blogs/manifest.json";
    var all = [];
    var active = "all";

    function render() {
      var list =
        active === "all" ? all : all.filter(function (p) { return p.category === active; });

      if (!list.length) {
        grid.innerHTML = '<p class="guides-empty">No guides in this category yet.</p>';
        return;
      }

      grid.innerHTML = list
        .map(function (p) {
          return (
            '<a class="guide-card" href="' +
            p.href +
            '">' +
            '<div class="thumb"><img src="' +
            p.cover_image_url +
            '" alt="" loading="lazy" /></div>' +
            "<div>" +
            '<p class="meta">' +
            (p.category_label || categoryLabel(p.category)) +
            " · " +
            p.reading_minutes +
            " min</p>" +
            "<h3>" +
            p.title +
            "</h3>" +
            "<p>" +
            p.excerpt +
            "</p>" +
            "</div></a>"
          );
        })
        .join("");
    }

    function renderFilters(cats) {
      if (!filters) return;
      var keys = ["all"].concat(cats);
      filters.innerHTML = keys
        .map(function (k) {
          var label = k === "all" ? "All" : categoryLabel(k);
          var cls = "guides-chip" + (active === k ? " is-active" : "");
          return (
            '<button type="button" class="' +
            cls +
            '" data-cat="' +
            k +
            '">' +
            label +
            "</button>"
          );
        })
        .join("");

      filters.querySelectorAll("[data-cat]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          active = btn.getAttribute("data-cat");
          renderFilters(cats);
          render();
        });
      });
    }

    fetch(manifestUrl)
      .then(function (r) {
        if (!r.ok) throw new Error("manifest missing");
        return r.json();
      })
      .then(function (data) {
        all = data.posts || [];
        var cats = [];
        all.forEach(function (p) {
          if (cats.indexOf(p.category) === -1) cats.push(p.category);
        });
        cats.sort();
        renderFilters(cats);
        render();
      })
      .catch(function () {
        grid.innerHTML =
          '<p class="guides-empty">Guides are generating. Run <code>node scripts/generate-blogs.mjs</code>.</p>';
      });
  });
})();
