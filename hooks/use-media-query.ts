'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    
    // Add listener for future changes
    media.addEventListener('change', listener);
    
    // Clean up
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// Mobile detection hook
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

// Tablet detection hook
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

// Desktop detection hook
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

// Reduced motion preference hook
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// Touch device detection
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}

// High performance mode detection (for older devices)
export function useIsLowEndDevice(): boolean {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    // Check for hardware indicators of low-end devices
    const checkLowEnd = () => {
      // Check memory (if available)
      const memory = (navigator as any).deviceMemory;
      if (memory && memory <= 2) return true;

      // Check hardware concurrency (CPU cores)
      if (navigator.hardwareConcurrency <= 2) return true;

      // Check connection speed
      const connection = (navigator as any).connection;
      if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
        return true;
      }

      return false;
    };

    setIsLowEnd(checkLowEnd());
  }, []);

  return isLowEnd;
}
