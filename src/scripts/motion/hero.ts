import { gsap } from 'gsap';

/** Hero entrance: headline rises line by line, the blue markup is drawn under "landmarks." */
export function heroIntro() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const lines = hero.querySelectorAll('[data-hero-line]');
  const fades = hero.querySelectorAll('[data-hero-fade]');
  const markup = hero.querySelector('[data-hero-markup]');
  const stage = hero.querySelector('[data-hero-stage]');
  const navItems = document.querySelectorAll('[data-nav-item]');

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  // Desktop: the model fades up. Phones: the poster is painted from the first frame (it's the LCP element),
  // so it only settles in scale.
  const desktop = window.matchMedia('(min-width: 1024px)').matches;
  tl.fromTo(
    stage,
    desktop ? { scale: 1.08, opacity: 0 } : { scale: 1.06 },
    desktop ? { scale: 1, opacity: 1, duration: 2.2, ease: 'power3.out' } : { scale: 1, duration: 2, ease: 'power3.out' },
    0,
  )
    .to(lines, { y: 0, duration: 1.5, stagger: 0.11 }, 0.05)
    .to(markup, { strokeDashoffset: 0, autoRound: false, duration: 1.1, ease: 'power2.inOut' }, 0.75)
    .to(fades, { opacity: 1, duration: 1.2, stagger: 0.08, ease: 'power2.out' }, 0.55)
    .from(navItems, { y: -16, opacity: 0, duration: 1, stagger: 0.05 }, 0.3);
  return tl;
}

/** Hero exit on scroll: the headline drifts up slower than the page while the model explodes (HeroScene). */
export function heroScroll() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
    gsap.to(hero.querySelector('#hero-title'), { yPercent: -18, ease: 'none', scrollTrigger: st });
  });
}
