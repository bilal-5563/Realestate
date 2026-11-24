/** Nav: transparent over the hero's first fold, then a solid bar that steps aside while reading down. */
export function initNavScroll() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  const toggle = document.querySelector('[data-menu-toggle]');
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const menuOpen = toggle?.getAttribute('aria-expanded') === 'true';
    nav.classList.toggle('is-solid', y > 60);
    if (!menuOpen && Math.abs(y - lastY) > 4) nav.classList.toggle('is-hidden', y > lastY && y > 240);
    if (menuOpen) nav.classList.remove('is-hidden');
    lastY = y;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
  update();
}
