'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  trackBlogView,
  trackBlogScrollDepth,
  trackBlogReadTime,
  trackBlogReadComplete,
  trackBlogHeartbeat,
} from '@/lib/analytics';

interface BlogTrackerProps {
  slug: string;
  title: string;
  tags: string[];
  author?: string;
}

// Heartbeat interval in milliseconds (30 seconds)
const HEARTBEAT_INTERVAL = 30000;
// Minimum time before tracking (5 seconds)
const MIN_TRACK_TIME = 5;

/**
 * BlogTracker Component
 * 
 * Tracks user engagement with blog posts:
 * - Initial page view
 * - Scroll depth (25%, 50%, 75%, 100%)
 * - Time spent reading (both total and active time)
 * - Read completion
 * - Heartbeat every 30 seconds for active readers
 */
export default function BlogTracker({ slug, title, tags, author }: BlogTrackerProps) {
  // Timing refs
  const pageLoadTime = useRef<number>(Date.now());
  const activeTime = useRef<number>(0);
  const lastActiveTimestamp = useRef<number>(Date.now());
  const isTabVisible = useRef<boolean>(true);
  
  // State tracking refs
  const scrollDepths = useRef<Set<number>>(new Set());
  const hasTrackedView = useRef(false);
  const hasTrackedComplete = useRef(false);
  const hasTrackedFinalTime = useRef(false);
  const currentScrollDepth = useRef<number>(0);

  // Track initial blog view
  useEffect(() => {
    if (!hasTrackedView.current) {
      trackBlogView(slug, title, tags, author);
      hasTrackedView.current = true;
      
      // Log to console for debugging
      console.log(`[BlogTracker] Started tracking: ${slug}`);
    }
  }, [slug, title, tags, author]);

  // Calculate total time on page
  const getTotalTime = useCallback(() => {
    return Math.round((Date.now() - pageLoadTime.current) / 1000);
  }, []);

  // Calculate active reading time (only when tab is visible)
  const getActiveTime = useCallback(() => {
    if (isTabVisible.current) {
      // Add time since last timestamp
      activeTime.current += Date.now() - lastActiveTimestamp.current;
      lastActiveTimestamp.current = Date.now();
    }
    return Math.round(activeTime.current / 1000);
  }, []);

  // Track time spent (with duplicate prevention)
  const trackTimeSpent = useCallback((trigger: 'visibility_change' | 'page_unload' | 'unmount' | 'heartbeat') => {
    // Prevent duplicate final tracking
    if (trigger !== 'heartbeat' && hasTrackedFinalTime.current) {
      return;
    }
    
    const totalSeconds = getTotalTime();
    const activeSeconds = getActiveTime();
    
    if (activeSeconds > MIN_TRACK_TIME) {
      trackBlogReadTime(slug, totalSeconds, activeSeconds, trigger);
      
      // Mark as tracked for non-heartbeat events
      if (trigger !== 'heartbeat') {
        hasTrackedFinalTime.current = true;
      }
    }
  }, [slug, getTotalTime, getActiveTime]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight <= 0) return;
      
      const scrollPercentage = (scrollTop / docHeight) * 100;
      currentScrollDepth.current = Math.round(scrollPercentage);
      
      // Track milestone depths
      const depths: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100];
      
      for (const depth of depths) {
        if (scrollPercentage >= depth && !scrollDepths.current.has(depth)) {
          scrollDepths.current.add(depth);
          trackBlogScrollDepth(slug, depth);
          
          // Track completion when reaching 100%
          if (depth === 100 && !hasTrackedComplete.current) {
            hasTrackedComplete.current = true;
            const totalSeconds = getTotalTime();
            const activeSeconds = getActiveTime();
            trackBlogReadComplete(slug, title, totalSeconds, activeSeconds);
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
  }, [slug, title, getTotalTime, getActiveTime]);

  // Handle visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Tab is now hidden - pause active time tracking
        if (isTabVisible.current) {
          activeTime.current += Date.now() - lastActiveTimestamp.current;
          isTabVisible.current = false;
          // Track time when tab becomes hidden
          trackTimeSpent('visibility_change');
        }
      } else {
        // Tab is now visible - resume active time tracking
        isTabVisible.current = true;
        lastActiveTimestamp.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [trackTimeSpent]);

  // Track time on page unload (using sendBeacon for reliability)
  useEffect(() => {
    const handleBeforeUnload = () => {
      trackTimeSpent('page_unload');
    };

    // Use both events for maximum coverage
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      // Also track on component unmount (navigation to another page within the app)
      trackTimeSpent('unmount');
    };
  }, [trackTimeSpent]);

  // Heartbeat: Track every 30 seconds while actively reading
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      // Only send heartbeat if tab is visible
      if (isTabVisible.current) {
        const activeSeconds = getActiveTime();
        if (activeSeconds > MIN_TRACK_TIME) {
          trackBlogHeartbeat(slug, activeSeconds, currentScrollDepth.current);
        }
      }
    }, HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [slug, getActiveTime]);

  // This component doesn't render anything visible
  return null;
}
