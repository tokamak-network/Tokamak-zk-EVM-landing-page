'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, trackPageView } from '@/lib/analytics';

/**
 * PostHog Provider Component
 * 
 * Initializes PostHog and handles automatic pageview tracking
 * on route changes in Next.js App Router.
 */
export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  // Initialize PostHog once on mount
  useEffect(() => {
    if (!initialized.current) {
      initPostHog();
      initialized.current = true;
    }
  }, []);

  // Track pageviews on route changes
  useEffect(() => {
    if (!initialized.current) return;
    
    // Build full URL with search params
    let url = window.location.origin + pathname;
    const params = searchParams.toString();
    if (params) {
      url += '?' + params;
    }
    
    trackPageView(url);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
