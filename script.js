/* ==========================================================================
   Siddharth Prabhu — portfolio interactions
   Sections: cursor · theme · mobile nav · reveal · counters · konami ·
   project detail disclosure · audience router · resume router
   ========================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------------------------------------------------------------------- */
/* Custom cursor — only for fine-pointer devices, and never fighting      */
/* reduced-motion preferences.                                            */
/* ---------------------------------------------------------------------- */
(function initCursor() {
  if (!isFinePointer || prefersReducedMotion) return;

  document.body.classList.add('custom-cursor-active');
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animateCursor() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const HOVER_SELECTOR = 'a, button, [role="button"], summary, input, select, textarea';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(HOVER_SELECTOR)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(HOVER_SELECTOR)) document.body.classList.remove('cursor-hover');
  });
})();

/* ---------------------------------------------------------------------- */
/* Theme toggle — respects a saved choice, otherwise the OS preference    */
/* ---------------------------------------------------------------------- */
(function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const iconSun = btn.querySelector('.icon-sun');
  const iconMoon = btn.querySelector('.icon-moon');
  const themeColorMeta = document.getElementById('theme-color-meta');
  const saved = localStorage.getItem('theme');
  const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  // An inline head script already set data-theme before first paint (anti-flash);
  // this just syncs the toggle UI + meta to match that decision.
  const startLight = saved ? saved === 'light' : systemLight;

  function apply(isLight) {
    if (isLight) {
      document.documentElement.setAttribute('data-theme', 'light');
      iconSun.style.display = 'none';
      iconMoon.style.display = 'block';
      btn.setAttribute('aria-label', 'Switch to dark theme');
      btn.setAttribute('aria-pressed', 'true');
      themeColorMeta.setAttribute('content', '#FAFDD6');
    } else {
      document.documentElement.removeAttribute('data-theme');
      iconSun.style.display = 'block';
      iconMoon.style.display = 'none';
      btn.setAttribute('aria-label', 'Switch to light theme');
      btn.setAttribute('aria-pressed', 'false');
      themeColorMeta.setAttribute('content', '#0a0a08');
    }
  }
  apply(startLight);

  btn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    apply(!isLight);
    localStorage.setItem('theme', !isLight ? 'light' : 'dark');
  });
})();

/* ---------------------------------------------------------------------- */
/* Mobile nav                                                             */
/* ---------------------------------------------------------------------- */
(function initMobileNav() {
  const burger = document.getElementById('nav-burger');
  const menu = document.getElementById('mobile-nav');

  function close() {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }
  function open() {
    menu.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
  }
  burger.addEventListener('click', () => {
    menu.classList.contains('open') ? close() : open();
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });
})();

/* ---------------------------------------------------------------------- */
/* Scroll reveal                                                          */
/* ---------------------------------------------------------------------- */
(function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) return; // CSS already shows them fully; skip JS work
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => observer.observe(el));
})();

/* ---------------------------------------------------------------------- */
/* Hero stat counters                                                     */
/* ---------------------------------------------------------------------- */
(function initCounters() {
  const targets = [
    { el: document.getElementById('counter1'), value: 250, suffix: 'ms' },
    { el: document.getElementById('counter2'), value: 90, suffix: '%' },
    { el: document.getElementById('counter3'), value: 5, suffix: 'x' },
  ];
  const statsBar = document.querySelector('.hero-stats');
  if (!statsBar) return;

  function setFinal() {
    targets.forEach(t => { t.el.textContent = t.value + t.suffix; });
  }

  if (prefersReducedMotion) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { setFinal(); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(statsBar);
    return;
  }

  function animateCounter(el, target, suffix) {
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      el.textContent = Math.round(start) + suffix;
    }, 16);
  }

  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      targets.forEach(t => animateCounter(t.el, t.value, t.suffix));
      io.disconnect();
    }
  }, { threshold: 0.5 });
  io.observe(statsBar);
})();

/* ---------------------------------------------------------------------- */
/* Konami code easter egg                                                 */
/* ---------------------------------------------------------------------- */
(function initKonami() {
  const overlay = document.getElementById('konami');
  const closeBtn = document.getElementById('konami-close');
  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let index = 0;
  let lastFocused = null;

  function openEgg() {
    lastFocused = document.activeElement;
    overlay.classList.add('active');
    closeBtn.focus();
  }
  function closeEgg() {
    overlay.classList.remove('active');
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener('keydown', e => {
    if (overlay.classList.contains('active')) {
      if (e.key === 'Escape') closeEgg();
      return;
    }
    if (e.key === sequence[index]) {
      index++;
      if (index === sequence.length) { openEgg(); index = 0; }
    } else {
      index = 0;
    }
  });
  closeBtn.addEventListener('click', closeEgg);
})();

/* ---------------------------------------------------------------------- */
/* Project detail disclosures                                             */
/* ---------------------------------------------------------------------- */
(function initProjectDetails() {
  document.querySelectorAll('.project-detail-toggle').forEach(btn => {
    const detail = btn.nextElementSibling;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      detail.classList.toggle('open', !open);
    });
  });
})();

/* ---------------------------------------------------------------------- */
/* Audience router                                                        */
/* ---------------------------------------------------------------------- */
const AudienceRouter = (function initAudience() {
  const cards = document.querySelectorAll('.audience-card');
  const pill = document.getElementById('audience-pill');
  const pillText = document.getElementById('audience-pill-text');
  const pillReset = document.getElementById('audience-pill-reset');
  const note = document.getElementById('projects-adaptive-note');
  const projectCards = document.querySelectorAll('#projects-grid .project-card');

  const LABELS = {
    recruiter: 'Viewing as recruiter',
    professor: 'Viewing as researcher',
    curious: 'Viewing full site',
  };
  const NOTES = {
    recruiter: '↳ Ordered production-first for you.',
    professor: '↳ Ordered research-and-systems-first for you.',
    curious: '',
  };

  function applyOrdering(audience) {
    projectCards.forEach(card => {
      if (audience === 'recruiter' || audience === 'professor') {
        card.style.order = card.getAttribute('data-order-' + audience);
      } else {
        card.style.order = '';
      }
    });
  }

  function applyUI(audience) {
    cards.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.audience === audience)));
    if (audience) {
      pill.classList.add('active');
      pillText.textContent = LABELS[audience];
    } else {
      pill.classList.remove('active');
    }
    note.textContent = audience ? NOTES[audience] : '';
    applyOrdering(audience);
  }

  function set(audience, opts) {
    opts = opts || {};
    if (audience) localStorage.setItem('audience', audience);
    else localStorage.removeItem('audience');
    applyUI(audience);
    if (opts.updateHash !== false) {
      history.replaceState(null, '', audience ? '#' + audience : location.pathname + location.search);
    }
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const current = card.dataset.audience;
      const already = card.getAttribute('aria-pressed') === 'true';
      set(already ? null : current);
    });
  });

  pillReset.addEventListener('click', () => set(null));

  // initial state: URL hash takes priority over a saved preference
  const hashChoice = location.hash.replace('#', '');
  const validHash = ['recruiter', 'professor', 'curious'].includes(hashChoice) ? hashChoice : null;
  const saved = localStorage.getItem('audience');
  const initial = validHash || saved || null;
  set(initial, { updateHash: false });

  return { get: () => localStorage.getItem('audience'), set };
})();

/* ---------------------------------------------------------------------- */
/* Resume router                                                          */
/* ---------------------------------------------------------------------- */
(function initResumeRouter() {
  const trigger = document.getElementById('resume-trigger');
  const overlay = document.getElementById('router-overlay');
  const panel = document.getElementById('router-panel');
  const closeBtn = document.getElementById('router-close');
  const toAudience = document.getElementById('router-to-audience');
  const RESUME_URLS = {
    recruiter: 'Siddharth_Prabhu_Resume_2026.pdf',
    professor: 'Siddharth_Prabhu_Academic_CV.pdf',
  };
  let lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusable = panel.querySelectorAll('a[href], button:not([disabled])');
    const list = Array.prototype.slice.call(focusable);
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  trigger.addEventListener('click', () => {
    const audience = AudienceRouter.get();
    if (audience && RESUME_URLS[audience]) {
      window.open(RESUME_URLS[audience], '_blank', 'noopener');
      return;
    }
    open();
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    trapFocus(e);
  });
  overlay.querySelectorAll('[data-audience-choice]').forEach(link => {
    link.addEventListener('click', () => AudienceRouter.set(link.dataset.audienceChoice));
  });
  toAudience.addEventListener('click', () => {
    close();
    document.getElementById('audience').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
})();
