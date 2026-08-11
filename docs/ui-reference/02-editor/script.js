/* ============================================================
   ColorFit — 02-editor Interactions & Animations
   GSAP / Drag&Drop / Before-After Compare / Sliders / Presets
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

    // mirror header actions on mobile
    var saveBtn = document.getElementById("btn-save");
    var saveMobile = document.getElementById("btn-save-mobile");
    var exportBtn = document.getElementById("btn-export-header");
    var exportMobile = document.getElementById("btn-export-header-mobile");
    if (saveMobile && saveBtn) saveMobile.addEventListener("click", function () { saveBtn.click(); close(); });
    if (exportMobile && exportBtn) exportMobile.addEventListener("click", function () { exportBtn.click(); close(); });
  }

  /* ----------------------------------------------------------
     Header action mock feedback (保存 / 書き出す)
     ---------------------------------------------------------- */
  function initHeaderActions() {
    var saveBtn = document.getElementById("btn-save");
    var exportBtn = document.getElementById("btn-export-header");

    function pulse(btn, label) {
      if (!btn) return;
      var original = btn.querySelector(".btn--run__label") ? null : btn.innerHTML;
      if (typeof gsap !== "undefined" && !prefersReducedMotion) {
        gsap.fromTo(
          btn,
          { scale: 1 },
          { scale: 0.96, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" }
        );
      }
      announce(label);
    }

    if (saveBtn) saveBtn.addEventListener("click", function () { pulse(saveBtn, "保存しました"); });
    if (exportBtn) exportBtn.addEventListener("click", function () {
      pulse(exportBtn, "書き出し準備中です");
      var exportBtnPanel = document.getElementById("btn-export");
      if (exportBtnPanel) exportBtnPanel.click();
    });
  }

  /* ----------------------------------------------------------
     Color fields: hex <-> swatch <-> CSS variables
     ---------------------------------------------------------- */
  function normalizeHex(value) {
    if (!value) return null;
    var v = value.trim();
    if (v[0] !== "#") v = "#" + v;
    if (/^#([0-9A-Fa-f]{6})$/.test(v)) return v.toUpperCase();
    return null;
  }

  function initColorFields() {
    var root = document.documentElement;
    var map = [
      { key: "primary", cssVar: "--user-primary" },
      { key: "secondary", cssVar: "--user-secondary" },
      { key: "accent", cssVar: "--user-accent" },
    ];

    map.forEach(function (item) {
      var textInput = document.getElementById("color-" + item.key);
      var picker = document.getElementById("color-" + item.key + "-picker");
      var badge = document.getElementById("color-" + item.key + "-badge");

      function apply(hex) {
        root.style.setProperty(item.cssVar, hex);
        if (item.key === "accent") {
          // accent tends to be light; derive a slightly darker dot color for visibility
          root.style.setProperty("--user-accent-dot", darken(hex, 0.35));
        }
        if (badge) badge.textContent = hex;
        if (picker) picker.value = hex;
      }

      if (textInput) {
        textInput.addEventListener("change", function () {
          var hex = normalizeHex(textInput.value);
          if (hex) {
            apply(hex);
            textInput.value = hex;
          } else {
            textInput.value = badge ? badge.textContent : textInput.defaultValue;
          }
        });
      }
      if (picker) {
        picker.addEventListener("input", function () {
          var hex = picker.value.toUpperCase();
          apply(hex);
          if (textInput) textInput.value = hex;
        });
      }
    });
  }

  function darken(hex, amount) {
    var num = parseInt(hex.replace("#", ""), 16);
    var r = Math.max(0, Math.floor(((num >> 16) & 255) * (1 - amount)));
    var g = Math.max(0, Math.floor(((num >> 8) & 255) * (1 - amount)));
    var b = Math.max(0, Math.floor((num & 255) * (1 - amount)));
    return (
      "#" +
      [r, g, b]
        .map(function (c) {
          return c.toString(16).padStart(2, "0");
        })
        .join("")
        .toUpperCase()
    );
  }

  /* ----------------------------------------------------------
     配色比率 sliders — keep total at 100
     ---------------------------------------------------------- */
  function initRatioSliders() {
    var ids = ["primary", "secondary", "accent"];
    var sliders = {};
    ids.forEach(function (id) {
      sliders[id] = document.getElementById("ratio-" + id);
    });
    var segs = {
      primary: document.getElementById("ratio-seg-primary"),
      secondary: document.getElementById("ratio-seg-secondary"),
      accent: document.getElementById("ratio-seg-accent"),
    };
    var vals = {
      primary: document.getElementById("ratio-primary-val"),
      secondary: document.getElementById("ratio-secondary-val"),
      accent: document.getElementById("ratio-accent-val"),
    };
    var totalEl = document.getElementById("ratio-total-val");
    if (!sliders.primary || !sliders.secondary || !sliders.accent) return;

    function update(changedId) {
      var values = {};
      ids.forEach(function (id) {
        values[id] = Number(sliders[id].value);
      });

      var total = values.primary + values.secondary + values.accent;
      if (total !== 100) {
        var others = ids.filter(function (id) {
          return id !== changedId;
        });
        var othersTotal = others.reduce(function (sum, id) {
          return sum + values[id];
        }, 0);
        var remaining = 100 - values[changedId];

        if (othersTotal <= 0) {
          var share = remaining / others.length;
          others.forEach(function (id) {
            values[id] = Math.round(share);
          });
        } else {
          others.forEach(function (id) {
            values[id] = Math.round((values[id] / othersTotal) * remaining);
          });
        }

        // fix rounding drift on the last "other" slider
        var drift = 100 - (values.primary + values.secondary + values.accent);
        if (drift !== 0) {
          var adjustTarget = others[others.length - 1];
          values[adjustTarget] += drift;
        }
      }

      ids.forEach(function (id) {
        values[id] = Math.max(0, Math.min(100, values[id]));
        sliders[id].value = values[id];
        if (vals[id]) vals[id].textContent = values[id] + "%";
        if (segs[id]) segs[id].style.width = values[id] + "%";
      });

      if (totalEl) {
        totalEl.textContent = values.primary + values.secondary + values.accent;
      }
    }

    ids.forEach(function (id) {
      sliders[id].addEventListener("input", function () {
        update(id);
      });
    });
  }

  /* ----------------------------------------------------------
     File upload — drag & drop / file picker
     ---------------------------------------------------------- */
  var state = {
    hasImage: true, // sample image pre-loaded
  };

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    var kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + " KB";
    return (kb / 1024).toFixed(1) + " MB";
  }

  function initUpload() {
    var dropzone = document.getElementById("dropzone");
    var fileInput = document.getElementById("file-input");
    var imgBefore = document.getElementById("img-before");
    var imgAfter = document.getElementById("img-after");
    var metaDim = document.getElementById("meta-dimensions");
    var metaFormat = document.getElementById("meta-format");
    var metaSize = document.getElementById("meta-size");
    var removeBtn = document.getElementById("btn-remove-image");
    if (!dropzone || !fileInput) return;

    var validTypes = ["image/jpeg", "image/png", "image/webp"];

    function setEmpty() {
      dropzone.classList.add("is-empty");
      dropzone.classList.remove("has-image");
      state.hasImage = false;
      announce("画像が削除されました");
    }

    function setHasImage() {
      dropzone.classList.remove("is-empty");
      dropzone.classList.add("has-image");
      state.hasImage = true;
    }

    function loadFile(file) {
      if (!file || validTypes.indexOf(file.type) === -1) {
        announce("対応していないファイル形式です");
        return;
      }
      var url = URL.createObjectURL(file);
      var tempImg = new Image();
      tempImg.onload = function () {
        imgBefore.src = url;
        imgAfter.src = url;
        if (metaDim) metaDim.textContent = tempImg.naturalWidth + " × " + tempImg.naturalHeight + " px";
        if (metaFormat) metaFormat.textContent = file.type.replace("image/", "").toUpperCase();
        if (metaSize) metaSize.textContent = formatBytes(file.size);
        setHasImage();
        announce("画像がアップロードされました");

        if (typeof gsap !== "undefined") {
          gsap.fromTo(
            "#canvas-stage",
            { opacity: prefersReducedMotion ? 1 : 0.3 },
            { opacity: 1, duration: prefersReducedMotion ? 0 : 0.6, ease: "power2.out" }
          );
          gsap.fromTo(
            ".canvas-dropzone",
            { boxShadow: "0 0 0 0 rgba(94,234,212,0)" },
            {
              boxShadow: "0 0 0 3px rgba(94,234,212,0.16)",
              duration: 0.3,
              yoyo: true,
              repeat: 1,
              ease: "power1.inOut",
            }
          );
        }
        resetSlidersToDefault(false);
      };
      tempImg.src = url;
    }

    fileInput.addEventListener("change", function () {
      if (fileInput.files && fileInput.files[0]) loadFile(fileInput.files[0]);
    });

    ["dragenter", "dragover"].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (evt === "dragleave" && e.target !== dropzone) return;
        dropzone.classList.remove("is-dragover");
      });
    });
    dropzone.addEventListener("drop", function (e) {
      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files[0]) loadFile(files[0]);
    });

    // clicking empty state or its icon opens file picker too
    dropzone.addEventListener("click", function (e) {
      if (dropzone.classList.contains("is-empty") && e.target.closest("label") === null) {
        fileInput.click();
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener("click", function () {
        setEmpty();
      });
    }
  }

  /* ----------------------------------------------------------
     Before / After compare slider — mouse, touch, keyboard
     ---------------------------------------------------------- */
  function initCompareSlider() {
    var slider = document.getElementById("compare-slider");
    var afterLayer = document.getElementById("compare-after");
    var handle = document.getElementById("compare-handle");
    if (!slider || !afterLayer || !handle) return;

    var dragging = false;

    function setPosition(percent, animate) {
      percent = Math.max(0, Math.min(100, percent));
      var apply = function () {
        afterLayer.style.clipPath = "inset(0 " + (100 - percent) + "% 0 0)";
        handle.style.left = percent + "%";
      };
      if (animate && typeof gsap !== "undefined" && !prefersReducedMotion) {
        gsap.to({ v: parseFloat(handle.style.left) || 50 }, {
          v: percent,
          duration: 0.5,
          ease: "power3.out",
          onUpdate: function () {
            var v = this.targets()[0].v;
            afterLayer.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
            handle.style.left = v + "%";
          },
        });
      } else {
        apply();
      }
      slider.setAttribute("aria-valuenow", Math.round(percent));
    }

    function percentFromClientX(clientX) {
      var rect = slider.getBoundingClientRect();
      var x = clientX - rect.left;
      return (x / rect.width) * 100;
    }

    function onPointerDown(e) {
      dragging = true;
      slider.setPointerCapture && e.pointerId != null && slider.setPointerCapture(e.pointerId);
      move(e);
    }
    function move(e) {
      if (!dragging) return;
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(percentFromClientX(clientX), false);
    }
    function onPointerUp() {
      dragging = false;
    }

    slider.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", onPointerUp);

    // touch fallback
    slider.addEventListener("touchstart", function (e) { dragging = true; move(e); }, { passive: true });
    slider.addEventListener("touchmove", move, { passive: true });
    slider.addEventListener("touchend", onPointerUp);

    // keyboard support
    slider.addEventListener("keydown", function (e) {
      var current = parseFloat(handle.style.left) || 50;
      if (e.key === "ArrowLeft") { setPosition(current - 4, false); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPosition(current + 4, false); e.preventDefault(); }
      if (e.key === "Home") { setPosition(0, false); e.preventDefault(); }
      if (e.key === "End") { setPosition(100, false); e.preventDefault(); }
    });

    setPosition(50, false);

    // expose for processing-complete reveal animation
    window.__colorfitCompareSlider = { setPosition: setPosition };
  }

  /* ----------------------------------------------------------
     Adjustment sliders — live filter preview
     ---------------------------------------------------------- */
  var sliderDefaults = { temp: 50, saturation: 100, brightness: 100, contrast: 100, hue: 0 };

  var presetValues = {
    natural: { temp: 50, saturation: 100, brightness: 100, contrast: 100, hue: 0 },
    cool: { temp: 68, saturation: 95, brightness: 102, contrast: 105, hue: -6 },
    warm: { temp: 34, saturation: 108, brightness: 103, contrast: 102, hue: 6 },
    chic: { temp: 52, saturation: 80, brightness: 92, contrast: 112, hue: 0 },
    soft: { temp: 48, saturation: 88, brightness: 106, contrast: 90, hue: 0 },
  };

  function applyFilter() {
    var img = document.getElementById("img-after");
    var overlay = document.getElementById("temp-overlay");
    if (!img) return;

    var sat = document.getElementById("slider-saturation").value;
    var bright = document.getElementById("slider-brightness").value;
    var contrast = document.getElementById("slider-contrast").value;
    var hue = document.getElementById("slider-hue").value;
    var temp = document.getElementById("slider-temp").value;

    img.style.filter =
      "saturate(" + sat + "%) brightness(" + bright + "%) contrast(" + contrast + "%) hue-rotate(" + hue + "deg)";

    if (overlay) {
      var diff = (temp - 50) / 50; // -1..1
      var isWarm = diff > 0;
      overlay.style.backgroundColor = isWarm ? "#ff9d52" : "#5ea8ff";
      overlay.style.opacity = Math.min(0.35, Math.abs(diff) * 0.35);
    }
  }

  function setSliderValues(values, animate) {
    Object.keys(values).forEach(function (key) {
      var input = document.getElementById("slider-" + key);
      var label = document.getElementById("slider-" + key + "-val");
      if (!input) return;
      if (animate && typeof gsap !== "undefined" && !prefersReducedMotion) {
        gsap.to(input, {
          value: values[key],
          duration: 0.6,
          ease: "power3.out",
          onUpdate: function () {
            if (label) label.textContent = Math.round(input.value);
            applyFilter();
          },
        });
      } else {
        input.value = values[key];
        if (label) label.textContent = values[key];
      }
    });
    if (!animate) applyFilter();
  }

  function resetSlidersToDefault(animate) {
    setSliderValues(sliderDefaults, animate);
    document.querySelectorAll(".preset-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", "false");
    });
  }

  function initAdjustSliders() {
    ["temp", "saturation", "brightness", "contrast", "hue"].forEach(function (key) {
      var input = document.getElementById("slider-" + key);
      var label = document.getElementById("slider-" + key + "-val");
      if (!input) return;
      input.addEventListener("input", function () {
        if (label) label.textContent = input.value;
        applyFilter();
        // manual adjustment clears active preset highlight
        document.querySelectorAll(".preset-btn").forEach(function (b) {
          b.setAttribute("aria-pressed", "false");
        });
      });
    });

    var resetBtn = document.getElementById("btn-reset-sliders");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        resetSlidersToDefault(true);
      });
    }

    applyFilter();
  }

  function initPresets() {
    var buttons = document.querySelectorAll(".preset-btn");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-preset");
        var values = presetValues[key];
        if (!values) return;
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        setSliderValues(values, true);
      });
    });
  }

  /* ----------------------------------------------------------
     自動調整トグル
     ---------------------------------------------------------- */
  function initAutoAdjust() {
    var toggle = document.getElementById("auto-adjust-toggle");
    var desc = document.getElementById("auto-adjust-desc");
    var sliders = document.getElementById("adjust-sliders");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var isOn = toggle.getAttribute("aria-checked") === "true";
      var next = !isOn;
      toggle.setAttribute("aria-checked", String(next));
      if (desc) desc.hidden = !next;
      if (sliders) sliders.classList.toggle("is-disabled", next);
      sliders && Array.prototype.forEach.call(sliders.querySelectorAll("input"), function (i) {
        i.disabled = next;
      });
      announce(next ? "自動調整をオンにしました" : "自動調整をオフにしました");
    });
  }

  /* ----------------------------------------------------------
     ColorFit実行 — processing simulation
     ---------------------------------------------------------- */
  function initRunColorFit() {
    var btn = document.getElementById("btn-run");
    var label = btn ? btn.querySelector(".btn--run__label") : null;
    var overlay = document.getElementById("processing-overlay");
    var statusText = document.getElementById("processing-status");
    var hint = document.getElementById("run-hint");
    var autoToggle = document.getElementById("auto-adjust-toggle");
    if (!btn || !overlay || !statusText) return;

    var phases = [
      { text: "配色を解析しています…", duration: 1100 },
      { text: "画像を調整しています…", duration: 1300 },
      { text: "調整が完了しました", duration: 900 },
    ];

    function runPhase(i) {
      if (i >= phases.length) {
        finish();
        return;
      }
      statusText.textContent = phases[i].text;
      announce(phases[i].text);
      setTimeout(function () {
        runPhase(i + 1);
      }, prefersReducedMotion ? 200 : phases[i].duration);
    }

    function finish() {
      overlay.classList.remove("is-active");
      btn.classList.remove("is-processing");
      btn.disabled = false;
      if (label) label.textContent = "ColorFitで調整する";
      if (hint) hint.textContent = "調整が完了しました。Before / Afterで比較できます。";

      if (autoToggle && autoToggle.getAttribute("aria-checked") === "true") {
        setSliderValues(presetValues.natural, true);
      }

      // sweep the compare handle to showcase the result, then settle at 50%
      if (window.__colorfitCompareSlider) {
        if (prefersReducedMotion) {
          window.__colorfitCompareSlider.setPosition(50, false);
        } else if (typeof gsap !== "undefined") {
          var obj = { v: 50 };
          gsap.timeline()
            .to(obj, { v: 100, duration: 0.5, ease: "power2.inOut", onUpdate: function () { window.__colorfitCompareSlider.setPosition(obj.v, false); } })
            .to(obj, { v: 0, duration: 0.6, ease: "power2.inOut", onUpdate: function () { window.__colorfitCompareSlider.setPosition(obj.v, false); } })
            .to(obj, { v: 50, duration: 0.5, ease: "power2.out", onUpdate: function () { window.__colorfitCompareSlider.setPosition(obj.v, false); } });
        }
      }
    }

    btn.addEventListener("click", function () {
      if (!state.hasImage) {
        announce("先に画像をアップロードしてください");
        return;
      }
      btn.disabled = true;
      btn.classList.add("is-processing");
      if (label) label.textContent = "処理中…";
      overlay.classList.add("is-active");
      if (hint) hint.textContent = "ColorFitが画像を解析・調整しています。";
      runPhase(0);
    });
  }

  /* ----------------------------------------------------------
     書き出し（モック）
     ---------------------------------------------------------- */
  function initExport() {
    var btn = document.getElementById("btn-export");
    var status = document.getElementById("export-status");
    if (!btn || !status) return;

    btn.addEventListener("click", function () {
      status.textContent = "書き出し準備中…";
      btn.disabled = true;
      setTimeout(function () {
        status.textContent = "書き出しが完了しました";
        btn.disabled = false;
        announce("書き出しが完了しました");
        setTimeout(function () {
          status.textContent = "";
        }, 2600);
      }, prefersReducedMotion ? 200 : 1200);
    });
  }

  /* ----------------------------------------------------------
     GSAP load-in animation
     ---------------------------------------------------------- */
  function initLoadAnimation() {
    if (typeof gsap === "undefined" || prefersReducedMotion) return;

    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from('[data-anim="header-in"]', { opacity: 0, y: -10, duration: 0.6, stagger: 0.06 })
      .from('[data-anim="panel-left"]', { opacity: 0, x: -24, duration: 0.7 }, "-=0.25")
      .from('[data-anim="panel-canvas"]', { opacity: 0, y: 20, scale: 0.98, duration: 0.7 }, "-=0.5")
      .from('[data-anim="panel-right"]', { opacity: 0, x: 24, duration: 0.7 }, "-=0.5");
  }

  /* ----------------------------------------------------------
     Init
     ---------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeaderActions();
    initColorFields();
    initRatioSliders();
    initUpload();
    initCompareSlider();
    initAdjustSliders();
    initPresets();
    initAutoAdjust();
    initRunColorFit();
    initExport();
    initLoadAnimation();
  });
})();
