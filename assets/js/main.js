/* Rapha Physio Care — interactions & scroll animations
   GSAP + ScrollTrigger + Lenis (smooth scroll). Built by NovaLink Innovations. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- Navigation ---------- */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.nav__burger');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.nav__mobile a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }
  document.querySelectorAll('.has-drop > .nav__link').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var li = btn.parentElement;
      var open = li.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.has-drop.is-open').forEach(function (li) {
      if (!li.contains(e.target)) { li.classList.remove('is-open'); li.querySelector('.nav__link').setAttribute('aria-expanded', 'false'); }
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq__item');
      var open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 480);
    });
  });

  /* ---------- Contact form ---------- */
  var form = document.querySelector('#enquiry-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form__status');
      var btn = form.querySelector('button[type="submit"]');
      status.className = 'form__status';
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.ok) {
            status.textContent = 'Thank you. Your enquiry has been sent and we will be in touch soon.';
            status.classList.add('is-ok'); form.reset();
          } else { throw new Error((res && res.error) || 'error'); }
        })
        .catch(function () {
          status.textContent = 'Sorry, your message could not be sent right now. Please call 0450 119 053 or email connectraphaphysio@gmail.com.';
          status.classList.add('is-err');
        })
        .finally(function () { btn.disabled = false; btn.textContent = 'Send enquiry'; });
    });
  }

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Animated waves behind the footer (always moving) ---------- */
  (function waves() {
    var root = document.getElementById('waves');
    if (!root) return;
    var CONFIG = {
      base: 200, baseMobile: 250, color: '#2E9A70', fill: 0.45, refWidth: 1440, points: 8,
      layers: [
        { wave: 400, opacity: 0.55, speed: 0.50, blur: 1.2, seed: 11 },
        { wave: 300, opacity: 0.75, speed: 0.60, blur: 1.0, seed: 29 },
        { wave: 150, amp: 80, opacity: 1.0, speed: 0.70, blur: 0.8, seed: 53 }
      ]
    };
    var NS = 'http://www.w3.org/2000/svg', W = CONFIG.refWidth, M = W * 0.18, TAU = Math.PI * 2, xs = [];
    for (var i = 0; i <= CONFIG.points; i++) xs.push(-M + i * ((W + 2 * M) / CONFIG.points));
    function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
    var layers = CONFIG.layers.map(function (c, idx) {
      var r = rng(c.seed);
      var pts = xs.map(function () { return { p1: r() * TAU, p2: r() * TAU, f1: 0.8 + r() * 0.4, f2: 0.8 + r() * 0.4 }; });
      var div = document.createElement('div'); div.className = 'waves__layer';
      div.style.setProperty('--m', c.blur); div.style.opacity = c.opacity;
      var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('preserveAspectRatio', 'none');
      var id = 'wg' + idx;
      svg.innerHTML = '<defs><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="0"><stop offset="0" stop-color="' + CONFIG.color + '" stop-opacity="' + CONFIG.fill + '"/><stop offset="1" stop-color="' + CONFIG.color + '" stop-opacity="0"/></linearGradient></defs><path fill="url(#' + id + ')"></path>';
      div.appendChild(svg); root.appendChild(div);
      return { c: c, pts: pts, div: div, svg: svg, grad: svg.querySelector('linearGradient'), path: svg.querySelector('path'), h: 0, mean: 0, amp: 0 };
    });
    function layout() {
      var base = window.innerWidth <= 600 ? CONFIG.baseMobile : CONFIG.base;
      layers.forEach(function (L) {
        L.h = base + L.c.wave; L.mean = L.c.wave * 0.5; L.amp = L.c.amp != null ? L.c.amp : L.c.wave * 0.45;
        L.div.style.height = L.h + 'px'; L.svg.setAttribute('viewBox', '0 0 ' + W + ' ' + L.h); L.grad.setAttribute('y2', L.h);
      });
    }
    function path(ys, h) {
      var d = 'M ' + xs[0].toFixed(1) + ' ' + ys[0].toFixed(1);
      for (var i = 0; i < xs.length - 1; i++) {
        var x0 = xs[i - 1] != null ? xs[i - 1] : xs[i], y0 = ys[i - 1] != null ? ys[i - 1] : ys[i];
        var x1 = xs[i], y1 = ys[i], x2 = xs[i + 1], y2 = ys[i + 1];
        var x3 = xs[i + 2] != null ? xs[i + 2] : x2, y3 = ys[i + 2] != null ? ys[i + 2] : y2;
        d += ' C ' + (x1 + (x2 - x0) / 6).toFixed(1) + ' ' + (y1 + (y2 - y0) / 6).toFixed(1) + ' ' + (x2 - (x3 - x1) / 6).toFixed(1) + ' ' + (y2 - (y3 - y1) / 6).toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
      }
      return d + ' L ' + xs[xs.length - 1].toFixed(1) + ' ' + h + ' L ' + xs[0].toFixed(1) + ' ' + h + ' Z';
    }
    function frame(t) {
      layers.forEach(function (L) {
        var sp = L.c.speed;
        var ys = L.pts.map(function (p) { return L.mean + L.amp * (0.62 * Math.sin(t * sp * p.f1 + p.p1) + 0.38 * Math.sin(t * sp * 1.62 * p.f2 + p.p2)); });
        L.path.setAttribute('d', path(ys, L.h));
      });
    }
    layout(); window.addEventListener('resize', layout);
    if (reduce) { frame(0); return; }
    var running = false, raf = 0;
    function loop(now) { frame(now / 1000); raf = requestAnimationFrame(loop); }
    function start() { if (!running) { running = true; raf = requestAnimationFrame(loop); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    frame(0);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { e[0].isIntersecting ? start() : stop(); }).observe(root);
    else start();
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  })();

  /* ---------- GSAP animations ---------- */
  if (!hasGsap || reduce) { doc.classList.remove('js'); return; }
  gsap.registerPlugin(ScrollTrigger);

  // Smooth scrolling, synced with ScrollTrigger (same set-up as the reference)
  if (typeof window.Lenis !== 'undefined') {
    var lenis = new Lenis({ duration: 1.2, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.5 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.addEventListener('refresh', function () { lenis.resize(); });
    window.lenis = lenis;
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length > 1 && document.querySelector(id)) { e.preventDefault(); lenis.scrollTo(id, { offset: -100 }); }
      });
    });
  }

  // Split headings into words
  function splitWords(el) {
    var out = [];
    function wrap(text, parent, cls) {
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { parent.appendChild(document.createTextNode(' ')); return; }
        var outer = document.createElement('span'); outer.className = 'split-word';
        var inner = document.createElement('span'); inner.textContent = part;
        if (cls) inner.className = cls;
        outer.appendChild(inner); parent.appendChild(outer); out.push(inner);
      });
    }
    var nodes = Array.prototype.slice.call(el.childNodes);
    el.textContent = '';
    nodes.forEach(function (n) {
      if (n.nodeType === 3) wrap(n.textContent, el);
      else if (n.nodeName === 'BR') el.appendChild(n);
      else wrap(n.textContent, el, n.className || '');
    });
    return out;
  }
  var heroWords = [];
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var words = splitWords(el);
    if (el.closest('.hero')) { heroWords = words; return; }
    gsap.from(words, { yPercent: 50, opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1, overwrite: true }); }
  });

  var mm = gsap.matchMedia();
  var hero = document.querySelector('.hero');

  if (!hero) {
    gsap.from('.nav__bar', { y: -50, opacity: 0, duration: 1, ease: 'power1.out', delay: 0.2 });
  } else {
    var card = hero.querySelector('.hero__card');
    var slot = hero.querySelector('.hero__slot');
    var vid = hero.querySelector('.hero__video');
    var overlay = hero.querySelector('.hero__overlay');
    var stat = hero.querySelector('.hero__stat');
    var side = hero.querySelector('.hero__side');
    var badges = hero.querySelector('.hero__badges');

    /* HERO intro (load): panel fades in → words rise → video grows from the centre + nav drops → sides slide in */
    var intro = gsap.timeline({ defaults: { force3D: true } });
    intro.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 0.25 }, 0.2)
      .fromTo(heroWords, { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: 'power4.out', stagger: 0.12 }, 0.44)
      .fromTo(vid, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 1, ease: 'power1.out' }, 1.45)
      .fromTo('.nav__bar', { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power1.out' }, 1.46)
      .fromTo(stat, { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power1.out' }, 2.45)
      .fromTo(side, { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'power1.out' }, 2.45)
      .fromTo(badges, { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power1.out' }, 2.45);

    /* HERO scroll: video fills the panel behind the text, darkens, text turns white */
    mm.add('(min-width: 992px)', function () {
      var DISTANCE = 1.1;
      function metrics() {
        var s = slot.getBoundingClientRect(), c = card.getBoundingClientRect();
        return { left: s.left - c.left, top: s.top - c.top, width: s.width, height: s.height };
      }
      var textEls = hero.querySelectorAll('.hero__title, .hero__stat, .hero__stat-sub, .hero__side p, .hero__badges');
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero, start: 'top top', end: function () { return '+=' + window.innerHeight * DISTANCE; },
          pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true
        }
      });
      tl.fromTo(vid,
        { left: function () { return metrics().left; }, top: function () { return metrics().top; }, width: function () { return metrics().width; }, height: function () { return metrics().height; }, borderRadius: 24 },
        { left: 0, top: 0, width: function () { return card.clientWidth; }, height: function () { return card.clientHeight; }, borderRadius: 40, ease: 'none' })
        .to(overlay, { opacity: 0.75, ease: 'none' }, 0)
        .to(textEls, { color: '#ffffff', ease: 'none' }, 0.1)
        .to(hero.querySelectorAll('.hero__title .accent, .hero__badge svg, .hero__stat svg'), { color: '#9FD8BE', ease: 'none' }, 0.1);
      ScrollTrigger.refresh();
      return function () { gsap.set([vid, overlay, textEls], { clearProps: 'left,top,width,height,borderRadius,opacity,color' }); };
    });
  }

  /* CONDITIONS: pinned list, items fade by distance from centre, snaps, background + text swap */
  var cond = document.querySelector('.cond');
  if (cond) {
    var items = Array.prototype.slice.call(cond.querySelectorAll('.cond__list li'));
    var imgs = cond.querySelectorAll('.cond__bg img');
    var descs = cond.querySelectorAll('.cond__item');
    var n = items.length, current = -1;
    function setActive(i) {
      if (i === current) return; current = i;
      [items, imgs, descs].forEach(function (list) { Array.prototype.forEach.call(list, function (el, k) { el.classList.toggle('is-active', k === i); }); });
    }
    setActive(0);
    mm.add('(min-width: 992px)', function () {
      var wrap = cond.querySelector('.cond__listwrap');
      var list = cond.querySelector('.cond__list');
      function render(progress) {
        var h = items[0].offsetHeight, center = wrap.offsetHeight / 2;
        var vi = progress * (n - 1);
        gsap.set(list, { y: center - (vi * h + h / 2) });
        items.forEach(function (item, i) {
          var d = Math.abs(i - vi);
          gsap.set(item, { opacity: d < 0.5 ? 1 : d < 1.5 ? 0.5 : d < 2.5 ? 0.25 : d < 3.5 ? 0.1 : 0.05 });
        });
        var c = Math.round(vi);
        if (Math.abs(vi - c) < 0.15) setActive(c);
      }
      render(0);
      ScrollTrigger.create({
        trigger: cond, start: 'top top', end: '+=' + (n - 1) * 300,
        pin: true, scrub: 0.1, snap: 1 / (n - 1),
        onUpdate: function (st) { render(st.progress); },
        onRefresh: function (st) { render(st.progress); }
      });
      return function () { gsap.set(list, { clearProps: 'transform' }); gsap.set(items, { clearProps: 'opacity' }); };
    });
  }

  /* SERVICES: pinned horizontal card row */
  var svc = document.querySelector('.svc');
  if (svc) {
    var track = svc.querySelector('.svc__track');
    mm.add('(min-width: 992px)', function () {
      function amount() { return -(track.scrollWidth - window.innerWidth); }
      var tween = gsap.to(track, { x: amount, ease: 'none' });
      ScrollTrigger.create({ trigger: svc, start: 'center center', end: function () { return '+=' + track.scrollWidth; }, pin: true, animation: tween, scrub: 1, invalidateOnRefresh: true });
    });
  }

  /* APPROACH: cards fly in from the right with a tilt, pass the centre, exit left */
  var approach = document.querySelector('.approach');
  if (approach) {
    mm.add('(min-width: 992px)', function () {
      var cards = gsap.utils.toArray('.approach .quote-card');
      var tl = gsap.timeline({ scrollTrigger: { trigger: approach, start: 'center center', end: function () { return '+=' + cards.length * 100 + '%'; }, pin: true, scrub: 1 } });
      var gap = 0.4, initial = 0.6, final = 0.6;
      cards.forEach(function (c, i) {
        var last = i === cards.length - 1, off = initial - i * gap;
        var startMul = off > 0 ? 1 - off : 1;
        var toCenter = off > 0 ? 1 - off : 1, startAt = off > 0 ? 0 : Math.abs(off);
        var exitDur = last ? 1 - final : 1, exitMul = last ? 1 - final : 1;
        gsap.set(c, { xPercent: -50, yPercent: -50, x: function () { return window.innerWidth * 1.2 * startMul; }, y: 120 * startMul, rotation: 10 * startMul, transformOrigin: 'center bottom' });
        tl.to(c, { keyframes: [
          { x: 0, y: 0, rotation: 0, duration: toCenter, ease: 'none' },
          { x: function () { return -window.innerWidth * 1.2 * exitMul; }, y: 120 * exitMul, rotation: -10 * exitMul, duration: exitDur, ease: 'none' }
        ] }, startAt);
      });
      return function () { gsap.set(cards, { clearProps: 'all' }); };
    });
  }

  /* HOME VISITS band grows into place */
  var band = document.querySelector('.band__frame');
  if (band) gsap.fromTo(band, { scale: 0.9 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'top 25%', scrub: 1 } });

  document.querySelectorAll('[data-parallax] img, [data-parallax] video').forEach(function (m) {
    gsap.fromTo(m, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: m.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
