/* ============================================================
   ColorFit — 04-settings Interactions & Animations
   カテゴリ切り替え / トグル / セグメント / スライダー / 保存・初期化
   ============================================================ */

(function () {
  "use strict";

  var osReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var prefersReducedMotion = osReducedMotion; // may be true also via UI setting, see updateMotionMode()

  var liveStatus = document.getElementById("live-status");
  function announce(msg) {
    if (liveStatus) liveStatus.textContent = msg;
  }

  var defaults = {
    format: "webp",
    quality: "standard",
    theme: "dark",
    autoAdjust: true,
    intensity: 70,
    natural: true,
    filenameMode: "colorfit",
    metadata: true,
    uiAnimation: "standard",
    processAnimation: true,
    reduceMotion: false,
  };

  var current = Object.assign({}, defaults);
  var dirty = false;

  /* ----------------------------------------------------------
     Dirty state (未保存の変更)
     ---------------------------------------------------------- */
  function markDirty() {
    dirty = true;
    var headerBadge = document.getElementById("unsaved-badge-header");
    var footerBadge = document.getElementById("unsaved-badge-footer");
    if (headerBadge) headerBadge.hidden = false;
    if (footerBadge) footerBadge.hidden = false;
  }
  function clearDirty() {
    dirty = false;
    var headerBadge = document.getElementById("unsaved-badge-header");
    var footerBadge = document.getElementById("unsaved-badge-footer");
    if (headerBadge) headerBadge.hidden = true;
    if (footerBadge) footerBadge.hidden = true;
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

    var saveMobile = document.getElementById("btn-save-mobile");
    var saveMain = document.getElementById("btn-save");
    if (saveMobile && saveMain) {
      saveMobile.addEventListener("click", function () {
        saveMain.click();
        close();
      });
    }
  }

  /* ----------------------------------------------------------
     カテゴリ切り替え（Desktop/Tablet タブ + Mobile セレクト）
     ---------------------------------------------------------- */
  var categories = ["basic", "appearance", "processing", "export", "animation"];
  var activeCategory = "basic";

  function animDuration(base) {
    if (prefersReducedMotion || current.uiAnimation === "off") return 0.001;
    if (current.uiAnimation === "reduced") return base * 0.55;
    return base;
  }

  function switchCategory(next) {
    if (next === activeCategory) return;
    var currentPanel = document.getElementById("panel-" + activeCategory);
    var nextPanel = document.getElementById("panel-" + next);
    if (!currentPanel || !nextPanel) return;

    // update tabs
    categories.forEach(function (cat) {
      var tab = document.getElementById("tab-" + cat);
      if (!tab) return;
      var isActive = cat === next;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    // sync mobile select
    var select = document.getElementById("category-select");
    if (select) select.value = next;

    var doFade = typeof gsap !== "undefined";
    var outDur = animDuration(0.22);
    var inDur = animDuration(0.36);

    if (!doFade || (prefersReducedMotion && outDur < 0.01)) {
      currentPanel.hidden = true;
      nextPanel.hidden = false;
      activeCategory = next;
      focusPanelHeading(nextPanel);
      return;
    }

    gsap.to(currentPanel, {
      opacity: 0,
      y: -6,
      filter: "blur(3px)",
      duration: outDur,
      ease: "power2.in",
      onComplete: function () {
        currentPanel.hidden = true;
        currentPanel.style.opacity = "";
        currentPanel.style.transform = "";
        currentPanel.style.filter = "";

        nextPanel.hidden = false;
        gsap.fromTo(
          nextPanel,
          { opacity: 0, y: 8, filter: "blur(4px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: inDur, ease: "power2.out" }
        );
        activeCategory = next;
        focusPanelHeading(nextPanel);
      },
    });
  }

  function focusPanelHeading(panel) {
    // move a11y focus context without stealing visual focus ring aggressively
    panel.setAttribute("tabindex", "0");
  }

  function initCategoryNav() {
    var tablist = document.getElementById("settings-tablist");
    if (tablist) {
      var tabs = Array.prototype.slice.call(tablist.querySelectorAll(".settings-tab"));
      tabs.forEach(function (tab, index) {
        tab.addEventListener("click", function () {
          switchCategory(tab.getAttribute("data-category"));
        });
        tab.addEventListener("keydown", function (e) {
          var newIndex = null;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") newIndex = (index + 1) % tabs.length;
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") newIndex = (index - 1 + tabs.length) % tabs.length;
          if (e.key === "Home") newIndex = 0;
          if (e.key === "End") newIndex = tabs.length - 1;
          if (newIndex !== null) {
            e.preventDefault();
            tabs[newIndex].focus();
            switchCategory(tabs[newIndex].getAttribute("data-category"));
          }
        });
      });
    }

    var select = document.getElementById("category-select");
    if (select) {
      select.addEventListener("change", function () {
        switchCategory(select.value);
      });
    }

    // links like "基本設定で変更" inside export summary
    document.querySelectorAll("[data-goto-category]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchCategory(btn.getAttribute("data-goto-category"));
        var tab = document.getElementById("tab-" + btn.getAttribute("data-goto-category"));
        if (tab) tab.focus();
      });
    });
  }

  /* ----------------------------------------------------------
     セグメントコントロール（汎用）
     ---------------------------------------------------------- */
  function updateExportSummary() {
    var formatLabelMap = { webp: "WebP", jpeg: "JPEG", png: "PNG" };
    var qualityLabelMap = { high: "高品質", standard: "標準", light: "軽量" };
    var formatChip = document.getElementById("summary-format");
    var qualityChip = document.getElementById("summary-quality");
    if (formatChip) formatChip.textContent = formatLabelMap[current.format] || current.format;
    if (qualityChip) qualityChip.textContent = qualityLabelMap[current.quality] || current.quality;
  }

  function updateFilenamePreview() {
    var el = document.getElementById("filename-preview-result");
    if (!el) return;
    var ext = current.format === "jpeg" ? "jpg" : current.format;
    if (current.filenameMode === "colorfit") {
      el.textContent = "hero-image-colorfit." + ext;
    } else {
      el.textContent = "hero-image." + ext;
    }
  }

  function initSegmentedControls() {
    document.querySelectorAll(".segmented[data-setting]").forEach(function (group) {
      var settingKey = group.getAttribute("data-setting");
      var buttons = Array.prototype.slice.call(group.querySelectorAll(".segmented__btn"));
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) {
            b.classList.remove("is-active");
            b.setAttribute("aria-pressed", "false");
          });
          btn.classList.add("is-active");
          btn.setAttribute("aria-pressed", "true");

          var value = btn.getAttribute("data-value");
          current[settingKey] = value;
          markDirty();

          if (settingKey === "format" || settingKey === "quality") {
            updateExportSummary();
            updateFilenamePreview();
          }
          if (settingKey === "filenameMode") updateFilenamePreview();
          if (settingKey === "theme") {
            announce("テーマを" + btn.textContent.trim() + "に変更しました（プレビュー用のモックです）");
          }

          if (typeof gsap !== "undefined" && !prefersReducedMotion) {
            gsap.fromTo(btn, { scale: 1 }, { scale: 1.04, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut" });
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     トグルスイッチ（汎用）
     ---------------------------------------------------------- */
  function bindToggle(id, onChange) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", function () {
      if (el.disabled) return;
      var next = el.getAttribute("aria-checked") !== "true";
      el.setAttribute("aria-checked", String(next));
      markDirty();
      if (onChange) onChange(next);

      if (typeof gsap !== "undefined" && !prefersReducedMotion) {
        gsap.fromTo(
          el.querySelector(".switch__thumb"),
          { scale: 1 },
          { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" }
        );
      }
    });
    // keyboard: Enter/Space handled natively by button element
  }

  function initToggles() {
    bindToggle("toggle-auto-adjust", function (v) { current.autoAdjust = v; });
    bindToggle("toggle-natural", function (v) { current.natural = v; });
    bindToggle("toggle-metadata", function (v) { current.metadata = v; });
    bindToggle("toggle-process-animation", function (v) { current.processAnimation = v; });
    bindToggle("toggle-reduce-motion", function (v) {
      current.reduceMotion = v;
      updateMotionMode();
    });
  }

  function updateMotionMode() {
    prefersReducedMotion = osReducedMotion || current.reduceMotion;
  }

  function initOsMotionDetection() {
    var toggle = document.getElementById("toggle-reduce-motion");
    var note = document.getElementById("os-motion-note");
    if (osReducedMotion && toggle) {
      toggle.setAttribute("aria-checked", "true");
      toggle.disabled = true;
      current.reduceMotion = true;
      if (note) note.hidden = false;
      updateMotionMode();
    }
  }

  /* ----------------------------------------------------------
     色調整の強度スライダー
     ---------------------------------------------------------- */
  function initIntensitySlider() {
    var slider = document.getElementById("slider-intensity");
    var label = document.getElementById("intensity-value");
    if (!slider) return;
    slider.addEventListener("input", function () {
      current.intensity = Number(slider.value);
      if (label) label.textContent = slider.value + "%";
      markDirty();
    });
  }

  /* ----------------------------------------------------------
     保存
     ---------------------------------------------------------- */
  function initSave() {
    var btn = document.getElementById("btn-save");
    var label = document.getElementById("btn-save-label");
    var headerBtn = document.getElementById("btn-save-header");
    if (!btn) return;

    function doSave() {
      if (label) label.textContent = "保存中…";
      btn.disabled = true;
      setTimeout(function () {
        btn.classList.add("is-success");
        if (label) label.textContent = "保存しました";
        announce("設定を保存しました");
        clearDirty();
        setTimeout(function () {
          btn.classList.remove("is-success");
          if (label) label.textContent = "変更を保存";
          btn.disabled = false;
        }, 1800);
      }, prefersReducedMotion ? 120 : 550);
    }

    btn.addEventListener("click", doSave);
    if (headerBtn) headerBtn.addEventListener("click", doSave);
  }

  /* ----------------------------------------------------------
     初期化（リセット）＋ 確認モーダル
     ---------------------------------------------------------- */
  function applyDefaultsToUI() {
    current = Object.assign({}, defaults);

    document.querySelectorAll(".segmented[data-setting]").forEach(function (group) {
      var key = group.getAttribute("data-setting");
      var buttons = Array.prototype.slice.call(group.querySelectorAll(".segmented__btn"));
      buttons.forEach(function (btn) {
        var isDefault = btn.getAttribute("data-value") === defaults[key];
        btn.classList.toggle("is-active", isDefault);
        btn.setAttribute("aria-pressed", String(isDefault));
      });
    });

    var toggleMap = {
      "toggle-auto-adjust": defaults.autoAdjust,
      "toggle-natural": defaults.natural,
      "toggle-metadata": defaults.metadata,
      "toggle-process-animation": defaults.processAnimation,
    };
    Object.keys(toggleMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute("aria-checked", String(toggleMap[id]));
    });

    // reduce-motion respects OS setting even after reset
    var reduceToggle = document.getElementById("toggle-reduce-motion");
    if (reduceToggle && !osReducedMotion) {
      reduceToggle.setAttribute("aria-checked", String(defaults.reduceMotion));
      reduceToggle.disabled = false;
    }
    updateMotionMode();

    var slider = document.getElementById("slider-intensity");
    var sliderLabel = document.getElementById("intensity-value");
    if (slider) slider.value = defaults.intensity;
    if (sliderLabel) sliderLabel.textContent = defaults.intensity + "%";

    updateExportSummary();
    updateFilenamePreview();
  }

  function initReset() {
    var resetBtn = document.getElementById("btn-reset");
    var overlay = document.getElementById("reset-modal-overlay");
    var cancelBtn = document.getElementById("btn-reset-cancel");
    var confirmBtn = document.getElementById("btn-reset-confirm");
    if (!resetBtn || !overlay) return;

    function openModal() {
      overlay.hidden = false;
      if (typeof gsap !== "undefined" && !prefersReducedMotion) {
        gsap.fromTo(overlay.querySelector(".modal"), { opacity: 0, y: 14, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" });
      }
      confirmBtn.focus();
      document.addEventListener("keydown", onKeydown);
    }
    function closeModal() {
      overlay.hidden = true;
      document.removeEventListener("keydown", onKeydown);
      resetBtn.focus();
    }
    function onKeydown(e) {
      if (e.key === "Escape") closeModal();
    }

    resetBtn.addEventListener("click", openModal);
    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });
    confirmBtn.addEventListener("click", function () {
      applyDefaultsToUI();
      markDirty();
      announce("設定を初期状態に戻しました");
      closeModal();
    });
  }

  /* ----------------------------------------------------------
     GSAP ページロード演出
     ---------------------------------------------------------- */
  function initLoadAnimation() {
    if (typeof gsap === "undefined" || prefersReducedMotion) return;

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from('[data-anim="header-in"]', { opacity: 0, y: -10, duration: 0.55, stagger: 0.06 })
      .from('[data-anim="nav"]', { opacity: 0, x: -16, duration: 0.55 }, "-=0.2")
      .from('[data-anim="content-head"]', { opacity: 0, y: 14, duration: 0.55 }, "-=0.35")
      .from(".setting-card", { opacity: 0, y: 16, duration: 0.5, stagger: 0.08 }, "-=0.3")
      .from('[data-anim="footer"]', { opacity: 0, y: 12, duration: 0.5 }, "-=0.2");
  }

  /* ----------------------------------------------------------
     Init
     ---------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initCategoryNav();
    initSegmentedControls();
    initToggles();
    initOsMotionDetection();
    initIntensitySlider();
    initSave();
    initReset();
    updateExportSummary();
    updateFilenamePreview();
    initLoadAnimation();
  });
})();
