import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger once on the client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Checks whether the user has requested reduced motion.
 * Safe for both SSR and client environments.
 */
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface StaggerRevealOptions {
  stagger?: number;
  duration?: number;
  y?: number;
  delay?: number;
  ease?: string;
  scrollTrigger?: boolean | ScrollTrigger.Vars;
  onComplete?: () => void;
}

/**
 * Staggered fade-in-up animation for collections of elements.
 * Immediately applies final state if prefers-reduced-motion is enabled.
 *
 * @param elements Selector string, Element, or array of Elements
 * @param options Animation customization options
 * @returns GSAP Tween/Timeline or null if reduced motion
 */
export function staggerReveal(
  elements: string | Element | Element[] | NodeListOf<Element>,
  options: StaggerRevealOptions = {}
): gsap.core.Tween | null {
  if (typeof window === 'undefined') return null;

  const {
    stagger = 0.12,
    duration = 0.8,
    y = 30,
    delay = 0,
    ease = 'power3.out',
    scrollTrigger,
    onComplete,
  } = options;

  if (isReducedMotion()) {
    gsap.set(elements, { opacity: 1, y: 0, clearProps: 'transform' });
    if (onComplete) onComplete();
    return null;
  }

  const vars: gsap.TweenVars = {
    opacity: 1,
    y: 0,
    duration,
    stagger,
    delay,
    ease,
    onComplete,
  };

  if (scrollTrigger) {
    vars.scrollTrigger =
      typeof scrollTrigger === 'boolean'
        ? {
            trigger: typeof elements === 'string' ? elements : Array.isArray(elements) ? elements[0] : elements,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        : scrollTrigger;
  }

  return gsap.fromTo(elements, { opacity: 0, y }, vars);
}

/**
 * Creates a smooth parallax effect on scroll for an element.
 * Respects prefers-reduced-motion and returns a cleanup function.
 *
 * @param element Target element or selector
 * @param speed Parallax intensity multiplier (default: 0.3)
 * @returns Cleanup function to kill the tween and ScrollTrigger
 */
export function parallaxScroll(
  element: string | Element,
  speed: number = 0.3
): () => void {
  if (typeof window === 'undefined' || isReducedMotion()) {
    return () => {};
  }

  const tween = gsap.to(element, {
    yPercent: -100 * speed,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  return () => {
    if (tween.scrollTrigger) {
      tween.scrollTrigger.kill();
    }
    tween.kill();
  };
}

export interface MagneticHoverOptions {
  strength?: number;
  ease?: string;
}

/**
 * Adds an interactive magnetic pull effect towards the cursor.
 * Respects prefers-reduced-motion and touch device detection.
 *
 * @param element HTML element to magnetically attract to mouse cursor
 * @param options Strength and easing overrides
 * @returns Cleanup function to remove event listeners
 */
export function magneticHover(
  element: HTMLElement,
  options: MagneticHoverOptions = {}
): () => void {
  if (typeof window === 'undefined' || isReducedMotion()) {
    return () => {};
  }

  // Avoid running on touch-only devices
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch) {
    return () => {};
  }

  const strength = options.strength ?? 0.35;
  const ease = options.ease ?? 'power2.out';

  const handleMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    gsap.to(element, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease,
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(1.1, 0.4)',
      overwrite: 'auto',
    });
  };

  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
    gsap.set(element, { x: 0, y: 0 });
  };
}

/**
 * Creates a ScrollTrigger wrapper for an existing GSAP animation.
 * If prefers-reduced-motion is true, finishes the animation immediately.
 *
 * @param element Trigger element
 * @param animation The GSAP animation to control
 * @param options Optional ScrollTrigger configurations
 * @returns ScrollTrigger instance or null
 */
export function createScrollTrigger(
  element: string | Element,
  animation: gsap.core.Animation,
  options: ScrollTrigger.Vars = {}
): ScrollTrigger | null {
  if (typeof window === 'undefined') return null;

  if (isReducedMotion()) {
    animation.progress(1);
    return null;
  }

  return ScrollTrigger.create({
    trigger: element,
    start: 'top 85%',
    animation,
    ...options,
  });
}

export { gsap, ScrollTrigger };
