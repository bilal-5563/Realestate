import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hideStroke } from './reveal';

const DESKTOP = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
const TOUCH = '(max-width: 1023px) and (prefers-reduced-motion: no-preference)';
const MOTION = '(prefers-reduced-motion: no-preference)';

export function initIntro() {
  const section = document.querySelector<HTMLElement>('#intro');
  if (!section) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add(MOTION, () => {
    // "What changes" rows: fade up, then the blue line strikes out the old way.
    gsap.utils.toArray<HTMLElement>('[data-shift]', section).forEach((row) => {
      const strike = row.querySelector('[data-strike]');
      const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 85%', once: true } });
      tl.from(row.children, { y: 18, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' });
      if (strike) {
        hideStroke([strike]);
        tl.to(strike, { strokeDashoffset: 0, autoRound: false, duration: 0.7, ease: 'power2.inOut' }, 0.35);
      }
    });

    // Photograph: rises into its frame with a clip-path wipe.
    const frame = section.querySelector<HTMLElement>('[data-reveal-img]');
    if (frame) {
      gsap.fromTo(
        frame,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.5,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: frame, start: 'top 85%', once: true },
        },
      );
    }

    // Numbers: count up as each dimension line is drawn across its column.
    gsap.utils.toArray<HTMLElement>('[data-stat]', section).forEach((stat, i) => {
      const line = stat.querySelector('[data-dim-line]');
      const ticks = stat.querySelectorAll('[data-dim-tick]');
      const num = stat.querySelector<HTMLElement>('[data-count-to]');
      const out = stat.querySelector<HTMLElement>('[data-count-value]');
      if (!num || !out) return;
      const target = Number(num.dataset.countTo);
      const decimals = Number(num.dataset.decimals ?? 0);
      const counter = { v: 0 };
      out.textContent = (0).toFixed(decimals);
      gsap
        .timeline({ scrollTrigger: { trigger: stat, start: 'top 88%', once: true }, delay: i * 0.08 })
        .from(ticks[0], { scaleY: 0, duration: 0.4, ease: 'power2.out' })
        .from(line, { scaleX: 0, duration: 1, ease: 'power2.inOut' }, 0.1)
        .from(ticks[1], { scaleY: 0, duration: 0.4, ease: 'power2.out' }, 0.95)
        .to(
          counter,
          {
            v: target,
            duration: 1.8,
            ease: 'power3.out',
            onUpdate: () => {
              out.textContent = counter.v.toFixed(decimals);
            },
          },
          0.1,
        );
    });
  });

  // ── The Markup (signature) ─────────────────────────────────────────────
  const figure = section.querySelector<HTMLElement>('[data-markup-figure]');
  const marks = figure ? figure.querySelectorAll('[data-markup]') : [];
  const labels = figure ? figure.querySelectorAll('[data-markup-label]') : [];

  // Desktop: drawn in step with the scroll, like an architect working over the print.
  mm.add(DESKTOP, () => {
    if (!figure) return;
    hideStroke(marks);
    gsap.set(labels, { opacity: 0 });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: figure, start: 'top 60%', end: 'bottom 75%', scrub: 0.6 },
    });
    marks.forEach((m, i) => {
      tl.to(m, { strokeDashoffset: 0, autoRound: false, duration: 1, ease: 'none' }, i * 0.55);
    });
    tl.to(labels, { opacity: 1, duration: 0.6, stagger: 0.4 }, 1.2);

    // Slow settle of the photo inside its frame while it crosses the viewport.
    gsap.fromTo(
      figure.querySelector('[data-scale-img]'),
      { scale: 1.18 },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: true } },
    );

    // Detail photograph drifts against the column.
    const detail = section.querySelector('[data-parallax]');
    if (detail)
      gsap.fromTo(
        detail,
        { yPercent: 18 },
        { yPercent: -12, ease: 'none', scrollTrigger: { trigger: detail, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
  });

  // Touch: no scrubbing — the markup plays once when the photo is in view.
  mm.add(TOUCH, () => {
    if (!figure) return;
    hideStroke(marks);
    gsap.set(labels, { opacity: 0 });
    gsap
      .timeline({ scrollTrigger: { trigger: figure, start: 'top 55%', once: true } })
      .to(marks, { strokeDashoffset: 0, autoRound: false, duration: 1.1, stagger: 0.18, ease: 'power2.inOut' }, 0.4)
      .to(labels, { opacity: 1, duration: 0.5, stagger: 0.12 }, 1.2);
  });
}
