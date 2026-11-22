/* ============================================================
   شبكات الإنترنت — منطق التنقل بين الشرائح
   - الأسهم ← → (اتجاه RTL: القوس الأيسر = التالي)
   - زر المسافة = الشريحة التالية
   - أزرار السابق / التالي على الشاشة
   - حدّان أدنى وأقصى: لا يوجد انتقال خارج النطاق
   - عداد + شريط تقدم + لون تفاعلي
   - دعم اللمس (Swipe) على الجوال
   ============================================================ */
(function () {
  'use strict';

  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var counterEl = document.getElementById('slideCounter');
  var fillEl = document.getElementById('progressFill');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');

  var total = slides.length;
  var current = 0;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /** قراءة رقم الشريحة من الرابط مثل #slide-3 عند التحميل (ميزة إضافية للوصول المباشر) */
  function readHash() {
    var match = (window.location.hash || '').match(/slide-?(\d+)/i);
    if (!match) return;
    var n = parseInt(match[1], 10);
    if (!isNaN(n) && n >= 1 && n <= total) {
      current = n - 1;
    }
  }

  function update() {
    for (var i = 0; i < slides.length; i++) {
      var isActive = i === current;
      slides[i].classList.toggle('is-active', isActive);
      slides[i].setAttribute('aria-hidden', isActive ? 'false' : 'true');
    }

    counterEl.textContent = pad(current + 1) + ' / ' + pad(total);
    fillEl.style.width = ((current + 1) / total * 100) + '%';

    /* منع الانتقال عند الأطراف: تعطيل الأزرار */
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === total - 1;

    /* مزامنة الرابط دون إحداث تمرير في الصفحة */
    try {
      history.replaceState(null, '', '#slide-' + (current + 1));
    } catch (e) { /* بعض البيئات تمنع replaceState على file:// */ }
  }

  function goTo(index) {
    /* حصر القيمة داخل النطاق المسموح */
    var target = Math.max(0, Math.min(total - 1, index));
    if (target === current) { update(); return; }
    current = target;
    update();
  }

  function next() {
    if (current < total - 1) goTo(current + 1);
  }

  function prev() {
    if (current > 0) goTo(current - 1);
  }

  /* ====== لوحة المفاتيح ====== */
  document.addEventListener('keydown', function (event) {
    var tag = (event.target && event.target.tagName) ? event.target.tagName.toUpperCase() : '';
    var isFormControl = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    if (event.code === 'Space') {
      /* اترك السلوك الافتراضي للأزرار حتى لا تتضاعف القفزات */
      if (tag === 'BUTTON' || tag === 'A' || isFormControl) return;
      event.preventDefault();
      next();
      return;
    }

    if (isFormControl) return;

    switch (event.key) {
      case 'ArrowLeft':   /* RTL: السهم الأيسر = التالي */
        event.preventDefault(); next(); break;
      case 'ArrowRight':  /* RTL: السهم الأيمن = السابق */
        event.preventDefault(); prev(); break;
      case 'PageDown':
        event.preventDefault(); next(); break;
      case 'PageUp':
        event.preventDefault(); prev(); break;
      case 'Home':
        event.preventDefault(); goTo(0); break;
      case 'End':
        event.preventDefault(); goTo(total - 1); break;
      default:
        break;
    }
  });

  /* ====== أزرار الشاشة ====== */
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  /* ====== السحب باللمس (جوال / لوحي) ====== */
  var touchStartX = null;
  var touchStartY = null;

  document.addEventListener('touchstart', function (event) {
    var t = event.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  document.addEventListener('touchend', function (event) {
    if (touchStartX === null) return;
    var t = event.changedTouches[0];
    var dx = t.clientX - touchStartX;
    var dy = t.clientY - touchStartY;
    touchStartX = touchStartY = null;

    /* سحب أفقي واضح فقط (وليس تمريرًا عموديًا) */
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) { next(); } else { prev(); } /* سحب نحو اليسار = التالي — باتجاه RTL */
    }
  }, { passive: true });

  /* ====== التجاوب مع تغيير الـ hash يدويًا (#slide-N) ====== */
  window.addEventListener('hashchange', function () {
    readHash();
    update();
  });

  /* ====== التشغيل ====== */
  readHash();
  update();
})();
