'use client';

import { useEffect, useRef } from 'react';
import { trackSectionView } from '@/lib/analytics';

interface SectionTrackerProps {
  /**
   * List of section IDs to track on the page.
   * Each section should have a corresponding element with this ID.
   */
  sections: string[];
}

/**
 * SectionTracker Component
 * 
 * Uses Intersection Observer to track which sections
 * of the landing page users view and engage with.
 */
export default function SectionTracker({ sections }: SectionTrackerProps) {
  const viewedSections = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            
            // Only track each section once per page load
            if (sectionId && !viewedSections.current.has(sectionId)) {
              viewedSections.current.add(sectionId);
              trackSectionView(sectionId);
            }
          }
        });
      },
      {
        // Trigger when 30% of the section is visible
        threshold: 0.3,
        // Start observing slightly before the element enters viewport
        rootMargin: '0px 0px -10% 0px',
      }
    );

    // Observe all specified sections
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sections]);

  // This component doesn't render anything visible
  return null;
}
