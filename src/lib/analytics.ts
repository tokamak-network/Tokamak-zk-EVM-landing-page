import posthog from 'posthog-js';

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

// Debug mode - logs events to console in development
const isDebug = isBrowser && (
  process.env.NODE_ENV === 'development' || 
  process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true'
);

/**
 * Log analytics events to console in debug mode
 */
function debugLog(eventName: string, properties?: Record<string, unknown>) {
  if (isDebug) {
    console.log(
      `%c[Analytics] ${eventName}`,
      'color: #4fc3f7; font-weight: bold;',
      properties || ''
    );
  }
}

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
  
  debugLog('PostHog initialized', { host: posthogHost });
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!isBrowser) return;
  
  debugLog(eventName, properties);
  posthog.capture(eventName, properties);
}

/**
 * Track page view - called on route changes
 */
export function trackPageView(url?: string) {
  if (!isBrowser) return;
  
  const props = { $current_url: url || window.location.href };
  debugLog('$pageview', props);
  posthog.capture('$pageview', props);
}

/**
 * Track blog post view
 */
export function trackBlogView(slug: string, title: string, tags: string[], author?: string) {
  if (!isBrowser) return;
  
  const props = {
    slug,
    title,
    tags,
    author: author || 'Unknown',
    $current_url: window.location.href,
  };
  debugLog('blog_post_viewed', props);
  posthog.capture('blog_post_viewed', props);
}

/**
 * Track time spent reading a blog post (active time only)
 * @param slug - Blog post slug
 * @param totalSeconds - Total time on page
 * @param activeSeconds - Active reading time (tab visible)
 * @param trigger - What triggered this event
 */
export function trackBlogReadTime(
  slug: string, 
  totalSeconds: number, 
  activeSeconds: number,
  trigger: 'visibility_change' | 'page_unload' | 'unmount' | 'heartbeat'
) {
  if (!isBrowser) return;
  
  const props = {
    slug,
    total_seconds: totalSeconds,
    active_seconds: activeSeconds,
    active_minutes: Math.round(activeSeconds / 60 * 10) / 10,
    total_minutes: Math.round(totalSeconds / 60 * 10) / 10,
    engagement_ratio: totalSeconds > 0 ? Math.round((activeSeconds / totalSeconds) * 100) : 0,
    trigger,
  };
  debugLog('blog_time_spent', props);
  posthog.capture('blog_time_spent', props);
}

/**
 * Track scroll depth on blog posts
 */
export function trackBlogScrollDepth(slug: string, depth: 25 | 50 | 75 | 100) {
  if (!isBrowser) return;
  
  const props = {
    slug,
    depth,
    depth_label: `${depth}%`,
  };
  debugLog('blog_scroll_depth', props);
  posthog.capture('blog_scroll_depth', props);
}

/**
 * Track blog read completion (reached end of article)
 */
export function trackBlogReadComplete(slug: string, title: string, totalSeconds: number, activeSeconds: number) {
  if (!isBrowser) return;
  
  const props = {
    slug,
    title,
    total_time_seconds: totalSeconds,
    active_time_seconds: activeSeconds,
    engagement_ratio: totalSeconds > 0 ? Math.round((activeSeconds / totalSeconds) * 100) : 0,
  };
  debugLog('blog_read_complete', props);
  posthog.capture('blog_read_complete', props);
}

/**
 * Track landing page section views
 */
export function trackSectionView(sectionName: string) {
  if (!isBrowser) return;
  
  const props = {
    section_name: sectionName,
    $current_url: window.location.href,
  };
  debugLog('section_viewed', props);
  posthog.capture('section_viewed', props);
}

/**
 * Track CTA button clicks
 */
export function trackCTAClick(buttonName: string, location: string, href?: string) {
  if (!isBrowser) return;
  
  const props = {
    button_name: buttonName,
    location,
    href,
    $current_url: window.location.href,
  };
  debugLog('cta_clicked', props);
  posthog.capture('cta_clicked', props);
}

/**
 * Track social link clicks
 */
export function trackSocialClick(platform: string, location: string) {
  if (!isBrowser) return;
  
  const props = {
    platform,
    location,
    $current_url: window.location.href,
  };
  debugLog('social_link_clicked', props);
  posthog.capture('social_link_clicked', props);
}

/**
 * Track blog reading heartbeat (for long reading sessions)
 * Sent every 30 seconds while user is actively reading
 */
export function trackBlogHeartbeat(slug: string, activeSeconds: number, scrollDepth: number) {
  if (!isBrowser) return;
  
  const props = {
    slug,
    active_seconds: activeSeconds,
    current_scroll_depth: scrollDepth,
  };
  debugLog('blog_reading_heartbeat', props);
  posthog.capture('blog_reading_heartbeat', props);
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

/**
 * Debug function to check PostHog status
 * Call this from browser console: window.checkPostHog()
 */
export function checkPostHogStatus() {
  if (!isBrowser) {
    console.log('[Analytics] Not in browser');
    return { status: 'not_in_browser' };
  }
  
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  
  const status = {
    isLoaded: posthog.__loaded ?? false,
    hasKey: !!posthogKey,
    keyPreview: posthogKey ? `${posthogKey.substring(0, 8)}...` : 'NOT SET',
    host: posthogHost || 'https://us.i.posthog.com (default)',
    distinctId: posthog.get_distinct_id?.() || 'unknown',
    sessionId: posthog.get_session_id?.() || 'unknown',
  };
  
  console.log('%c[PostHog Status]', 'color: #4fc3f7; font-weight: bold; font-size: 14px;');
  console.table(status);
  
  if (!status.isLoaded) {
    console.warn('⚠️ PostHog is NOT loaded! Check your NEXT_PUBLIC_POSTHOG_KEY in .env.local');
  } else {
    console.log('✅ PostHog is loaded and ready to send events');
  }
  
  return status;
}

// Expose to window for debugging in browser console
if (isBrowser) {
  (window as unknown as { checkPostHog: typeof checkPostHogStatus }).checkPostHog = checkPostHogStatus;
}

export default posthog;
