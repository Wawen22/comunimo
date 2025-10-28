'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Scroll to top floating action button
 * Appears when user scrolls down
 */
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-8 right-8 z-40 h-14 w-14 rounded-full bg-brand-blue shadow-2xl transition-all hover:scale-110 hover:bg-brand-blue-dark hover:shadow-brand-blue/50 animate-float"
      aria-label="Torna su"
    >
      <ArrowUp className="h-6 w-6 text-white" />
    </Button>
  );
}

