import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenis: Lenis | null = null;

/** Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in lockstep. */
export function initSmoothScroll(): Lenis | null {
  if (!document.documentElement.classList.contains('motion-ok')) return null;

  lenis = new Lenis({ lerp: 0.1, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // released when the loader finishes
  return lenis;
}

export const getLenis = () => lenis;
