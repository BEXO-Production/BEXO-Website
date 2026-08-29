(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- data ---------------- */
  var LABELS = ["Name","Role","Company","Event","Location","Time","Topic","Photo","Voice note","Portfolio","Mutuals","Follow-up"];
  var ICONS = [
    "ph-fill ph-user","ph-fill ph-identification-badge","ph-fill ph-buildings","ph-fill ph-confetti",
    "ph-fill ph-map-pin","ph-fill ph-clock","ph-fill ph-chat-circle-text","ph-fill ph-image-square",
    "ph-fill ph-microphone","ph-fill ph-briefcase","ph-fill ph-users-three","ph-fill ph-arrow-bend-up-right"
  ];
  var TIPS = [
    "Even a first name narrows things down more than you'd think.",
    "A job title is often the detail that sticks when the name doesn't.",
    "Company plus role is usually enough on its own.",
    "Where you met anchors the whole memory.",
    "A city or a venue brings the rest of it back.",
    "Even a rough month helps SPiD narrow the field.",
    "What you talked about is a surprisingly strong signal.",
    "One photo can carry a dozen details at once.",
    "Your own voice remembers tone that words don't.",
    "Their work usually confirms you found the right person.",
    "One shared connection can close the gap instantly.",
    "What you promised to send is a reason to write again."
  ];
  var SIGNALS = [
    { label: "Name", icon: "ph-fill ph-user", x: 50, y: 9, tip: "The name you do remember, even if it's just a first one, is where SPiD starts." },
    { label: "Company", icon: "ph-fill ph-buildings", x: 82, y: 27, tip: "Where they work, even roughly, narrows the field fast." },
    { label: "Event", icon: "ph-fill ph-confetti", x: 82, y: 65, tip: "The gathering that put you both in the same room." },
    { label: "Location", icon: "ph-fill ph-map-pin", x: 50, y: 83, tip: "The city or venue anchors everything else you remember." },
    { label: "Time", icon: "ph-fill ph-clock", x: 18, y: 65, tip: "Even a rough month is enough to cross-reference against." },
    { label: "Topic", icon: "ph-fill ph-chat-circle-text", x: 18, y: 27, tip: "What you actually talked about is a strong, specific signal." }
  ];
  var SPID_CENTER = { x: 50, y: 46 };

  var STACK = [
    {x:0,y:0,r:-4,z:44,rx:3,ry:-4},{x:3,y:-3,r:3,z:40,rx:-2,ry:3},
    {x:-4,y:2,r:-2,z:36,rx:2,ry:-2},{x:2,y:-4,r:4,z:32,rx:-3,ry:2},
    {x:-3,y:3,r:-3,z:28,rx:3,ry:-3},{x:4,y:0,r:2,z:24,rx:-2,ry:2},
    {x:-2,y:-2,r:-4,z:20,rx:2,ry:-1},{x:3,y:3,r:3,z:16,rx:-1,ry:1},
    {x:-3,y:-1,r:-2,z:12,rx:2,ry:-2},{x:2,y:2,r:4,z:8,rx:-2,ry:1},
    {x:-1,y:-3,r:-3,z:4,rx:1,ry:-1},{x:0,y:1,r:1,z:0,rx:0,ry:0}
  ];

  var STATUS_COLORS = {
    idle: "oklch(60% 0.02 258)", checking: "oklch(60% 0.02 258)",
    available: "oklch(48% 0.19 264)", invalid: "oklch(80% 0.1 15)", taken: "oklch(80% 0.1 15)"
  };

  /* ---------------- element refs ---------------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var curtain = $("#bxCurtain");
  var curtainLogo = $("#bxCurtainLogo");
  var curtainGlow = $("#bxCurtainGlow");
  var loadCopy = $("#bxLoadCopy");
  var progressBar = $("#bxProgress");
  var blackhole = $("#bxBlackhole");
  var ringA = $("#bxRingA");
  var ringB = $("#bxRingB");
  var cursor = $("#bxCursor");
  var cursorLabel = $("#bxCursorLabel");
  var heroGlow = $("#bxHeroGlow");
  var heroSection = $("#hero");
  var heroInner = $("#bxHeroInner");
  var heroCardWrap = $("#bxHeroCardWrap");

  var handleInput = $("#bxHandleInput");
  var handleUnderline = $("#bxHandleUnderline");
  var handleStatusEl = $("#bxHandleStatus");
  var claimWrap = $("#bxClaimWrap");

  var scrub = $("#bxScrub");
  var fragmentsStage = $("#bxFragmentsStage");
  var progressLine = $("#bxProgressLine");
  var scatterCaption = $("#bxScatterCaption");
  var activeTipBox = $("#bxActiveTip");
  var activeTipIcon = $("#bxActiveTipIcon");
  var activeTipLabel = $("#bxActiveTipLabel");
  var activeTipText = $("#bxActiveTipText");

  var pillarsGrid = $("#bxPillarsGrid");

  var cinema = $("#bxCinema");
  var cineFrame = $("#bxCineFrame");
  var cineImg = $("#bxCineImg");
  var cineVeil = $("#bxCineVeil");
  var cineCopy = $("#bxCineCopy");

  var spidNodes = $$(".bx-spid-node");
  var spidLines = $$(".bx-spid-line");
  var spidCaptionIcon = $("#bxSpidCaptionIcon");
  var spidCaptionLabel = $("#bxSpidCaptionLabel");
  var spidCaptionText = $("#bxSpidCaptionText");
  var spidGraph = $("#bxSpidGraph");

  var ctaSection = $("#bxCtaSection");
  var ctaBlobs = $$(".bx-cta-blob");

  /* ---------------- state ---------------- */
  var state = {
    entered: false,
    entering: true,
    exiting: false,
    handleValue: "",
    handleStatus: { kind: "idle", msg: "Type a name to see if it's free." },
    showClaim: false,
    fragWidth: (fragmentsStage && fragmentsStage.offsetWidth) || 1100,
    activeTipIndex: null,
    spidActive: 0,
    spidAuto: true
  };
  var scatterProgress = 0;

  /* ---------------- fragment build ---------------- */
  var fragmentEls = LABELS.map(function (label, i) {
    var span = document.createElement("span");
    span.className = "bx-fragment";
    span.dataset.index = i;
    span.style.cssText = "display:flex;align-items:center;gap:15px;position:absolute;cursor:pointer;padding:0 20px;border-radius:18px;font-size:16px;font-weight:600;letter-spacing:-0.01em;white-space:nowrap;transition:box-shadow 0.25s ease;";
    var iconWrap = document.createElement("span");
    iconWrap.className = "bx-fragment-icon";
    iconWrap.style.cssText = "width:42px;height:42px;flex:0 0 42px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:19px;";
    var icon = document.createElement("i");
    icon.className = ICONS[i];
    iconWrap.appendChild(icon);
    span.appendChild(iconWrap);
    span.appendChild(document.createTextNode(label));
    span.addEventListener("click", function () { onFragmentClick(i); });
    if (fragmentsStage) fragmentsStage.appendChild(span);
    return span;
  });

  function onFragmentClick(i) {
    state.activeTipIndex = state.activeTipIndex === i ? null : i;
    renderActiveTip();
    updateScroll();
  }

  function renderActiveTip() {
    if (!activeTipBox) return;
    if (state.activeTipIndex === null) {
      activeTipBox.style.display = "none";
      return;
    }
    var i = state.activeTipIndex;
    activeTipBox.style.display = "flex";
    activeTipIcon.className = ICONS[i];
    activeTipLabel.textContent = LABELS[i];
    activeTipText.textContent = TIPS[i];
  }

  function fragMath() {
    var fragW = state.fragWidth || 1100;
    var cols = fragW < 620 ? 2 : (fragW < 940 ? 3 : 4);
    var gutter = 18;
    var colWidth = (fragW - gutter * (cols - 1)) / cols;
    var cardW = Math.min(272, Math.max(150, colWidth));
    var cardH = 84;
    var scaleX = fragW / 1100;
    var rowHeight = cardH + 24;
    var rowCount = Math.ceil(LABELS.length / cols);
    var stageHeight = 20 + (rowCount - 1) * rowHeight + cardH + 24;
    return { fragW: fragW, cols: cols, gutter: gutter, colWidth: colWidth, cardW: cardW, cardH: cardH, scaleX: scaleX, rowHeight: rowHeight, stageHeight: stageHeight };
  }

  function layoutFragments(p) {
    var m = fragMath();
    if (fragmentsStage) fragmentsStage.style.height = m.stageHeight + "px";
    LABELS.forEach(function (label, i) {
      var el = fragmentEls[i];
      if (!el) return;
      var off = STACK[i];
      var col = i % m.cols, row = Math.floor(i / m.cols);
      var local = Math.max(0, Math.min(1, (p - i * 0.05) / 0.4));
      var eased = local * local * (3 - 2 * local);
      var sLeft = m.fragW / 2 - m.cardW / 2 + off.x * m.scaleX, sTop = m.stageHeight / 2 - 32 + off.y;
      var aLeft = col * (m.colWidth + m.gutter) + (m.colWidth - m.cardW) / 2, aTop = 20 + row * m.rowHeight;
      var left = sLeft + (aLeft - sLeft) * eased;
      var top = sTop + (aTop - sTop) * eased;
      var z = off.z * (1 - eased), rx = off.rx * (1 - eased), ry = off.ry * (1 - eased), r = off.r * (1 - eased);
      var active = state.activeTipIndex === i;
      var scale = active ? 1.07 : 0.82 + 0.18 * eased;
      el.style.width = m.cardW.toFixed(0) + "px";
      el.style.height = m.cardH + "px";
      el.style.left = left.toFixed(1) + "px";
      el.style.top = top.toFixed(1) + "px";
      el.style.transform = "perspective(1500px) translateZ(" + z.toFixed(1) + "px) rotateX(" + rx.toFixed(1) + "deg) rotateY(" + ry.toFixed(1) + "deg) rotate(" + r.toFixed(1) + "deg) scale(" + scale.toFixed(3) + ")";
      el.style.background = active ? "var(--ink)" : "var(--paper)";
      el.style.border = "1.5px solid " + (active ? "var(--green)" : "var(--line)");
      el.style.color = active ? "var(--paper)" : "var(--ink)";
      el.classList.toggle("is-active", active);
      el.style.boxShadow = active
        ? "0 0 0 5px oklch(58% 0.19 264 / 0.16), 0 26px 48px -20px oklch(6% 0.02 258 / 0.55)"
        : "0 20px 40px -22px oklch(6% 0.02 258 / 0.45)";
      var iconWrap = el.querySelector(".bx-fragment-icon");
      if (iconWrap) {
        iconWrap.style.background = active ? "linear-gradient(155deg, var(--green), var(--green-deep))" : "var(--paper-2)";
        iconWrap.style.color = active ? "var(--ink)" : "var(--green-deep)";
      }
    });
  }

  /* ---------------- scroll-driven updates ---------------- */
  var raf = null;
  function scheduleScroll() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      raf = null;
      try { updateScroll(); } catch (e) { /* noop */ }
    });
  }

  function updateScroll() {
    var vh = window.innerHeight || 800;
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    var scrollY = window.scrollY;

    if (scrub) {
      var scrubRect = scrub.getBoundingClientRect();
      var runway = Math.max(1, scrubRect.height - vh);
      var p = Math.max(0, Math.min(1, -scrubRect.top / runway));
      scatterProgress = p;
      layoutFragments(p);
      if (progressLine) progressLine.style.width = (p * 100).toFixed(1) + "%";
      if (scatterCaption) {
        var caption;
        if (p < 0.15) caption = "Nine fragments, stacked and unreadable.";
        else if (p < 0.6) caption = "SPiD starts laying them out.";
        else if (p < 0.92) caption = "Almost a person.";
        else caption = "Found — someone you actually met.";
        if (scatterCaption.textContent !== caption) scatterCaption.textContent = caption;
      }
    }

    if (cinema && cineFrame) {
      var cineRect = cinema.getBoundingClientRect();
      var run = Math.max(1, cineRect.height - vh);
      var cp = Math.max(0, Math.min(1, -cineRect.top / run));
      var ce = cp * cp * (3 - 2 * cp);
      var copyP = Math.max(0, Math.min(1, (cp - 0.42) / 0.28));
      cineFrame.style.width = (62 + 38 * ce).toFixed(2) + "%";
      cineFrame.style.height = (66 + 34 * ce).toFixed(2) + "vh";
      cineFrame.style.borderRadius = (20 - 20 * ce).toFixed(1) + "px";
      if (cineImg) cineImg.style.transform = "scale(" + (1.22 - 0.22 * ce).toFixed(3) + ")";
      if (cineVeil) cineVeil.style.background = "linear-gradient(180deg, oklch(6% 0.02 258 / 0.15), oklch(6% 0.02 258 / " + (0.25 + 0.45 * ce).toFixed(2) + "))";
      if (cineCopy) {
        cineCopy.style.opacity = copyP.toFixed(2);
        cineCopy.style.transform = "translateY(" + (26 - 26 * copyP).toFixed(1) + "px)";
      }
    }

    if (progressBar) {
      progressBar.style.width = (scrollable > 0 ? (scrollY / scrollable) * 100 : 0).toFixed(2) + "%";
    }
  }

  /* ---------------- loading / page transition curtain ---------------- */
  function setCurtain(active) {
    if (!curtain) return;
    curtain.style.transform = active ? "translateY(0%)" : "translateY(-101%)";
    curtain.style.borderRadius = active ? "0 0 32px 32px" : "0 0 0px 0px";
    curtain.style.pointerEvents = active ? "auto" : "none";
    curtain.style.filter = active ? "url(#bx-liquid)" : "none";
    if (curtainGlow) curtainGlow.style.opacity = active ? "1" : "0";
    if (curtainLogo) {
      curtainLogo.style.opacity = active ? "1" : "0";
      curtainLogo.style.transform = active ? "scale(1)" : "scale(0.8)";
    }
  }

  var LOAD_LINES = ["Reading the signal…", "Untangling context…", "Almost a person…", "One more beat…"];
  var loadIdx = 0;
  var loadCopyTimer = setInterval(function () {
    if (!(state.entering || state.exiting)) return;
    loadIdx = (loadIdx + 1) % LOAD_LINES.length;
    if (loadCopy) loadCopy.textContent = LOAD_LINES[loadIdx];
  }, 650);

  setCurtain(true);
  requestAnimationFrame(function () { state.entered = true; applyEnteredStyles(); });
  setTimeout(function () { state.entered = true; applyEnteredStyles(); }, 50);
  setTimeout(function () {
    state.entering = false;
    setCurtain(false);
  }, 220);

  function applyEnteredStyles() {
    if (heroInner) {
      heroInner.style.opacity = state.entered ? "1" : "0";
      heroInner.style.transform = state.entered ? "translateY(0)" : "translateY(28px)";
    }
    if (heroCardWrap) {
      heroCardWrap.style.opacity = state.entered ? "1" : "0";
      heroCardWrap.style.transform = state.entered ? "translateY(0)" : "translateY(40px)";
    }
  }

  /* intercept internal nav links for the curtain page transition */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-page-link]");
    if (!a) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;
    e.preventDefault();
    state.exiting = true;
    setCurtain(true);
    setTimeout(function () { window.location.href = href; }, 620);
  });

  /* ---------------- pillar blackhole transition ---------------- */
  var pillarNavTimer = null;
  function onPillarNav(e, href) {
    e.preventDefault();
    var x = e.clientX, y = e.clientY;
    var maxR = Math.hypot(window.innerWidth, window.innerHeight) * 1.05;
    if (blackhole) {
      blackhole.style.transition = "none";
      blackhole.style.background = "radial-gradient(circle at " + x + "px " + y + "px, oklch(22% 0.02 60) 0%, oklch(11% 0.015 60) 55%, oklch(4% 0.01 60) 100%)";
      blackhole.style.clipPath = "circle(0px at " + x + "px " + y + "px)";
      blackhole.style.opacity = "1";
    }
    [ringA, ringB].forEach(function (el) {
      if (!el) return;
      el.style.transition = "none";
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.width = "0px";
      el.style.height = "0px";
      el.style.opacity = "0.9";
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (blackhole) {
          blackhole.style.transition = "clip-path 0.7s cubic-bezier(0.6,0,0.15,1)";
          blackhole.style.clipPath = "circle(" + maxR.toFixed(0) + "px at " + x + "px " + y + "px)";
        }
        if (ringA) {
          ringA.style.transition = "width 0.62s cubic-bezier(0.16,1,0.3,1), height 0.62s cubic-bezier(0.16,1,0.3,1), opacity 0.62s ease 0.2s, transform 0.62s linear";
          ringA.style.width = "620px"; ringA.style.height = "620px"; ringA.style.opacity = "0"; ringA.style.transform = "translate(-50%,-50%) rotate(280deg)";
        }
        if (ringB) {
          ringB.style.transition = "width 0.5s cubic-bezier(0.16,1,0.3,1), height 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease 0.16s, transform 0.5s linear";
          ringB.style.width = "380px"; ringB.style.height = "380px"; ringB.style.opacity = "0"; ringB.style.transform = "translate(-50%,-50%) rotate(-220deg)";
        }
      });
    });
    clearTimeout(pillarNavTimer);
    pillarNavTimer = setTimeout(function () { window.location.href = href; }, 720);
  }
  $$(".bx-pillar-card").forEach(function (a) {
    a.addEventListener("click", function (e) { onPillarNav(e, a.getAttribute("href")); });
  });

  /* ---------------- custom cursor ---------------- */
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (fine && cursor) {
    window.addEventListener("mousemove", function (e) {
      cursor.style.transform = "translate(" + e.clientX + "px," + e.clientY + "px)";
      cursor.style.opacity = "1";
      var view = e.target.closest && e.target.closest('[data-cursor="view"]');
      if (view) {
        cursor.style.width = "78px"; cursor.style.height = "78px"; cursor.style.margin = "-39px 0 0 -39px";
        cursor.style.background = "#f4f6ff"; cursor.style.borderColor = "transparent";
        cursor.style.mixBlendMode = "difference";
        if (cursorLabel) cursorLabel.style.opacity = "1";
      } else {
        var hot = e.target.closest && e.target.closest("a,button,input,textarea");
        var big = !!hot;
        cursor.style.mixBlendMode = "normal";
        if (cursorLabel) cursorLabel.style.opacity = "0";
        cursor.style.width = big ? "62px" : "34px";
        cursor.style.height = big ? "62px" : "34px";
        cursor.style.margin = big ? "-31px 0 0 -31px" : "-17px 0 0 -17px";
        cursor.style.background = big ? "oklch(58% 0.19 264 / 0.18)" : "transparent";
        cursor.style.borderColor = big ? "oklch(58% 0.19 264 / 0.7)" : "oklch(6% 0.02 258 / 0.45)";
      }
    }, { passive: true });
    document.addEventListener("mouseleave", function () { cursor.style.opacity = "0"; });
  }

  /* ---------------- hero parallax + tilt ---------------- */
  if (heroSection && heroGlow) {
    heroSection.addEventListener("mousemove", function (e) {
      var r = heroSection.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      heroGlow.style.transform = "translate(" + (px * -50).toFixed(1) + "px," + (py * -50).toFixed(1) + "px)";
    });
  }

  $$(".bx-tilt").forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = "perspective(900px) rotateY(" + (px * 7).toFixed(2) + "deg) rotateX(" + (-py * 7).toFixed(2) + "deg)";
    });
    el.addEventListener("mouseleave", function () { el.style.transform = ""; });
  });

  /* ---------------- magnet buttons ---------------- */
  $$(".bx-magnet").forEach(function (el) {
    var text = el.querySelector(".bx-magnet-text");
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = "translate(" + (px * 14).toFixed(1) + "px," + (py * 12).toFixed(1) + "px)";
      if (text) text.style.transform = "translate(" + (px * 8).toFixed(1) + "px," + (py * 7).toFixed(1) + "px)";
    });
    el.addEventListener("mouseleave", function () {
      el.style.transform = "translate(0,0)";
      if (text) text.style.transform = "translate(0,0)";
    });
  });

  /* ---------------- CTA blob parallax ---------------- */
  var ctaDepths = [1, -1.4, 1.6, -1.2];
  function applyCtaShift(nx, ny) {
    ctaBlobs.forEach(function (el, i) {
      var d = ctaDepths[i] || 1;
      el.style.transform = "translate(" + (nx * 24 * d).toFixed(1) + "px," + (ny * 24 * d).toFixed(1) + "px)";
    });
  }
  if (ctaSection) {
    ctaSection.addEventListener("mousemove", function (e) {
      var r = ctaSection.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      applyCtaShift(nx, ny);
    });
    ctaSection.addEventListener("mouseleave", function () { applyCtaShift(0, 0); });
  }

  /* ---------------- handle input / claim card ---------------- */
  function sanitize(raw) {
    return String(raw || "").toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "").slice(0, 32);
  }

  var checkTimer = null;
  function setHandleStatus(status, showClaim) {
    state.handleStatus = status;
    state.showClaim = showClaim;
    if (handleStatusEl) {
      handleStatusEl.textContent = status.msg;
      handleStatusEl.style.color = STATUS_COLORS[status.kind] || STATUS_COLORS.idle;
    }
    if (handleUnderline) {
      handleUnderline.style.width = state.handleValue ? "100%" : "0%";
      handleUnderline.style.background = STATUS_COLORS[status.kind] || STATUS_COLORS.idle;
    }
    if (claimWrap) claimWrap.style.display = showClaim ? "block" : "none";
  }

  function runCheck(handle) {
    if (!handle) {
      setHandleStatus({ kind: "idle", msg: "Type a name to see if it's free." }, false);
      return;
    }
    if (handle.length < 3) {
      setHandleStatus({ kind: "invalid", msg: "At least 3 characters." }, false);
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(handle)) {
      setHandleStatus({ kind: "invalid", msg: "Letters, numbers and hyphens only." }, false);
      return;
    }
    setHandleStatus({ kind: "checking", msg: "Checking " + handle + ".atbexo.com…" }, false);
    clearTimeout(checkTimer);
    checkTimer = setTimeout(function () {
      var reserved = ["admin", "test", "bexo", "support", "www", "dash", "api", "app", "root"];
      if (reserved.indexOf(handle) !== -1) {
        setHandleStatus({ kind: "taken", msg: "That name is reserved. Try another." }, false);
      } else {
        setHandleStatus({ kind: "available", msg: handle + ".atbexo.com is available." }, true);
        var claimLink = claimWrap ? claimWrap.querySelector("a") : null;
        if (claimLink) {
          claimLink.href = "https://dash.mybexo.com/login?claim=" + encodeURIComponent(handle);
        }
        var claimHandleSpan = document.getElementById("bxClaimHandle");
        if (claimHandleSpan) {
          claimHandleSpan.textContent = handle + ".atbexo.com";
        }
      }
    }, 380);
  }

  if (handleInput) {
    handleInput.addEventListener("input", function (e) {
      var clean = sanitize(e.target.value);
      state.handleValue = clean;
      e.target.value = clean;
      runCheck(clean);
    });
    handleInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (state.handleStatus && state.handleStatus.kind === "available" && state.handleValue) {
          window.location.href = "https://dash.mybexo.com/login?claim=" + encodeURIComponent(state.handleValue);
        }
      }
    });
  }

  // Handle "Create your card" CTA clicks to focus handle input
  document.querySelectorAll(".bx-nav-cta, .bx-overlay-cta").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (handleInput) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(function () {
          handleInput.focus();
        }, 400);
      }
    });
  });

  /* ---------------- SPiD graph ---------------- */
  function renderSpid() {
    SIGNALS.forEach(function (s, i) {
      var active = i === state.spidActive;
      var node = spidNodes[i];
      if (node) {
        node.classList.toggle("is-active", active);
        node.style.transform = "translate(-50%,-50%) scale(" + (active ? 1.08 : 1) + ")";
        node.style.background = active ? "var(--green)" : "oklch(23% 0.03 258)";
        node.style.borderColor = active ? "var(--green)" : "oklch(34% 0.03 258)";
        node.style.color = active ? "var(--ink)" : "oklch(85% 0.008 75)";
        node.style.fontWeight = active ? "600" : "500";
        node.style.boxShadow = active ? "0 8px 22px -8px oklch(58% 0.19 264 / 0.55)" : "none";
      }
      var line = spidLines[i];
      if (line) {
        line.setAttribute("stroke", active ? "var(--green)" : "oklch(45% 0.03 258 / 0.45)");
        line.setAttribute("stroke-width", active ? "0.55" : "0.25");
        line.style.strokeDasharray = active ? "3 3" : "none";
        line.style.animation = active ? "bx-flow 0.6s linear infinite" : "none";
      }
    });
    if (spidCaptionIcon) spidCaptionIcon.className = SIGNALS[state.spidActive].icon;
    if (spidCaptionLabel) spidCaptionLabel.textContent = SIGNALS[state.spidActive].label;
    if (spidCaptionText) spidCaptionText.textContent = SIGNALS[state.spidActive].tip;
  }

  var spidTimer = setInterval(function () {
    if (state.spidAuto) {
      state.spidActive = (state.spidActive + 1) % SIGNALS.length;
      renderSpid();
    }
  }, 3200);

  var spidResumeTimer = null;
  spidNodes.forEach(function (node, i) {
    node.addEventListener("mouseenter", function () {
      clearTimeout(spidResumeTimer);
      if (i !== state.spidActive || state.spidAuto) {
        state.spidActive = i;
        state.spidAuto = false;
        renderSpid();
      }
    });
  });
  if (spidGraph) {
    spidGraph.addEventListener("mouseleave", function () {
      clearTimeout(spidResumeTimer);
      spidResumeTimer = setTimeout(function () { state.spidAuto = true; }, 1200);
    });
  }

  /* ---------------- scroll / resize wiring ---------------- */
  window.addEventListener("scroll", scheduleScroll, { passive: true });
  window.addEventListener("resize", function () {
    if (fragmentsStage && fragmentsStage.offsetWidth && Math.abs(fragmentsStage.offsetWidth - state.fragWidth) > 4) {
      state.fragWidth = fragmentsStage.offsetWidth;
    }
    scheduleScroll();
  }, { passive: true });
  window.addEventListener("load", scheduleScroll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleScroll);

  if (window.IntersectionObserver) {
    var scrubWatch = new IntersectionObserver(scheduleScroll, { rootMargin: "300px 0px", threshold: 0 });
    [scrub, cinema].forEach(function (r) { if (r) scrubWatch.observe(r); });
    var stackWatch = new IntersectionObserver(scheduleScroll, { rootMargin: "400px 0px", threshold: 0 });
    if (pillarsGrid) stackWatch.observe(pillarsGrid);
  }

  /* ---------------- reveal-on-scroll ---------------- */
  if (!reduced && window.IntersectionObserver) {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.opacity = "1";
          en.target.style.transform = "translateY(0)";
          reveal.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    requestAnimationFrame(function () {
      $$("[data-reveal]").forEach(function (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(26px)";
        el.style.transition = "opacity 0.9s ease, transform 0.9s cubic-bezier(0.16,1,0.3,1)";
        reveal.observe(el);
      });
    });
  }

  /* ---------------- lenis smooth scroll ---------------- */
  if (!reduced && window.Lenis) {
    var lenis = new Lenis({ duration: 1.05, easing: function (t) { return 1 - Math.pow(1 - t, 3); }, smoothWheel: true });
    var lenisRaf = function (time) { lenis.raf(time); requestAnimationFrame(lenisRaf); };
    requestAnimationFrame(lenisRaf);
  }

  /* ---------------- init ---------------- */
  renderActiveTip();
  renderSpid();
  scheduleScroll();
})();
