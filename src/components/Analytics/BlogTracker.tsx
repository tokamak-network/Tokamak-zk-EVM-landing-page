'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  trackBlogView,
  trackBlogScrollDepth,
  trackBlogReadTime,
  trackBlogReadComplete,
} from '@/lib/analytics';

interface BlogTrackerProps {
  slug: string;
  title: string;
  tags: string[];
  author?: string;
}

/**
 * BlogTracker Component
 * 
 * Tracks user engagement with blog posts:
 * - Initial page view
 * - Scroll depth (25%, 50%, 75%, 100%)
 * - Time spent reading
 * - Read completion
 */
export default function BlogTracker({ slug, title, tags, author }: BlogTrackerProps) {
  const startTime = useRef<number>(Date.now());
  const scrollDepths = useRef<Set<number>>(new Set());
  const hasTrackedView = useRef(false);
  const hasTrackedComplete = useRef(false);

  // Track initial blog view
  useEffect(() => {
    if (!hasTrackedView.current) {
      trackBlogView(slug, title, tags, author);
      hasTrackedView.current = true;
    }
  }, [slug, title, tags, author]);

  // Calculate and track time spent
  const trackTimeSpent = useCallback(() => {
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    if (timeSpent > 5) { // Only track if user spent more than 5 seconds
      trackBlogReadTime(slug, timeSpent);
    }
  }, [slug]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight <= 0) return;
      
      const scrollPercentage = (scrollTop / docHeight) * 100;
      
      // Track milestone depths
      const depths: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100];
      
      for (const depth of depths) {
        if (scrollPercentage >= depth && !scrollDepths.current.has(depth)) {
          scrollDepths.current.add(depth);
          trackBlogScrollDepth(slug, depth);
          
          // Track completion when reaching 100%
          if (depth === 100 && !hasTrackedComplete.current) {
            hasTrackedComplete.current = true;
            const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
            trackBlogReadComplete(slug, title, timeSpent);
          }
        }
      }
    };

    // Throttle scroll handler
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    // Initial check in case page is already scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [slug, title]);

  // Track time spent when user leaves
  useEffect(() => {
    // Track on visibility change (tab switch, minimize)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackTimeSpent();
      }
    };

    // Track on page unload
    const handleBeforeUnload = () => {
      trackTimeSpent();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also track on unmount (navigation to another page)
      trackTimeSpent();
    };
  }, [trackTimeSpent]);

  // This component doesn't render anything visible
  return null;
}
