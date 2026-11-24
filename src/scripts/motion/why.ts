import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Why us: the wide photo opens to full bleed as it scrolls in; the portrait drifts; pillars settle. */
export function initWhy() {
  const section = document.querySelector<HTMLElement>('[data-why]');
  if (!section) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    const wide = section.querySelector<HTMLElement>('[data-why-wide]');
    const clip = section.querySelector<HTMLElement>('[data-why-clip]');
    const img = section.querySelector<HTMLElement>('[data-why-img]');
    if (wide && clip && img) {
      gsap
        .timeline({ scrollTrigger: { trigger: wide, start: 'top bottom', end: 'center 55%', scrub: true } })
        .fromTo(clip, { clipPath: 'inset(0% 22% 0% 22%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
        .fromTo(img, { scale: 1.3 }, { scale: 1, ease: 'none' }, 0);
    }
    const portrait = section.querySelector('[data-why-portrait-img]');
    if (portrait)
      gsap.fromTo(
        portrait,
        { yPercent: -8 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: portrait, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
  });

  // Phones: a simple reveal — no scrubbed scaling on small screens.
  mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
    const clip = section.querySelector<HTMLElement>('[data-why-clip]');
    if (clip)
      gsap.fromTo(
        clip,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: clip, start: 'top 85%', once: true } },
      );
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray<HTMLElement>('[data-pillar]', section).forEach((p) => {
      const rule = p.querySelector('[data-pillar-rule]');
      const content = [...p.children].filter((c) => c !== rule);
      gsap
        .timeline({ scrollTrigger: { trigger: p, start: 'top 85%', once: true } })
        .from(rule, { scaleX: 0, duration: 1.1, ease: 'expo.inOut' })
        .from(content, { y: 26, opacity: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out' }, 0.2);
    });
  });
}
