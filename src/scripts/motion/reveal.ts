import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/**
 * Shared reveals used by every section:
 *  [data-split-lines] — statement headlines rise line by line behind masks
 *  [data-fade-up]     — supporting copy settles into place
 */
export function initReveals() {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray<HTMLElement>('[data-split-lines]').forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 105,
            duration: 1.25,
            stagger: 0.09,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          }),
      });
    });

    gsap.utils.toArray<HTMLElement>('[data-fade-up]').forEach((el) =>
      gsap.from(el, {
        y: 28,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }),
    );
  });
}

/** Draw-on helper: paths use pathLength="1", so 1 → 0 is the whole stroke. GSAP must not round px. */
export const hideStroke = (els: Element[] | NodeListOf<Element>) =>
  gsap.set(els, { strokeDasharray: 1, strokeDashoffset: 1, autoRound: false });
export const drawStroke = (els: gsap.TweenTarget, vars: gsap.TweenVars = {}) =>
  gsap.to(els, { strokeDashoffset: 0, autoRound: false, duration: 1, ease: 'power2.inOut', ...vars });
