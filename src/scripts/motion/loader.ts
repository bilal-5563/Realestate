import { gsap } from 'gsap';
import { getLenis } from './smooth';

const root = document.documentElement;

/** Waits for fonts (capped) so the hero headline never reflows mid-reveal. */
const fontsReady = () =>
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 2200))]);

function finish() {
  root.classList.add('is-loaded');
  try {
    sessionStorage.setItem('plinth:seen', '1');
  } catch {
    /* private mode */
  }
  getLenis()?.start();
  window.dispatchEvent(new CustomEvent('plinth:loaded'));
}

/**
 * Loader: the villa's elevation drafts itself while the counter runs 000 → 100,
 * then the sheet closes onto a single datum line that wipes away — the hero is "built".
 * Resolves at the moment the hero should start its own entrance.
 */
export function runLoader(): Promise<void> {
  const el = document.getElementById('loader');
  if (!el || !root.classList.contains('motion-ok')) {
    finish();
    return Promise.resolve();
  }

  const returning = root.classList.contains('is-return');
  const draw = el.querySelectorAll<SVGPathElement>('[data-draw]');
  const count = el.querySelector<HTMLElement>('[data-count]')!;
  const datum = el.querySelector<HTMLElement>('.loader__datum')!;
  const inner = el.querySelector<HTMLElement>('.loader__inner')!;
  const duration = returning ? 0.9 : 1.9;
  const counter = { v: 0 };

  return new Promise((resolve) => {
    const tl = gsap.timeline({ paused: true });
    tl.to(draw, { strokeDashoffset: 0, autoRound: false, duration: duration * 0.9, ease: 'power2.inOut', stagger: duration * 0.045 }, 0)
      .to(
        counter,
        {
          v: 100,
          duration,
          ease: 'power3.inOut',
          onUpdate: () => {
            count.textContent = String(Math.round(counter.v)).padStart(3, '0');
          },
        },
        0,
      )
      .addPause('+=0.05', () => {
        // hold at 100 until fonts are in, then exit
        fontsReady().then(() => tl.play());
      })
      .to(inner, { opacity: 0, y: -24, duration: 0.5, ease: 'power2.in' })
      .to(el, { clipPath: 'inset(50% 0% 50% 0%)', duration: 0.9, ease: 'expo.inOut' }, '<0.15')
      .to(datum, { scaleX: 1, duration: 0.6, ease: 'expo.out' }, '<0.3')
      .add(() => {
        finish();
        resolve();
      }, '<0.2')
      .to(datum, { scaleX: 0, transformOrigin: 'right center', duration: 0.7, ease: 'expo.inOut' }, '>0.05')
      .set(el, { display: 'none' });

    tl.play();
  });
}
