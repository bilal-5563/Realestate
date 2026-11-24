import { getLenis } from './smooth';

/** Mobile menu: full-screen sheet, focus-trapped, ESC to close, scroll locked while open. */
export function initMenu() {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  const label = btn.querySelector('[data-menu-label]');
  const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
  const focusables = () => [btn, ...menu.querySelectorAll<HTMLElement>('a[href]')];

  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close' : 'Menu';
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      getLenis()?.stop();
      document.documentElement.style.overflow = 'clip';
    } else {
      menu.classList.remove('is-open');
      getLenis()?.start();
      document.documentElement.style.overflow = '';
      window.setTimeout(() => {
        if (!isOpen()) menu.hidden = true;
      }, 800);
    }
  };

  btn.addEventListener('click', () => set(!isOpen()));
  menu.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') {
      set(false);
      btn.focus();
      return;
    }
    if (e.key === 'Tab') {
      const f = focusables();
      const i = f.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        f[f.length - 1].focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0].focus();
      }
    }
  });
  window.matchMedia('(min-width: 48rem)').addEventListener('change', (m) => {
    if (m.matches) set(false);
  });
}
