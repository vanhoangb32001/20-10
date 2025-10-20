onload = () => {
    const c = setTimeout(() => {
      document.body.classList.remove("not-loaded");
      clearTimeout(c);
    }, 1000);
  };

// Petals / confetti for greeting — optimized implementation
(function (){
  const MAX_ACTIVE = 36; // cap active petals
  const POOL_SIZE = 48; // pre-create a pool
  const pool = [];
  let active = 0;
  let rafHandle = null;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // don't run animations if user prefers reduced motion

  // create pool
  const container = document.getElementById('petals');
  for (let i = 0; i < POOL_SIZE; i++) {
    const el = document.createElement('div');
    el.className = 'petal';
    el.style.display = 'none';
    container && container.appendChild(el);
    pool.push({el, active: false, start: 0, duration: 0});
  }

  const now = () => performance.now();

  function recycle(item) {
    item.el.style.display = 'none';
    item.active = false;
    active = Math.max(0, active - 1);
  }

  function launchPetal() {
    if (active >= MAX_ACTIVE) return;
    const item = pool.find(p => !p.active);
    if (!item) return;
    item.active = true;
    active++;

    const size = 8 + Math.random() * 18;
    const startX = Math.random() * window.innerWidth;
    const duration = 3500 + Math.random() * 3000;
    const drift = (Math.random() - 0.5) * 160; // px horizontal drift
    const rotateStart = Math.random() * 360;
    const rotateSpin = 200 + Math.random() * 800; // degrees

    const el = item.el;
    el.style.width = `${size}px`;
    el.style.height = `${Math.round(size * 1.5)}px`;
    el.style.left = `${startX}px`;
    el.style.top = `${-20}px`;
    el.style.transform = `translate3d(0,0,0) rotate(${rotateStart}deg)`;
    el.style.display = '';

    const hue = 330 + Math.round(Math.random() * 20) - 10;
    el.style.background = `radial-gradient(circle at 50% 30%, rgba(255,255,255,0.12), transparent 40%), linear-gradient(180deg, hsl(${hue} 90% 82%) 0%, hsl(${hue} 80% 60%) 100%)`;

    item.start = now();
    item.duration = duration;
    item.data = {startX, drift, rotateStart, rotateSpin};
  }

  function step() {
    let any = false;
    const t = now();
    for (const item of pool) {
      if (!item.active) continue;
      any = true;
      const elapsed = t - item.start;
      const p = Math.min(1, elapsed / item.duration);
      // easing cubic out
      const ease = 1 - Math.pow(1 - p, 3);

      const x = item.data.startX + item.data.drift * ease;
      const y = ease * (window.innerHeight + 200);
      const rot = item.data.rotateStart + item.data.rotateSpin * ease;
      const opacity = 1 - ease;

      item.el.style.transform = `translate3d(${x - item.data.startX}px, ${y}px, 0) rotate(${rot}deg)`;
      item.el.style.opacity = opacity;

      if (p >= 1) recycle(item);
    }

    if (any) rafHandle = requestAnimationFrame(step);
    else rafHandle = null;
  }

  // burst + gentle spawner without setInterval; schedule with timeouts
  function startShow() {
    if (!container) return;
    // burst
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        launchPetal();
        if (!rafHandle) rafHandle = requestAnimationFrame(step);
      }, i * 70);
    }

    // gentle slow spawns using progressive timeouts
    let spawned = 0;
    const gentle = () => {
      if (spawned++ > 120) return; // stop after ~1-2 minutes
      const n = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) launchPetal();
      if (!rafHandle) rafHandle = requestAnimationFrame(step);
      setTimeout(gentle, 900 + Math.random() * 800);
    };
    setTimeout(gentle, 700);
  }

  // attach
  function attach() {
    const banner = document.getElementById('greetingBanner');
    if (banner) banner.addEventListener('click', startShow);
    setTimeout(startShow, 600);
  }

  // expose for React to call after mount
  window.__initPetals = function() {
    const containerNow = document.getElementById('petals');
    if (!containerNow) return; // will auto-run if static page
    attach();
  };

  // if static load via index.html, auto-attach
  window.addEventListener('load', () => {
    attach();
  });
})();