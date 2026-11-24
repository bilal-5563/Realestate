import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import type { Application } from '@splinetool/runtime';

type SplineProps = {
  scene: string;
  onLoad?: (app: Application) => void;
  renderOnDemand?: boolean;
  className?: string;
};

/**
 * Hero 3D scene (Spline). Loaded only when it can be enjoyed:
 * desktop, fine pointer, motion allowed, not on a constrained connection.
 * Everyone else keeps the static render that sits underneath (see Hero.astro).
 */
export default function HeroScene({ scene }: { scene: string }) {
  const [Spline, setSpline] = useState<ComponentType<SplineProps> | null>(null);
  const [ready, setReady] = useState(false);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    const capable = window.matchMedia(
      '(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    ).matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    const constrained = !!conn && (conn.saveData || /(^|-)2g|3g/.test(conn.effectiveType ?? ''));
    if (!capable || constrained) return;

    let cancelled = false;
    // The scene is exported for WebGPU. Without a real adapter the runtime can only print
    // an error, so we never download it — the static render stays in place instead.
    const hasWebGPU = async () => {
      const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
      if (!gpu) return false;
      try {
        return !!(await gpu.requestAdapter());
      } catch {
        return false;
      }
    };
    const load = () => {
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: object) => number })
        .requestIdleCallback;
      const go = async () => {
        if (!(await hasWebGPU())) return;
        const m = await import('@splinetool/react-spline');
        if (!cancelled) setSpline(() => m.default as ComponentType<SplineProps>);
      };
      if (idle) idle(go, { timeout: 1200 });
      else window.setTimeout(go, 200);
    };

    if (document.documentElement.classList.contains('is-loaded')) load();
    else window.addEventListener('plinth:loaded', load, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('plinth:loaded', load);
      cleanup.current?.();
    };
  }, []);

  const onLoad = useCallback(async (app: Application) => {
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    // Frame the model for the stage: closer on wide screens, where the stage is larger.
    app.setZoom(window.innerWidth >= 1280 ? 1.35 : 1.25);

    const villa = app.findObjectByName('Villa');
    const upper = app.findObjectByName('Upper');
    const blade = app.findObjectByName('Blade');
    const lower = app.findObjectByName('Lower');
    if (!villa || !upper || !blade || !lower) {
      setReady(true);
      return;
    }

    const base = {
      ry: villa.rotation.y,
      rx: villa.rotation.x,
      upperY: upper.position.y,
      bladeX: blade.position.x,
      lowerY: lower.position.y,
    };

    // One state object, written to the scene on every GSAP tick that changes it.
    const state = { ry: 0, rx: 0, explode: 0 };
    const apply = () => {
      villa.rotation.y = base.ry + state.ry + state.explode * 0.22;
      villa.rotation.x = base.rx + state.rx;
      upper.position.y = base.upperY + state.explode * 120;
      blade.position.x = base.bladeX - state.explode * 110;
      lower.position.y = base.lowerY - state.explode * 18;
    };

    // Mouse: the model leans gently toward the pointer — weight, not a toy spin.
    const toRy = gsap.quickTo(state, 'ry', { duration: 1.6, ease: 'power3.out', onUpdate: apply });
    const toRx = gsap.quickTo(state, 'rx', { duration: 1.6, ease: 'power3.out', onUpdate: apply });
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      toRy(nx * 0.16);
      toRx(ny * 0.035);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // Scroll: the building separates into an exploded axonometric as the hero leaves.
    const st = gsap.to(state, {
      explode: 1,
      ease: 'none',
      onUpdate: apply,
      scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: 0.8 },
    });

    cleanup.current = () => {
      window.removeEventListener('pointermove', onMove);
      st.scrollTrigger?.kill();
      st.kill();
    };

    apply();
    setReady(true);
    window.dispatchEvent(new CustomEvent('plinth:scene-ready'));
  }, []);

  return (
    <div
      className="absolute inset-0 transition-opacity duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ opacity: ready ? 1 : 0 }}
      aria-hidden="true"
    >
      {Spline && <Spline scene={scene} onLoad={onLoad} className="!h-full !w-full" />}
    </div>
  );
}

