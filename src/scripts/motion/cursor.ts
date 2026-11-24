import { gsap } from 'gsap';

/** Desktop-only surveyor's crosshair + trailing ring that becomes a labelled lens on interactive elements. */
export function initCursor() {
  const root = document.documentElement;
  const capable = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const el = document.querySelector<HTMLElement>('[data-cursor-root]');
  if (!el || !capable.matches) return;

  const dot = el.querySelector<HTMLElement>('[data-cursor-dot]')!;
  const ring = el.querySelector<HTMLElement>('[data-cursor-ring]')!;
  const label = el.querySelector<HTMLElement>('[data-cursor-label]')!;
  root.classList.add('has-cursor', 'cursor-hidden');

  gsap.set([dot, ring], { x: -100, y: -100 });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' });

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      root.classList.remove('cursor-hidden');
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => root.classList.add('cursor-hidden'));

  const targets = 'a, button, [data-cursor]';
  document.addEventListener('pointerover', (e) => {
    const t = (e.target as Element).closest<HTMLElement>(targets);
    if (!t) return;
    label.textContent = t.dataset.cursor ?? '';
    root.classList.toggle('cursor-active', !!t.dataset.cursor);
  });
  document.addEventListener('pointerout', (e) => {
    const t = (e.target as Element).closest(targets);
    const to = e.relatedTarget as Element | null;
    if (t && !t.contains(to)) root.classList.remove('cursor-active');
  });
}
