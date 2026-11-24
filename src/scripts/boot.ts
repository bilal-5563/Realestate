/**
 * Starts the motion bundle (GSAP, ScrollTrigger, Lenis and the section scripts) one frame AFTER first paint.
 *
 * Nothing on screen depends on it before then: the loader, the hidden hero lines and every pre-animation
 * state are pure CSS (driven by the `js` / `motion-ok` classes set inline in Base.astro). Fetching ~60 KB
 * of script after the first frame leaves the network and CPU to the HTML, fonts and hero image first,
 * which is what a phone on a slow connection needs. If the bundle never arrives, the 6 s safety net in
 * Base.astro reveals the page anyway.
 */
const start = () => import('./motion/index.ts');

// rAF runs just before the next paint; the timeout queued from it runs just after that paint.
requestAnimationFrame(() => setTimeout(start, 0));
