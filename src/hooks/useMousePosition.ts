'use client';

import { useState, useEffect } from 'react';

export interface MousePosition {
  x: number;
  y: number;
  /**
   * Horizontal position normalized from -1 (left edge) to 1 (right edge),
   * with 0 at the exact viewport center.
   */
  normalizedX: number;
  /**
   * Vertical position normalized from -1 (top edge) to 1 (bottom edge),
   * with 0 at the exact viewport center.
   */
  normalizedY: number;
}

const INITIAL_POSITION: MousePosition = {
  x: 0,
  y: 0,
  normalizedX: 0,
  normalizedY: 0,
};

/**
 * Custom React hook that tracks mouse position and calculates normalized coordinates
 * relative to the viewport center (-1 to 1).
 *
 * SSR-safe and inactive on touch devices (phones/tablets) to preserve performance and battery.
 *
 * @returns MousePosition object { x, y, normalizedX, normalizedY }
 */
export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>(INITIAL_POSITION);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Disable mouse tracking on touch devices
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;

    if (isTouchDevice) {
      return;
    }

    let animationFrameId: number | null = null;

    const handleMouseMove = (event: MouseEvent) => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const { clientX, clientY } = event;
        const width = window.innerWidth;
        const height = window.innerHeight;

        const centerX = width / 2;
        const centerY = height / 2;

        const rawNormalizedX = centerX > 0 ? (clientX - centerX) / centerX : 0;
        const rawNormalizedY = centerY > 0 ? (clientY - centerY) / centerY : 0;

        // Clamp values strictly between -1 and 1
        const normalizedX = Math.max(-1, Math.min(1, rawNormalizedX));
        const normalizedY = Math.max(-1, Math.min(1, rawNormalizedY));

        setPosition({
          x: clientX,
          y: clientY,
          normalizedX,
          normalizedY,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return position;
}

export default useMousePosition;
