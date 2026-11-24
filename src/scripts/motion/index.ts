import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSmoothScroll } from './smooth';
import { runLoader } from './loader';
import { heroIntro, heroScroll } from './hero';
import { initCursor } from './cursor';
import { initMagnetic } from './magnetic';
import { initMenu } from './menu';
import { initNavScroll } from './nav';
import { initReveals } from './reveal';
import { initIntro } from './intro';
import { initConcepts } from './concepts';
import { initCapabilities } from './capabilities';
import { initProcess } from './process';
import { initWhy } from './why';
import { initContactForm } from './contact';

gsap.registerPlugin(ScrollTrigger);
(window as Window & { __siteBooted?: boolean }).__siteBooted = true;

const motionOk = document.documentElement.classList.contains('motion-ok');

initSmoothScroll();
initMenu();
initNavScroll();
initCursor();
initMagnetic();
initContactForm();

// Sections in page order (the concepts spacer adds scroll distance below it).
initIntro();
initConcepts();
initCapabilities();
initProcess();
initWhy();
initReveals();
ScrollTrigger.sort();

// Layout settles once webfonts are in — re-measure every trigger.
document.fonts?.ready.then(() => ScrollTrigger.refresh());

runLoader().then(() => {
  if (motionOk) heroIntro();
  heroScroll();
  ScrollTrigger.refresh();
});
