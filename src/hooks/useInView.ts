'use client';

import { useState, useEffect, RefObject } from 'react';

export interface UseInViewOptions {
  /**
   * Number or array of numbers between 0 and 1 indicating the percentage of
   * target's visibility at which the observer's callback should execute.
   * Default: 0.1
   */
  threshold?: number | number[];
  /**
   * Margin around the root element. Defaults to '0px'.
   */
  rootMargin?: string;
  /**
   * If true, triggers only the first time the element enters viewport and does not reset.
   * Default: false
   */
  triggerOnce?: boolean;
}

/**
 * SSR-safe Intersection Observer hook.
 *
 * @param ref Ref to the DOM element to observe
 * @param options IntersectionObserver options (threshold, rootMargin, triggerOnce)
 * @returns boolean indicating whether the target element is currently in view
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  options: UseInViewOptions = {}
): boolean {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = false } = options;
  const [isInView, setIsInView] = useState<boolean>(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    // If triggerOnce is enabled and already triggered, don't re-observe
    if (triggerOnce && isInView) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, threshold, rootMargin, triggerOnce, isInView]);

  return isInView;
}

export default useInView;
