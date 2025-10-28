'use client';

import { useEffect, useState } from 'react';

/**
 * Scroll progress indicator
 * Shows a progress bar at the top of the page
 */
export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;

      setScrollProgress(scrolled);
    };

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();

    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return (
    <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-gray-200/50 backdrop-blur-sm">
      <div
        className="h-full bg-gradient-to-r from-brand-blue via-brand-red to-brand-blue transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}

