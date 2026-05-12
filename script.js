/* ============================================================
   cosmic.lab — interactivity
============================================================ */

(() => {
  /* ---------- nav scroll ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- burger ---------- */
  const burger = document.getElementById('navBurger');
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.nav__links a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('is-open'));
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- starfield ---------- */
  const canvas = document.getElementById('starfield');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let stars = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function size() {
      const w = canvas.clientWidth = window.innerWidth;
      const h = canvas.clientHeight = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(180, Math.floor((w * h) / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.2,
        a: Math.random() * 0.7 + 0.2,
        d: Math.random() * 0.012 + 0.004,
        s: Math.random() > 0.5 ? 1 : -1,
      }));
    }
    size();
    window.addEventListener('resize', size);

    function tick() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.a += s.d * s.s;
        if (s.a > 0.9 || s.a < 0.15) s.s *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242,239,231,${s.a})`;
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ---------- marquee ---------- */
  const mq = document.getElementById('marqueeTrack');
  if (mq) {
    const items = [
      'Shopify Liquid', 'HTML / CSS / JS', 'WordPress', 'SEO Técnico',
      'Schema Markup', 'Core Web Vitals', 'CMS a medida', 'GitHub Pages',
      'Mercado Pago', 'Calendly', 'Analytics 4', 'Lighthouse'
    ];
    const build = () => {
      const pieces = [];
      for (let i = 0; i < items.length; i++) {
        pieces.push(`<span class="marquee__item">${items[i]}</span>`);
        pieces.push(`<span class="marquee__sep" aria-hidden="true"></span>`);
      }
      // duplicate for seamless loop
      mq.innerHTML = pieces.join('') + pieces.join('');
    };
    build();
  }

  /* ---------- form ---------- */
  const form = document.getElementById('contactForm');
  const ok = document.getElementById('formOk');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();
    if (!name || !email || !msg) return;
    ok.classList.add('show');
    form.reset();
    setTimeout(() => ok.classList.remove('show'), 6000);
  });

  /* ============================================================
     TWEAKS PANEL
  ============================================================ */
  const DEFAULTS = window.__TWEAK_DEFAULTS__ || { accent: '#B7A57A', hero: 'split', density: 'calm' };
  let state = { ...DEFAULTS };

  const tweaks = document.getElementById('tweaks');
  const tweaksClose = document.getElementById('tweaksClose');

  function hexToRgba(hex, a) {
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2),16),
          g = parseInt(h.slice(2,4),16),
          b = parseInt(h.slice(4,6),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function apply(s) {
    document.documentElement.style.setProperty('--accent', s.accent);
    document.documentElement.style.setProperty('--accent-soft', hexToRgba(s.accent, 0.14));
    document.documentElement.style.setProperty('--accent-line', hexToRgba(s.accent, 0.32));

    document.body.classList.remove('hero-split', 'hero-stacked', 'hero-centered');
    document.body.classList.add('hero-' + s.hero);

    document.body.classList.toggle('dense', s.density === 'dense');

    // sync UI
    document.querySelectorAll('[data-accent]').forEach(b =>
      b.classList.toggle('active', b.dataset.accent.toLowerCase() === s.accent.toLowerCase()));
    document.querySelectorAll('[data-hero]').forEach(b =>
      b.classList.toggle('active', b.dataset.hero === s.hero));
    document.querySelectorAll('[data-density]').forEach(b =>
      b.classList.toggle('active', b.dataset.density === s.density));
  }
  apply(state);

  function persist(patch) {
    state = { ...state, ...patch };
    apply(state);
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: patch }, '*');
    } catch {}
  }

  document.querySelectorAll('[data-accent]').forEach(b => {
    b.addEventListener('click', () => persist({ accent: b.dataset.accent }));
  });
  document.querySelectorAll('[data-hero]').forEach(b => {
    b.addEventListener('click', () => persist({ hero: b.dataset.hero }));
  });
  document.querySelectorAll('[data-density]').forEach(b => {
    b.addEventListener('click', () => persist({ density: b.dataset.density }));
  });

  /* Edit-mode protocol */
  function showTweaks() { tweaks.classList.add('show'); }
  function hideTweaks() {
    tweaks.classList.remove('show');
    try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch {}
  }
  tweaksClose?.addEventListener('click', hideTweaks);

  window.addEventListener('message', (e) => {
    const t = e.data && e.data.type;
    if (t === '__activate_edit_mode') showTweaks();
    else if (t === '__deactivate_edit_mode') hideTweaks();
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch {}
})();
