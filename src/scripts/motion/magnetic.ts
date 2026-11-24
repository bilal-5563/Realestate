import { gsap } from 'gsap';

/** Magnetic CTAs: the button leans toward the pointer, its label leans further — tactile, not bouncy. */
export function initMagnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches)
    return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' });
    const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.8, ease: 'power3' }) : null;
    const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.8, ease: 'power3' }) : null;

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      xTo(mx * 0.28);
      yTo(my * 0.38);
      ixTo?.(mx * 0.12);
      iyTo?.(my * 0.16);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.45)', overwrite: true });
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.45)', overwrite: true });
    });
  });
}
