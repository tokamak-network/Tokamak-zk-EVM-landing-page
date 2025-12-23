"use client";

import { useEffect, useState, useRef } from "react";
import { PostVisualizationMetadata, VisualizationType } from "@/lib/visualizations";
import { BarChart3, Palette, FileText, GitBranch } from "lucide-react";

interface VisualizationsSectionProps {
  slug: string;
}

// Tab configuration with icons and labels
const VISUALIZATION_TABS: {
  type: VisualizationType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  {
    type: "infographic",
    label: "Infographic",
    icon: BarChart3,
    description: "Key points visualized",
  },
  {
    type: "cartoon",
    label: "Illustration",
    icon: Palette,
    description: "Concept illustration",
  },
  {
    type: "summaryCard",
    label: "Summary",
    icon: FileText,
    description: "TL;DR card",
  },
  {
    type: "diagram",
    label: "Diagram",
    icon: GitBranch,
    description: "Technical flow",
  },
];

export default function VisualizationsSection({ slug }: VisualizationsSectionProps) {
  const [metadata, setMetadata] = useState<PostVisualizationMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<VisualizationType>("infographic");
  const generationTriggered = useRef(false);

  useEffect(() => {
    async function loadVisualizations() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/visualizations/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            if (!generationTriggered.current) {
              generationTriggered.current = true;
              triggerGenerationSilently();
            }
            setMetadata(null);
            return;
          }
          throw new Error("Failed to load visualizations");
        }
        
        const data = await response.json();
        
        const visualCount = Object.keys(data.visualizations || {}).length;
        
        // Trigger generation if empty and not already generating
        const shouldTrigger = visualCount === 0 && data.status !== "generating";
        
        if (shouldTrigger && !generationTriggered.current) {
          generationTriggered.current = true;
          triggerGenerationSilently();
        }
        
        // Set active tab to first available visualization on initial load
        if (visualCount > 0) {
          const availableTypes = Object.keys(data.visualizations) as VisualizationType[];
          // Only set if infographic isn't available (default)
          if (!availableTypes.includes("infographic")) {
            setActiveTab(availableTypes[0]);
          }
        }
        
        setMetadata(data);
      } catch (err) {
        console.error("Error loading visualizations:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    async function triggerGenerationSilently() {
      try {
        fetch("/api/generate-visuals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
      } catch (err) {
        console.error("Error triggering generation:", err);
      }
    }

    loadVisualizations();
    // Only fetch once on mount, not when switching tabs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="mt-16 pt-8 border-t border-[#4fc3f7]/30">
        <div className="flex justify-center">
          <div className="animate-pulse flex items-center gap-2 text-[#4fc3f7]/50">
            <div className="w-4 h-4 border-2 border-[#4fc3f7]/50 border-t-transparent rounded-full animate-spin" />
            <span style={{ fontFamily: '"IBM Plex Mono"' }}>Loading visualizations...</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if error or no metadata
  if (error || !metadata) return null;

  // Don't render for certain statuses
  if (metadata.status === "pending" || metadata.status === "failed") return null;
  if (metadata.status === "generating" && Object.keys(metadata.visualizations).length === 0) return null;

  // Check for visualizations
  const availableVisualizations = Object.entries(metadata.visualizations).filter(([, v]) => v);
  if (availableVisualizations.length === 0) return null;

  // Get available tabs (only show tabs that have content)
  const availableTabs = VISUALIZATION_TABS.filter(
    (tab) => metadata.visualizations[tab.type]
  );

  // Get current visualization
  const currentVisualization = metadata.visualizations[activeTab];

  return (
    <div className="mt-16 pt-8 border-t border-[#4fc3f7]/30">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2
          className="text-2xl md:text-3xl font-bold text-[#4fc3f7] mb-2"
          style={{ fontFamily: '"IBM Plex Mono"' }}
        >
          Visual Summary
        </h2>
        <p
          className="text-[#4fc3f7]/50 text-sm"
          style={{ fontFamily: '"IBM Plex Mono"' }}
        >
          AI-generated visual explanations
        </p>
      </div>

      {/* Tabs Navigation */}
      {availableTabs.length > 1 && (
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-[#0a1930]/80 rounded-lg p-1 border border-[#4fc3f7]/20">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.type;
              
              return (
                <button
                  key={tab.type}
                  onClick={() => setActiveTab(tab.type)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200
                    ${isActive 
                      ? "bg-[#4fc3f7] text-[#0a1930] shadow-lg shadow-[#4fc3f7]/30" 
                      : "text-[#4fc3f7]/70 hover:text-[#4fc3f7] hover:bg-[#4fc3f7]/10"
                    }
                  `}
                  style={{ fontFamily: '"IBM Plex Mono"' }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Tab Description */}
      {availableTabs.length > 1 && (
        <div className="text-center mb-6">
          <p
            className="text-[#4fc3f7]/40 text-xs"
            style={{ fontFamily: '"IBM Plex Mono"' }}
          >
            {availableTabs.find((t) => t.type === activeTab)?.description}
          </p>
        </div>
      )}

      {/* Visualization Display */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          {currentVisualization && (
            <div className="relative group">
              {/* Image Container with nice styling */}
              <div className="overflow-hidden rounded-xl border border-[#4fc3f7]/20 bg-[#0a1930]/50 shadow-2xl shadow-[#4fc3f7]/5">
                {currentVisualization.type === "svg" ? (
                  <object
                    data={currentVisualization.url}
                    type="image/svg+xml"
                    className="w-full h-auto"
                    aria-label="Blog visualization"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={currentVisualization.url} 
                      alt="Visualization" 
                      className="w-full h-auto" 
                    />
                  </object>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentVisualization.url}
                    alt={`${activeTab} visualization`}
                    className="w-full h-auto"
                  />
                )}
              </div>

              {/* Hover overlay with download hint */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={currentVisualization.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#0a1930]/90 text-[#4fc3f7] text-xs rounded-md border border-[#4fc3f7]/30 hover:bg-[#4fc3f7] hover:text-[#0a1930] transition-colors"
                  style={{ fontFamily: '"IBM Plex Mono"' }}
                >
                  Open Full Size ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation dots for mobile */}
      {availableTabs.length > 1 && (
        <div className="flex justify-center gap-2 mt-6 sm:hidden">
          {availableTabs.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeTab === tab.type 
                  ? "bg-[#4fc3f7] w-4" 
                  : "bg-[#4fc3f7]/30"
              }`}
              aria-label={`View ${tab.label}`}
            />
          ))}
        </div>
      )}

      {/* Generation status indicator */}
      {metadata.status === "generating" && (
        <div className="mt-6 text-center">
          <p
            className="text-[#4fc3f7]/50 text-xs animate-pulse"
            style={{ fontFamily: '"IBM Plex Mono"' }}
          >
            More visualizations generating in background...
          </p>
        </div>
      )}
    </div>
  );
}
