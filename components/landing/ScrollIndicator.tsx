'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Animated scroll indicator that appears at the bottom of the hero section
 * Clicking it smoothly scrolls to the next section
 */
export function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide indicator when user scrolls down
      setIsVisible(window.scrollY < 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNextSection = () => {
    const heroHeight = window.innerHeight;
    window.scrollTo({
      top: heroHeight,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToNextSection}
      className={`group absolute bottom-6 sm:bottom-8 md:bottom-12 left-1/2 z-50 -translate-x-1/2 transform transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Scorri verso il basso"
    >
      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
        <span className="text-xs sm:text-sm font-medium text-white/80 group-hover:text-white transition-colors drop-shadow-lg">
          Scopri di più
        </span>
        <div className="relative flex h-10 w-7 sm:h-12 sm:w-8 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm transition-all group-hover:border-white/50 group-hover:bg-white/20 shadow-lg">
          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-bounce" />
        </div>
      </div>
    </button>
  );
}

