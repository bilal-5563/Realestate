import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hideStroke } from './reveal';

const DESKTOP = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
const STACK = '(max-width: 1023px) and (prefers-reduced-motion: no-preference)';

/** Maison Aurel: slow cinematic crossfade between residences, timed like an edit. Paused until visible. */
function createCrossfade(root: HTMLElement) {
  const slides = gsap.utils.toArray<HTMLElement>('[data-slide]', root);
  const imgs = slides.map((s) => s.querySelector('img'));
  const infos = gsap.utils.toArray<HTMLElement>('[data-slide-info]', root);
  const bars = gsap.utils.toArray<HTMLElement>('[data-slide-bar] b', root);
  const n = slides.length;
  const setInfo = (i: number) => infos.forEach((el, k) => el.classList.toggle('is-active', k === i));

  gsap.set(slides, { opacity: (i) => (i === 0 ? 1 : 0) });
  const tl = gsap.timeline({ repeat: -1, paused: true });
  slides.forEach((slide, i) => {
    const next = (i + 1) % n;
    tl.fromTo(bars[i], { scaleX: 0 }, { scaleX: 1, duration: 4.2, ease: 'none', immediateRender: false })
      .add(() => setInfo(next))
      .to(slide, { opacity: 0, duration: 1.8, ease: 'power2.inOut' })
      .fromTo(slides[next], { opacity: 0 }, { opacity: 1, duration: 1.8, ease: 'power2.inOut', immediateRender: false }, '<')
      .fromTo(imgs[next], { scale: 1.1 }, { scale: 1, duration: 6, ease: 'power1.out', immediateRender: false }, '<')
      .set(bars[i], { scaleX: 0 }, '<0.9');
  });
  return { play: () => tl.play(), pause: () => tl.pause(), kill: () => tl.kill() };
}

/** Halden: amber engineering callouts draw over the tower, labels follow. */
function calloutTimeline(root: HTMLElement) {
  const paths = root.querySelectorAll('[data-callout]');
  const labels = root.querySelectorAll('[data-callout-label]');
  hideStroke(paths);
  gsap.set(labels, { opacity: 0 });
  return gsap
    .timeline({ paused: true })
    .to(paths, { strokeDashoffset: 0, autoRound: false, duration: 1.1, stagger: 0.22, ease: 'power2.inOut' })
    .to(labels, { opacity: 1, duration: 0.5, stagger: 0.15 }, 0.7);
}

/** Atelier Nord: project titles rise from hairline masks. */
function titlesTimeline(root: HTMLElement) {
  return gsap.fromTo(
    root.querySelectorAll('[data-c-title]'),
    { yPercent: 110 },
    { yPercent: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out', paused: true },
  );
}

export function initConcepts() {
  const section = document.querySelector<HTMLElement>('[data-concepts]');
  if (!section) return;
  gsap.registerPlugin(ScrollTrigger);
  const pin = section.querySelector<HTMLElement>('[data-concepts-pin]')!;
  const track = section.querySelector<HTMLElement>('[data-concepts-track]')!;
  const a = section.querySelector<HTMLElement>('[data-concept="a"]')!;
  const b = section.querySelector<HTMLElement>('[data-concept="b"]')!;
  const c = section.querySelector<HTMLElement>('[data-concept="c"]')!;
  const bar = section.querySelector<HTMLElement>('[data-progress-bar]');
  const label = section.querySelector<HTMLElement>('[data-progress-label]');
  const mm = gsap.matchMedia();

  // ── Desktop: pinned horizontal track. Vertical scroll drives it — the page still scrolls normally.
  mm.add(DESKTOP, () => {
    section.classList.add('is-horizontal');
    // Panels sit off-screen to the right, so native lazy-loading would wait until each slides in.
    ScrollTrigger.create({
      trigger: section,
      start: 'top 150%',
      once: true,
      onEnter: () => section.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => (img.loading = 'eager')),
    });
    const distance = () => track.scrollWidth - window.innerWidth;

    const move = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (bar) gsap.set(bar, { scaleX: self.progress });
          if (label) label.textContent = `Concept ${self.progress < 0.33 ? 'A' : self.progress < 0.72 ? 'B' : 'C'}`;
        },
      },
    });

    const callouts = calloutTimeline(a);
    ScrollTrigger.create({ trigger: pin, start: 'top 55%', once: true, onEnter: () => callouts.play() });

    const fade = createCrossfade(b.querySelector('[data-crossfade]')!);
    ScrollTrigger.create({
      trigger: b,
      containerAnimation: move,
      start: 'left 80%',
      end: 'right 20%',
      onToggle: (self) => (self.isActive ? fade.play() : fade.pause()),
    });

    const titles = titlesTimeline(c);
    ScrollTrigger.create({ trigger: c, containerAnimation: move, start: 'left 70%', once: true, onEnter: () => titles.play() });

    return () => {
      fade.kill();
      section.classList.remove('is-horizontal');
      gsap.set(track, { clearProps: 'transform' });
    };
  });

  // ── Mobile / tablet: vertical stack, each concept animates as it arrives.
  mm.add(STACK, () => {
    const callouts = calloutTimeline(a);
    ScrollTrigger.create({ trigger: a.querySelector('.cframe'), start: 'top 70%', once: true, onEnter: () => callouts.play() });

    const fade = createCrossfade(b.querySelector('[data-crossfade]')!);
    ScrollTrigger.create({
      trigger: b.querySelector('.cframe'),
      start: 'top 85%',
      end: 'bottom 15%',
      onToggle: (self) => (self.isActive ? fade.play() : fade.pause()),
    });

    const titles = titlesTimeline(c);
    ScrollTrigger.create({ trigger: c.querySelector('.cframe'), start: 'top 75%', once: true, onEnter: () => titles.play() });

    return () => fade.kill();
  });
}
