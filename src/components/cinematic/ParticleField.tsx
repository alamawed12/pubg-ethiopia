'use client';

import React, { useEffect, useRef } from 'react';

export interface ParticleFieldProps {
  className?: string;
  opacity?: number;
  particleCount?: number;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  vx: number;
  vy: number;
  isBright: boolean;
  glowRadius: number;
}

export function ParticleField({
  className = '',
  opacity = 1,
  particleCount = 150,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isRunning = false;
    let isIntersecting = true;
    let isDocumentVisible = !document.hidden;

    // Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = reducedMotionQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const isBright = Math.random() < 0.2; // 20% brighter particles for depth
        const radius = isBright ? 2 + Math.random() * 1.5 : 1 + Math.random() * 1.5;
        const baseAlpha = isBright
          ? 0.5 + Math.random() * 0.3
          : 0.1 + Math.random() * 0.4;

        // Random velocity between 0.1 and 0.5 px/frame in random angle
        const speed = 0.1 + Math.random() * 0.4;
        const angle = Math.random() * Math.PI * 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        particles.push({
          x: Math.random() * (width || 800),
          y: Math.random() * (height || 600),
          radius,
          baseAlpha,
          alpha: baseAlpha,
          vx,
          vy,
          isBright,
          glowRadius: radius * (isBright ? 3 : 1),
        });
      }
    };

    const resizeCanvas = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      if (width === 0 || height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Re-initialize particles within new bounds if not done or out of bounds
      if (particles.length === 0) {
        initParticles();
      } else {
        particles.forEach((p) => {
          if (p.x > width) p.x = Math.random() * width;
          if (p.y > height) p.y = Math.random() * height;
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const effectiveAlpha = Math.min(Math.max(p.alpha * opacity, 0), 1);

        if (p.isBright && effectiveAlpha > 0.05) {
          // Draw subtle glow around bright particles
          const glowGradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.glowRadius
          );
          glowGradient.addColorStop(0, `rgba(204, 255, 0, ${effectiveAlpha * 0.6})`);
          glowGradient.addColorStop(1, 'rgba(204, 255, 0, 0)');

          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw particle dot
        ctx.fillStyle = `rgba(204, 255, 0, ${effectiveAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const renderStatic = () => {
      resizeCanvas();
      drawParticles();
    };

    const updateParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around borders seamlessly
        if (p.x < -p.radius) p.x = width + p.radius;
        else if (p.x > width + p.radius) p.x = -p.radius;

        if (p.y < -p.radius) p.y = height + p.radius;
        else if (p.y > height + p.radius) p.y = -p.radius;
      }
    };

    const loop = () => {
      if (!isRunning) return;

      updateParticles();
      drawParticles();

      animationFrameId = requestAnimationFrame(loop);
    };

    const startAnimation = () => {
      if (prefersReducedMotion) {
        renderStatic();
        return;
      }
      if (!isRunning && isIntersecting && isDocumentVisible && width > 0 && height > 0) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    const stopAnimation = () => {
      isRunning = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    // Initial sizing
    resizeCanvas();
    if (prefersReducedMotion) {
      renderStatic();
    } else {
      startAnimation();
    }

    // ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      if (prefersReducedMotion) {
        drawParticles();
      }
    });
    resizeObserver.observe(container);

    // IntersectionObserver for viewport efficiency
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isIntersecting = entry?.isIntersecting ?? false;
        if (isIntersecting && isDocumentVisible) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // VisibilityChange for tab backgrounding
    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
      if (isDocumentVisible && isIntersecting) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopAnimation();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [opacity, particleCount]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
}

export default ParticleField;
