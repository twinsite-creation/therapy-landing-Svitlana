/* ═══════════════════════════════════════════════════════
   MOTION SYSTEM — Vanilla JS
   Rules: const by default, let only when reassignment needed
          No var. rAF for animations. No layout thrashing.
═══════════════════════════════════════════════════════ */

/* ─── Scroll Progress Bar ─── */
function initScrollBar() {
  const bar = document.querySelector('.scroll-bar');
  if (!bar) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const doc = document.documentElement;
      const progress = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
      bar.style.transform = `scaleX(${progress})`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

/* ─── Navbar Scroll State ─── */
function initNavbar() {
  const header = document.getElementById('header');
  if (!header) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      header.classList.toggle('header--scrolled', window.scrollY > 30);
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

/* ─── Burger / Mobile Menu ─── */
function initMobileMenu() {
  const burger = document.getElementById('burgerBtn');
  const menu   = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  let isOpen = false;

  const toggle = () => {
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    menu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';

    const lines = burger.querySelectorAll('.header__burger-line');
    if (isOpen) {
      lines[0].style.transform = 'translateY(7px) rotate(45deg)';
      lines[1].style.opacity   = '0';
      lines[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      lines[0].style.transform = '';
      lines[1].style.opacity   = '';
      lines[2].style.transform = '';
    }
  };

  burger.addEventListener('click', toggle);
  menu.querySelectorAll('.mobile-menu__link, .mobile-menu__cta').forEach(link => {
    link.addEventListener('click', () => { if (isOpen) toggle(); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) toggle();
  });
}

/* ─── Smooth Anchor Scroll ─── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.getElementById('header')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─── Active Nav Link Highlighting ─── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.header__nav-link');
  if (!navLinks.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle(
              'header__nav-link--active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach(s => observer.observe(s));
}

/* ─── Scroll-triggered Reveals ─── */
function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }

  const transforms = {
    left:   'translateX(-48px)',
    right:  'translateX(48px)',
    top:    'translateY(-40px)',
    bottom: 'translateY(40px)',
  };

  document.querySelectorAll('.reveal').forEach(el => {
    const dir   = el.dataset.reveal;
    const delay = el.dataset.delay ? parseInt(el.dataset.delay, 10) : 0;
    el.style.transitionDelay = `${delay}ms`;
    el.style.transform = transforms[dir] || 'translateY(32px)';
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('revealed');
        observer.unobserve(el);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ─── Stat Counter Animation ─── */
function initStatCounters() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el     = e.target;
        const text   = el.textContent.trim();
        const num    = parseInt(text.replace(/\D/g, ''), 10);
        const suffix = text.replace(/[\d]/g, '');
        if (isNaN(num)) return;
        observer.unobserve(el);

        const duration = 1400;
        const start    = performance.now();
        const startVal = Math.max(0, num - Math.round(num * 0.3));

        const step = now => {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 4);
          el.textContent = Math.round(startVal + (num - startVal) * eased) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.5 }
  );
  stats.forEach(el => observer.observe(el));
}

/* ─── Back To Top ─── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      btn.classList.toggle('visible', window.scrollY > 500);
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ─── Lazy image subtle load effect ─── */
function initImageLoad() {
  document.querySelectorAll('.atmo-band img').forEach(img => {
    const onLoad = () => img.classList.add('loaded');
    if (img.complete) onLoad();
    else img.addEventListener('load', onLoad);
  });
}

/* ─── Init All ─── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollBar();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initActiveNav();
  initReveal();
  initStatCounters();
  initBackToTop();
  initImageLoad();
});
