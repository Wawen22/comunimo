'use client';

import { useEffect, useState } from 'react';

/**
 * Animated background with floating blobs
 * Creates a modern, dynamic background effect
 */
export function AnimatedBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Blob 1 */}
      <div
        className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl animate-blob"
        style={{ animationDelay: '0s' }}
      />
      
      {/* Blob 2 */}
      <div
        className="absolute top-40 right-20 h-96 w-96 rounded-full bg-brand-red/15 blur-3xl animate-blob"
        style={{ animationDelay: '2s' }}
      />
      
      {/* Blob 3 */}
      <div
        className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-brand-blue-dark/20 blur-3xl animate-blob"
        style={{ animationDelay: '4s' }}
      />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}

