import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Spec-sheet rows: hairlines draw in, rows settle; on desktop a photo follows the pointer per row. */
export function initCapabilities() {
  const section = document.querySelector<HTMLElement>('[data-caps]');
  if (!section) return;
  gsap.registerPlugin(ScrollTrigger);
  const rows = gsap.utils.toArray<HTMLElement>('[data-cap]', section);
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    rows.forEach((row) => {
      const rule = row.querySelector('[data-cap-rule]');
      const content = [...row.children].filter((c) => c !== rule);
      gsap
        .timeline({ scrollTrigger: { trigger: row, start: 'top 88%', once: true } })
        .from(rule, { scaleX: 0, duration: 1.1, ease: 'expo.inOut' })
        .from(content, { y: 24, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out' }, 0.25);
    });
  });

  // Hover preview — fine pointers only (the custom cursor sets html.has-cursor).
  mm.add('(hover: hover) and (pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const preview = section.querySelector<HTMLElement>('[data-caps-preview]');
    if (!preview || !document.documentElement.classList.contains('has-cursor')) return;
    const imgs = gsap.utils.toArray<HTMLElement>('[data-caps-img]', preview);
    const xTo = gsap.quickTo(preview, 'x', { duration: 0.7, ease: 'power3' });
    const yTo = gsap.quickTo(preview, 'y', { duration: 0.7, ease: 'power3' });
    const rot = gsap.quickTo(preview, 'rotation', { duration: 0.9, ease: 'power3' });
    let lastX = 0;
    let current = -1;

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX + 28);
      yTo(e.clientY - preview.offsetHeight / 2);
      rot(gsap.utils.clamp(-6, 6, (e.clientX - lastX) * 0.4));
      lastX = e.clientX;
    };
    const show = (i: number) => {
      if (i === current) return;
      if (current >= 0) gsap.to(imgs[current], { opacity: 0, duration: 0.35, overwrite: true });
      gsap.fromTo(imgs[i], { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out', overwrite: true });
      current = i;
    };
    const enter = (i: number) => {
      show(i);
      gsap.to(preview, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
    };
    const leave = () => {
      gsap.to(preview, { clipPath: 'inset(50% 50% 50% 50%)', duration: 0.45, ease: 'power3.in', overwrite: 'auto' });
      current = -1;
      gsap.to(imgs, { opacity: 0, duration: 0.3, delay: 0.3 });
    };

    const list = section.querySelector<HTMLElement>('[data-caps-list]')!;
    const handlers = rows.map((row, i) => {
      const h = () => enter(i);
      row.addEventListener('pointerenter', h);
      return [row, h] as const;
    });
    list.addEventListener('pointerleave', leave);
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      handlers.forEach(([row, h]) => row.removeEventListener('pointerenter', h));
      list.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointermove', onMove);
    };
  });
}
