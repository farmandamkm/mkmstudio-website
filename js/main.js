/* MKM Studio — interaction and motion layer for the Lumen-based static site. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = $('#nav');
  const menu = $('#menu-btn');
  const links = $('#site-nav');
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  let lenis = null;
  const hasMotion = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasMotion) gsap.registerPlugin(ScrollTrigger);
  if (!reduce && typeof window.Lenis === 'function' && hasMotion) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach((anchor) => anchor.addEventListener('click', (event) => {
    const id = anchor.getAttribute('href');
    if (!id || id.length < 2) return;
    const target = $(id);
    if (!target) return;
    event.preventDefault();
    if (menu && links) {
      links.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Open navigation');
    }
    lenis ? lenis.scrollTo(target, { offset: -18, duration: 1.2 }) : target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    links?.classList.toggle('open', open);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu && links) {
      links.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Open navigation');
    }
  });

  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav?.classList.toggle('scrolled', y > 40);
    nav?.classList.toggle('hide', y > 600 && y > lastY + 8);
    if (y < lastY - 4) nav?.classList.remove('hide');
    lastY = y;
  }, { passive: true });

  const glSections = new Set();
  const scene = () => window.MKM_SCENE;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting ? glSections.add(entry.target) : glSections.delete(entry.target));
    scene()?.setActive(glSections.size > 0);
  }, { rootMargin: '10% 0px' });
  $$('[data-gl]').forEach((section) => io.observe(section));

  $$('.qa button').forEach((button) => button.addEventListener('click', () => {
    const current = button.parentElement;
    const opening = !current.classList.contains('open');
    $$('.qa').forEach((item) => {
      item.classList.remove('open');
      $('button', item)?.setAttribute('aria-expanded', 'false');
    });
    if (opening) {
      current.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }
    if (hasMotion) setTimeout(() => ScrollTrigger.refresh(), 600);
  }));

  const stages = $$('.stage');
  const huds = $$('.hud .tag');
  const railNumber = $('#railNum');
  const railBar = $('#railBar');
  let currentStage = -1;
  const showStage = (index) => {
    if (index === currentStage) return;
    currentStage = index;
    if (railNumber) railNumber.textContent = String(index + 1).padStart(2, '0');
    stages.forEach((stage, i) => stage.classList.toggle('on', i === index));
    huds.forEach((badge) => {
      const active = Number(badge.dataset.hud) === index;
      if (hasMotion && !reduce) gsap.to(badge, { opacity: active ? 1 : 0, y: active ? 0 : 10, duration: active ? 0.55 : 0.25, ease: 'power3.out', overwrite: true });
      else badge.style.opacity = active ? '1' : '0';
    });
  };
  if (stages.length) showStage(0);

  $$('.spot').forEach((card) => card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--y', `${event.clientY - rect.top}px`);
  }));
  const finePointer = matchMedia('(pointer: fine)').matches;
  if (hasMotion && finePointer && !reduce) $$('.magnetic').forEach((button) => {
    button.addEventListener('mousemove', (event) => {
      const rect = button.getBoundingClientRect();
      gsap.to(button, { x: (event.clientX - rect.left - rect.width / 2) * 0.12, y: (event.clientY - rect.top - rect.height / 2) * 0.17, duration: 0.4, ease: 'power3.out' });
    });
    button.addEventListener('mouseleave', () => gsap.to(button, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' }));
  });

  const fallback = () => {
    $$('[data-hero-fade]').forEach((element) => { element.style.opacity = '1'; element.style.transform = 'none'; });
    $$('[data-count]').forEach((element) => { element.textContent = Number(element.dataset.count).toLocaleString('en-US'); });
  };
  if (!hasMotion) {
    fallback();
    $$('.cell, .product-card, .pillar, .stack-card').forEach((element) => element.classList.add('in'));
    return;
  }

  if (reduce) {
    fallback();
    showStage(0);
    return;
  }

  gsap.from('.nav', { y: -22, opacity: 0, duration: 0.75, ease: 'power3.out', delay: 0.1 });
  gsap.from('.hero h1', { y: 30, opacity: 0, duration: 1.05, ease: 'expo.out', delay: 0.2 });
  gsap.fromTo('[data-hero-fade]', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.1, delay: 0.45, clearProps: 'transform' });
  const intro = () => scene()?.intro?.();
  scene() ? intro() : addEventListener('mkm:ready', intro, { once: true });

  gsap.to('.hero-copy', { yPercent: -12, opacity: 0.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 12%', scrub: true } });
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', endTrigger: '.statement', end: 'bottom 70%', scrub: true, onUpdate: (state) => { if (scene()) scene().S.hero = state.progress; } });
  ScrollTrigger.create({ trigger: '.morph', start: 'top bottom', end: 'top top', onUpdate: (state) => { if (scene()) scene().S.morphIn = state.progress; } });
  ScrollTrigger.create({ trigger: '.cta', start: 'top bottom', end: 'top 15%', onUpdate: (state) => { if (scene()) scene().S.cta = state.progress; } });
  ScrollTrigger.create({
    trigger: '.morph', start: 'top top', end: () => `+=${innerHeight * 2.7}`, pin: true, scrub: true,
    onUpdate: (state) => {
      const p = state.progress;
      const mapped = p < 0.18 ? 0 : p < 0.46 ? (p - 0.18) / 0.28 : p < 0.58 ? 1 : p < 0.84 ? 1 + (p - 0.58) / 0.26 : 2;
      if (scene()) scene().S.morph = mapped;
      if (railBar) railBar.style.transform = `scaleX(${p})`;
      showStage(mapped < 0.5 ? 0 : mapped < 1.5 ? 1 : 2);
    },
  });

  const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    observer.unobserve(entry.target);
  }), { threshold: 0.18 });
  $$('.product-card, .pillar, .stack-card').forEach((element) => revealObserver.observe(element));

  $$('[data-reveal-one]').forEach((element) => gsap.from(element, { y: 22, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%' } }));
  $$('[data-reveal]').forEach((group) => gsap.fromTo(group.children, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.1, clearProps: 'transform,opacity', scrollTrigger: { trigger: group, start: 'top 84%' } }));
  $$('[data-split]').forEach((heading) => gsap.from(heading, { y: 24, opacity: 0, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: heading, start: 'top 86%' } }));
  $$('[data-count]').forEach((element) => {
    const counter = { value: 0 };
    const end = Number(element.dataset.count);
    gsap.to(counter, { value: end, duration: 1.7, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%' }, onUpdate: () => { element.textContent = Math.round(counter.value).toLocaleString('en-US'); } });
  });
  const cards = $$('.stack-card');
  if (innerWidth > 760) cards.forEach((card, index) => {
    if (index < cards.length - 1) gsap.to(card, { scale: 0.96, filter: 'brightness(.7)', ease: 'none', scrollTrigger: { trigger: cards[index + 1], start: 'top bottom', end: 'top 120px', scrub: true } });
    const visual = $('.visual', card);
    if (visual) gsap.from(visual, { clipPath: 'inset(10% 10% 10% 10% round 20px)', opacity: 0.45, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 78%' } });
  });
  gsap.fromTo('.cta h2', { scale: 0.94 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'top 20%', scrub: true } });
  gsap.from('.wordmark', { yPercent: 16, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
