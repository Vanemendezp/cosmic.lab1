/* ============================================================
   cosmic.lab — script.js
   Menú mobile · Starfield · Scroll reveal · Nav scroll ·
   FAQ · WhatsApp FAB · Formulario con validación
   ============================================================ */

'use strict';

/* ---- NAV: scroll y burger ---- */
(function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const links  = document.getElementById('navLinks');

  // Scroll -> nav oscurecida
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Burger toggle
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });

  // Cierra menú al hacer click en un link
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    });
  });
})();


/* ---- STARFIELD CANVAS ---- */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx  = canvas.getContext('2d');
  let W, H, stars;
  const COUNT = 180;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildStars();
  }

  function buildStars() {
    stars = Array.from({ length: COUNT }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H,
      r:   Math.random() * 1.4 + .2,
      o:   Math.random() * .7 + .1,
      spd: Math.random() * .3 + .05,
      t:   Math.random() * Math.PI * 2   // fase para parpadeo
    }));
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.t += 0.008;
      const alpha = s.o * (.6 + .4 * Math.sin(s.t));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(248,250,252,${alpha})`;
      ctx.fill();

      // movimiento muy lento hacia abajo
      s.y += s.spd;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    });

    // Líneas de constelación (cerca)
    ctx.strokeStyle = 'rgba(124,58,237,.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          ctx.globalAlpha = (1 - dist / 80) * .4;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();


/* ---- SCROLL REVEAL ---- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Delay escalonado suave
        const delay = (entry.target.dataset.delay || 0);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Añadir delay escalonado por sección
  document.querySelectorAll('section').forEach(section => {
    const revealEls = section.querySelectorAll('.reveal');
    revealEls.forEach((el, i) => {
      el.dataset.delay = i * 80;
    });
  });

  els.forEach(el => observer.observe(el));
})();


/* ---- FORMULARIO DE CONTACTO ---- */
(function initForm() {
  const form    = document.getElementById('contactForm');
  if (!form) return;

  const success = document.getElementById('formSuccess');

  // Validación individual
  function validateField(input) {
    const id    = input.id;
    const errEl = document.getElementById(`${id}-error`);
    if (!errEl) return true;

    let msg = '';
    if (input.required && !input.value.trim()) {
      msg = 'Este campo es requerido.';
    } else if (input.type === 'email' && input.value.trim()) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(input.value.trim())) msg = 'Ingresa un email válido.';
    }

    errEl.textContent = msg;
    input.classList.toggle('error', !!msg);
    return !msg;
  }

  // Blur en cada campo
  ['name','email','message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(el));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = document.getElementById('name');
    const email   = document.getElementById('email');
    const message = document.getElementById('message');
    const btn     = form.querySelector('.btn');
    const btnText = form.querySelector('.btn__text');
    const btnLoad = form.querySelector('.btn__loader');

    const valid = [name, email, message].map(validateField).every(Boolean);
    if (!valid) return;

    // Estado de carga
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoad.style.display = 'inline';

    // Simulación de envío (reemplazar con fetch real)
    await new Promise(r => setTimeout(r, 1400));

    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoad.style.display = 'none';

    form.reset();
    success.style.display = 'flex';

    setTimeout(() => { success.style.display = 'none'; }, 5000);

    /*
    // PRODUCCIÓN: reemplazar la simulación con tu endpoint real
    try {
      const res = await fetch('TU_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.value,
          email: email.value,
          message: message.value
        })
      });
      if (res.ok) { ... }
    } catch(err) { console.error(err); }
    */
  });
})();


/* ---- SMOOTH ANCHOR SCROLL (con offset nav) ---- */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ---- ACTIVE NAV LINK por sección visible ---- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
})();
