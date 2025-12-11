import posthog from 'posthog-js';

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

/**
 * Initialize PostHog - called once in the PostHogProvider
 */
export function initPostHog() {
  if (!isBrowser) return;
  
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
  
  if (!posthogKey) {
    console.warn('[Analytics] PostHog key not found. Analytics disabled.');
    return;
  }

  posthog.init(posthogKey, {
    api_host: posthogHost,
    person_profiles: 'identified_only',
    capture_pageview: false, // We'll handle this manually for Next.js routing
    capture_pageleave: true, // Capture when user leaves the page
    persistence: 'localStorage+cookie', // For returning visitor tracking
  });
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!isBrowser) return;
  
  posthog.capture(eventName, properties);
}

/**
 * Track page view - called on route changes
 */
export function trackPageView(url?: string) {
  if (!isBrowser) return;
  
  posthog.capture('$pageview', {
    $current_url: url || window.location.href,
  });
}

/**
 * Track blog post view
 */
export function trackBlogView(slug: string, title: string, tags: string[], author?: string) {
  if (!isBrowser) return;
  
  posthog.capture('blog_post_viewed', {
    slug,
    title,
    tags,
    author: author || 'Unknown',
    $current_url: window.location.href,
  });
}

/**
 * Track time spent reading a blog post
 */
export function trackBlogReadTime(slug: string, timeSeconds: number) {
  if (!isBrowser) return;
  
  posthog.capture('blog_time_spent', {
    slug,
    seconds: timeSeconds,
    minutes: Math.round(timeSeconds / 60 * 10) / 10, // Round to 1 decimal
  });
}

/**
 * Track scroll depth on blog posts
 */
export function trackBlogScrollDepth(slug: string, depth: 25 | 50 | 75 | 100) {
  if (!isBrowser) return;
  
  posthog.capture('blog_scroll_depth', {
    slug,
    depth,
    depth_label: `${depth}%`,
  });
}

/**
 * Track blog read completion (reached end of article)
 */
export function trackBlogReadComplete(slug: string, title: string, timeSeconds: number) {
  if (!isBrowser) return;
  
  posthog.capture('blog_read_complete', {
    slug,
    title,
    total_time_seconds: timeSeconds,
  });
}

/**
 * Track landing page section views
 */
export function trackSectionView(sectionName: string) {
  if (!isBrowser) return;
  
  posthog.capture('section_viewed', {
    section_name: sectionName,
    $current_url: window.location.href,
  });
}

/**
 * Track CTA button clicks
 */
export function trackCTAClick(buttonName: string, location: string, href?: string) {
  if (!isBrowser) return;
  
  posthog.capture('cta_clicked', {
    button_name: buttonName,
    location,
    href,
    $current_url: window.location.href,
  });
}

/**
 * Track social link clicks
 */
export function trackSocialClick(platform: string, location: string) {
  if (!isBrowser) return;
  
  posthog.capture('social_link_clicked', {
    platform,
    location,
    $current_url: window.location.href,
  });
}

/**
 * Identify a user (for returning visitor tracking)
 * PostHog automatically generates anonymous IDs, but you can
 * call this to merge sessions if you have user identification
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!isBrowser) return;
  
  posthog.identify(userId, properties);
}

/**
 * Reset user identity (for logout scenarios)
 */
export function resetUser() {
  if (!isBrowser) return;
  
  posthog.reset();
}

/**
 * Get the current distinct ID (for debugging)
 */
export function getDistinctId(): string | undefined {
  if (!isBrowser) return undefined;
  
  return posthog.get_distinct_id();
}

/**
 * Check if PostHog has been initialized
 */
export function isPostHogLoaded(): boolean {
  if (!isBrowser) return false;
  
  return posthog.__loaded ?? false;
}

export default posthog;
