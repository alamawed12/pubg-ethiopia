'use client';

import React, { useEffect, useRef, useState } from 'react';

export function CursorGlow() {
  const [isVisible, setIsVisible] = useState(false);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only enable on devices with fine pointer (mouse/trackpad, not touch)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isFinePointer || reducedMotion) {
      return;
    }

    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let rafId: number | null = null;
    let hasStarted = false;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!hasStarted) {
        currentX = targetX;
        currentY = targetY;
        hasStarted = true;
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      if (hasStarted) {
        setIsVisible(true);
      }
    };

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      // Smooth lag / interpolation
      currentX = lerp(currentX, targetX, 0.15);
      currentY = lerp(currentY, targetY, 0.15);

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        width: '600px',
        height: '600px',
        background:
          'radial-gradient(circle, rgba(204, 255, 0, 0.10) 0%, rgba(204, 255, 0, 0.04) 40%, transparent 70%)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 300ms ease-out',
        willChange: 'transform',
      }}
      className="fixed top-0 left-0 pointer-events-none z-30 rounded-full select-none"
    />
  );
}

export default CursorGlow;
