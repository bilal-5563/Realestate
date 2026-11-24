import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hideStroke } from './reveal';

/**
 * Process: the building section draws itself layer by layer as each step becomes active.
 * Scroll back and the layer is erased again — the drawing always matches where you are.
 */
export function initProcess() {
  const section = document.querySelector<HTMLElement>('[data-process]');
  if (!section) return;
  gsap.registerPlugin(ScrollTrigger);
  const steps = gsap.utils.toArray<HTMLElement>('[data-step]', section);
  const layers = gsap.utils.toArray<SVGGElement>('[data-layer]', section);
  const stageName = section.querySelector<HTMLElement>('[data-stage-name]');
  const stageN = section.querySelector<HTMLElement>('[data-stage-n]');
  const rail = section.querySelector<HTMLElement>('[data-process-rail]');
  const names = steps.map((s) => s.dataset.stage ?? '');
  const pad = (n: number) => String(n).padStart(2, '0');
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const draws = layers.map((layer) => {
      const paths = layer.querySelectorAll('[data-draw-layer]');
      hideStroke(paths);
      return gsap.to(paths, {
        strokeDashoffset: 0,
        autoRound: false,
        duration: 1.4,
        stagger: 0.18,
        ease: 'power2.inOut',
        paused: true,
      });
    });

    const setStage = (i: number) => {
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      if (stageName) stageName.textContent = names[i];
      if (stageN) stageN.textContent = pad(i + 1);
    };

    steps.forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step,
        start: 'top 62%',
        end: 'bottom 62%',
        onEnter: () => {
          setStage(i);
          draws[i].play();
        },
        onEnterBack: () => setStage(i),
        onLeaveBack: () => {
          draws[i].reverse();
          if (i > 0) setStage(i - 1);
          else steps[0].classList.remove('is-active');
        },
      });
    });

    if (rail) {
      gsap.to(rail, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: steps[0].parentElement, start: 'top 62%', end: 'bottom 62%', scrub: true },
      });
    }

    return () => steps.forEach((s) => s.classList.remove('is-active'));
  });

  // Reduced motion: the finished drawing, every step readable.
  mm.add('(prefers-reduced-motion: reduce)', () => {
    steps.forEach((s) => s.classList.add('is-active'));
    if (stageName) stageName.textContent = 'Complete';
    if (stageN) stageN.textContent = pad(steps.length);
  });
}
