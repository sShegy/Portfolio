// Mobile nav toggle
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
navToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close nav on link click (mobile)
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  if (getComputedStyle(navToggle).display !== 'none') {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
}));

// Theme toggle with persistence
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light' || savedTheme === 'dark') {
  root.setAttribute('data-theme', savedTheme);
}

function themeWaveToggle(){
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  const cx = `${Math.round(Math.random()*100)}%`;
  const cy = `${Math.round(Math.random()*100)}%`;
  const dur = `${Math.round(600 + Math.random()*400)}ms`;
  root.style.setProperty('--cx', cx);
  root.style.setProperty('--cy', cy);
  root.style.setProperty('--vt-dur', dur);
  const useRadial = Math.random() > 0.5;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const apply = () => {
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };
  if ('startViewTransition' in document && !prefersReduced){
    document.documentElement.classList.toggle('theme-wipe-radial', useRadial);
    document.documentElement.classList.toggle('theme-wipe-linear', !useRadial);
    document.startViewTransition(() => {
      apply();
    }).finished.finally(() => {
      document.documentElement.classList.remove('theme-wipe-radial','theme-wipe-linear');
    });
  } else {
    document.documentElement.classList.add('theme-fade');
    apply();
    setTimeout(() => document.documentElement.classList.remove('theme-fade'), parseInt(dur));
  }
}

themeToggle?.addEventListener('click', themeWaveToggle);

// Set year in footer
const yearEl = document.getElementById('year');
yearEl && (yearEl.textContent = String(new Date().getFullYear()));

// Smooth scroll for anchor links
function smooth(e){
  const href = e.currentTarget.getAttribute('href');
  if (href && href.startsWith('#')) {
    const el = document.querySelector(href);
    if (el){
      e.preventDefault();
      el.scrollIntoView({behavior:'smooth', block:'start'});
    }
  }
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click', smooth));

// Scroll reveal animations
(function(){
  const targets = document.querySelectorAll('.section, .project, .about img, .hero .hero-content');
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Staggered delay per element
    el.style.transitionDelay = `${Math.min(i * 60, 600)}ms`;
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    targets.forEach(el => io.observe(el));
  } else {
    targets.forEach(el => el.classList.add('revealed'));
  }
})();

// Parallax effects for hero
(function(){
  const hero = document.querySelector('.hero');
  const content = document.querySelector('.hero .hero-content');
  const visual = document.querySelector('.hero-visual');
  if (!hero || !content || !visual) return;
  let mx = 0, my = 0, tx = 0, ty = 0;
  let ticking = false;

  function onMove(e){
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx = x * 10; // max 10px
    my = y * 10;
    if (!ticking){
      ticking = true;
      requestAnimationFrame(() => {
        tx += (mx - tx) * 0.08;
        ty += (my - ty) * 0.08;
        content.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        ticking = false;
      });
    }
  }

  function onScroll(){
    const offset = Math.max(0, window.scrollY);
    const parY = Math.min(30, offset * 0.06); // up to 30px
    visual.style.transform = `translate3d(0, ${parY}px, 0)`;
  }

  hero.addEventListener('mousemove', onMove);
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Update CSS variable for scroll progress
(function(){
  function updateScroll(){
    const doc = document.documentElement;
    const h = doc.scrollHeight - doc.clientHeight;
    const p = h > 0 ? Math.max(0, Math.min(1, window.scrollY / h)) : 0;
    doc.style.setProperty('--scroll', p.toString());
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();
})();

// Magnetic buttons effect
(function(){
  const magnets = Array.from(document.querySelectorAll('.btn, .theme-toggle'));
  const strength = 12;
  magnets.forEach(el => {
    el.style.transform = 'translateZ(0)';
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `translate(${x*strength}px, ${y*strength}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
})();

// Card tilt effect
(function(){
  const cards = Array.from(document.querySelectorAll('.card'));
  const maxTilt = 6; // degrees
  cards.forEach(card => {
    let leaveTimer;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (y * -maxTilt).toFixed(2);
      const ry = (x * maxTilt).toFixed(2);
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(() => { card.style.transform = ''; }, 80);
    });
  });
})();

// Scramble effect for hero title
(function(){
  const el = document.querySelector('.hero h1');
  if (!el) return;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const original = el.textContent || '';
  let frame = 0, timer;
  function scramble(text){
    const out = text.split('').map((ch, i) => {
      if (i < frame) return original[i] || ch;
      return chars[Math.floor(Math.random()*chars.length)];
    }).join('');
    el.textContent = out;
    frame += Math.ceil(original.length / 18);
    if (frame <= original.length){
      timer = requestAnimationFrame(() => scramble(out));
    } else {
      el.textContent = original;
    }
  }
  scramble(original);
})();


// Hero angled bands gentle parallax (disabled for reduced motion)
(function(){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  if (!hero || prefersReduced) return;
  function onScroll(){
    const r = hero.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= window.innerHeight) return;
    const p = Math.max(0, Math.min(1, 1 - r.top / window.innerHeight));
    document.documentElement.style.setProperty('--band-x', ((p - 0.5) * 80).toFixed(1) + 'px');
    document.documentElement.style.setProperty('--band-y', ((p - 0.5) * 50).toFixed(1) + 'px');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
