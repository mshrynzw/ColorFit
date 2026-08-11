/* ============================================================
   ColorFit — 03-result Interactions & Animations
   Before/After / 比較モード / 書き出し設定 / 書き出しシミュレーション
   ============================================================ */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  var liveStatus = document.getElementById("live-status");
  function announce(msg) {
    if (liveStatus) liveStatus.textContent = msg;
  }

  /* ----------------------------------------------------------
     Mobile action menu
     ---------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-actions");
    if (!toggle || !menu) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
    }
    function open() {
      toggle.setAttribute("aria-expanded", "true");
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
    }
    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? close() : open();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    var saveBtn = document.getElementById("btn-save");
    var saveMobile = document.getElementById("btn-save-mobile");
    var exportHeaderBtn = document.getElementById("btn-export-header");
    var exportHeaderMobile = document.getElementById("btn-export-header-mobile");
    if (saveMobile && saveBtn) saveMobile.addEventListener("click", function () { saveBtn.click(); close(); });
    if (exportHeaderMobile && exportHeaderBtn) exportHeaderMobile.addEventListener("click", function () { exportHeaderBtn.click(); close(); });
  }

  /* ----------------------------------------------------------
     ヘッダーアクション（保存 / 書き出す）
     ---------------------------------------------------------- */
  function initHeaderActions() {
    var saveBtn = document.getElementById("btn-save");
    var exportHeaderBtn = document.getElementById("btn-export-header");

    function pulse(btn) {
      if (!btn || typeof gsap === "undefined" || prefersReducedMotion) return;
      gsap.fromTo(btn, { scale: 1 }, { scale: 0.96, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        pulse(saveBtn);
        announce("保存しました");
      });
    }
    if (exportHeaderBtn) {
      exportHeaderBtn.addEventListener("click", function () {
        pulse(exportHeaderBtn);
        var mainExportBtn = document.getElementById("btn-export");
        if (mainExportBtn) mainExportBtn.click();
      });
    }
  }

  /* ----------------------------------------------------------
     調整前 / 調整後 切り替え ＋ 比較モード
     ---------------------------------------------------------- */
  function initImageViews() {
    var btnBefore = document.getElementById("btn-show-before");
    var btnAfter = document.getElementById("btn-show-after");
    var btnCompare = document.getElementById("btn-compare");
    var simpleView = document.getElementById("simple-view");
    var compareSlider = document.getElementById("compare-slider");
    var imgBefore = document.getElementById("img-simple-before");
    var imgAfter = document.getElementById("img-simple-after");
    if (!btnBefore || !btnAfter || !btnCompare) return;

    var compareMode = false;

    function showSimple(which) {
      if (compareMode) exitCompare();
      if (which === "before") {
        imgBefore.classList.add("is-active");
        imgAfter.classList.remove("is-active");
        btnBefore.classList.add("is-active");
        btnAfter.classList.remove("is-active");
        btnBefore.setAttribute("aria-pressed", "true");
        btnAfter.setAttribute("aria-pressed", "false");
        announce("調整前の画像を表示しています");
      } else {
        imgAfter.classList.add("is-active");
        imgBefore.classList.remove("is-active");
        btnAfter.classList.add("is-active");
        btnBefore.classList.remove("is-active");
        btnAfter.setAttribute("aria-pressed", "true");
        btnBefore.setAttribute("aria-pressed", "false");
        announce("調整後の画像を表示しています");
      }
    }

    function enterCompare() {
      compareMode = true;
      simpleView.hidden = true;
      compareSlider.hidden = false;
      btnCompare.textContent = "比較を終了";
      btnBefore.classList.remove("is-active");
      btnAfter.classList.remove("is-active");
      announce("比較モードにしました");
    }
    function exitCompare() {
      compareMode = false;
      simpleView.hidden = false;
      compareSlider.hidden = true;
      btnCompare.textContent = "比較する";
    }

    btnBefore.addEventListener("click", function () { showSimple("before"); });
    btnAfter.addEventListener("click", function () { showSimple("after"); });
    btnCompare.addEventListener("click", function () {
      if (compareMode) {
        exitCompare();
        announce("比較モードを終了しました");
      } else {
        enterCompare();
      }
    });
  }

  /* ----------------------------------------------------------
     比較スライダー — mouse / touch / keyboard
     ---------------------------------------------------------- */
  function initCompareSlider() {
    var slider = document.getElementById("compare-slider");
    var afterLayer = document.getElementById("compare-after");
    var handle = document.getElementById("compare-handle");
    if (!slider || !afterLayer || !handle) return;

    var dragging = false;

    function setPosition(percent) {
      percent = Math.max(0, Math.min(100, percent));
      afterLayer.style.clipPath = "inset(0 " + (100 - percent) + "% 0 0)";
      handle.style.left = percent + "%";
      slider.setAttribute("aria-valuenow", Math.round(percent));
    }

    function percentFromClientX(clientX) {
      var rect = slider.getBoundingClientRect();
      var x = clientX - rect.left;
      return (x / rect.width) * 100;
    }

    function onPointerDown(e) {
      dragging = true;
      move(e);
    }
    function move(e) {
      if (!dragging) return;
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(percentFromClientX(clientX));
    }
    function onPointerUp() { dragging = false; }

    slider.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", onPointerUp);
    slider.addEventListener("touchstart", function (e) { dragging = true; move(e); }, { passive: true });
    slider.addEventListener("touchmove", move, { passive: true });
    slider.addEventListener("touchend", onPointerUp);

    slider.addEventListener("keydown", function (e) {
      var current = parseFloat(handle.style.left) || 50;
      if (e.key === "ArrowLeft") { setPosition(current - 4); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPosition(current + 4); e.preventDefault(); }
      if (e.key === "Home") { setPosition(0); e.preventDefault(); }
      if (e.key === "End") { setPosition(100); e.preventDefault(); }
    });

    setPosition(50);
  }

  /* ----------------------------------------------------------
     解析ゲージ（円グラフ）
     ---------------------------------------------------------- */
  function initAnalysisGauge() {
    var circle = document.getElementById("analysis-gauge-value");
    var scoreEl = document.getElementById("analysis-score");
    if (!circle) return;
    var circumference = 213.6;
    var score = 92;
    var target = circumference * (1 - score / 100);

    if (typeof gsap !== "undefined" && !prefersReducedMotion) {
      gsap.to(circle, {
        strokeDashoffset: target,
        duration: 1.4,
        delay: 0.6,
        ease: "power2.out",
      });
      var counter = { v: 0 };
      gsap.to(counter, {
        v: score,
        duration: 1.4,
        delay: 0.6,
        ease: "power2.out",
        onUpdate: function () {
          if (scoreEl) scoreEl.textContent = Math.round(counter.v);
        },
      });
    } else {
      circle.style.strokeDashoffset = target;
      if (scoreEl) scoreEl.textContent = score;
    }
  }

  /* ----------------------------------------------------------
     書き出し設定：形式 / 画質 / ファイル名
     ---------------------------------------------------------- */
  function initExportSettings() {
    var formatBtns = document.querySelectorAll(".segmented__btn[data-format]");
    var qualityBtns = document.querySelectorAll(".segmented__btn[data-quality]");
    var filenameInput = document.getElementById("filename-input");

    function baseName(filename) {
      var idx = filename.lastIndexOf(".");
      return idx === -1 ? filename : filename.substring(0, idx);
    }

    formatBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        formatBtns.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");

        if (filenameInput) {
          var format = btn.getAttribute("data-format");
          var name = baseName(filenameInput.value || "hero-image-colorfit");
          filenameInput.value = name + "." + format;
        }
        announce("書き出し形式を" + btn.textContent.trim() + "に変更しました");
      });
    });

    qualityBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        qualityBtns.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        announce("画質を" + btn.textContent.trim() + "に変更しました");
      });
    });
  }

  /* ----------------------------------------------------------
     画像を書き出す — 処理シミュレーション + 成功演出
     ---------------------------------------------------------- */
  function initExportFlow() {
    var btn = document.getElementById("btn-export");
    var label = btn ? btn.querySelector(".btn--export__label") : null;
    var status = document.getElementById("export-status");
    var checkMark = btn ? btn.querySelector(".check-mark") : null;
    if (!btn || !status) return;

    var phases = [
      { text: "書き出し準備中…", duration: 700 },
      { text: "画像を書き出しています…", duration: 900 },
      { text: "書き出しが完了しました", duration: 700 },
    ];

    function runPhase(i) {
      if (i >= phases.length) {
        succeed();
        return;
      }
      status.textContent = phases[i].text;
      if (label) label.textContent = phases[i].text;
      announce(phases[i].text);
      setTimeout(function () { runPhase(i + 1); }, prefersReducedMotion ? 150 : phases[i].duration);
    }

    function succeed() {
      btn.classList.add("is-success");
      status.textContent = "画像を書き出しました";
      announce("画像を書き出しました");

      if (typeof gsap !== "undefined" && !prefersReducedMotion && checkMark) {
        gsap.fromTo(checkMark, { strokeDashoffset: 20 }, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" });
        gsap.fromTo(
          btn,
          { boxShadow: "0 0 0 0 rgba(94,234,212,0.5)" },
          { boxShadow: "0 0 0 10px rgba(94,234,212,0)", duration: 0.8, ease: "power2.out" }
        );
      }

      setTimeout(function () {
        btn.disabled = false;
        btn.classList.remove("is-success");
        if (checkMark) checkMark.style.strokeDashoffset = 20;
        if (label) label.textContent = "画像を書き出す";
        status.textContent = "";
      }, 3200);
    }

    btn.addEventListener("click", function () {
      btn.disabled = true;
      btn.classList.remove("is-success");
      if (label) label.textContent = "書き出し準備中…";
      runPhase(0);
    });
  }

  /* ----------------------------------------------------------
     もう一度調整する — ページ遷移前のフェード
     ---------------------------------------------------------- */
  function initAgainLink() {
    var link = document.getElementById("btn-again");
    if (!link) return;
    link.addEventListener("click", function (e) {
      if (typeof gsap === "undefined" || prefersReducedMotion) return;
      e.preventDefault();
      var href = link.getAttribute("href");
      gsap.to("body", {
        opacity: 0,
        duration: 0.35,
        ease: "power1.out",
        onComplete: function () {
          window.location.href = href;
        },
      });
    });
  }

  /* ----------------------------------------------------------
     GSAP ページロード演出
     ---------------------------------------------------------- */
  function initLoadAnimation() {
    if (typeof gsap === "undefined" || prefersReducedMotion) return;

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from('[data-anim="header-in"]', { opacity: 0, y: -10, duration: 0.6, stagger: 0.06 })
      .from('[data-anim="status"]', { opacity: 0, y: -8, scale: 0.96, duration: 0.6 }, "-=0.2")
      .from(
        '[data-anim="main-image"]',
        { opacity: 0, y: 24, scale: 0.97, filter: "blur(10px)", duration: 1.0, ease: "power2.out" },
        "-=0.2"
      )
      .from('[data-anim="meta"]', { opacity: 0, y: 10, duration: 0.5 }, "-=0.5")
      .from('[data-anim="palette"]', { opacity: 0, y: 16, duration: 0.6, stagger: 0.12 }, "-=0.5")
      .from('[data-anim="adjust"]', { opacity: 0, y: 16, duration: 0.6 }, "-=0.35")
      .from('[data-anim="export"]', { opacity: 0, y: 16, duration: 0.6 }, "-=0.4")
      .from('[data-anim="cta"]', { opacity: 0, y: 14, duration: 0.6 }, "-=0.35");
  }

  /* ----------------------------------------------------------
     Init
     ---------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeaderActions();
    initImageViews();
    initCompareSlider();
    initAnalysisGauge();
    initExportSettings();
    initExportFlow();
    initAgainLink();
    initLoadAnimation();
  });
})();
