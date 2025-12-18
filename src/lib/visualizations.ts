import { put, list, del } from "@vercel/blob";

/**
 * Visualization types that can be generated
 */
export type VisualizationType = "infographic" | "cartoon" | "summaryCard" | "diagram";

/**
 * Metadata for a single visualization
 */
export interface Visualization {
  url: string;
  type: "svg" | "png" | "jpg" | string;
  generatedAt: string;
  size?: number;
}

/**
 * Metadata for all visualizations of a blog post
 */
export interface PostVisualizationMetadata {
  slug: string;
  postId: string;
  generatedAt: string;
  lastUpdated: string;
  status: "pending" | "generating" | "completed" | "failed";
  error?: string;
  visualizations: {
    [K in VisualizationType]?: Visualization;
  };
}

/**
 * Complete metadata store
 */
export interface VisualizationsMetadata {
  [postId: string]: PostVisualizationMetadata;
}

const METADATA_BLOB_NAME = "visualizations-metadata.json";

/**
 * Load visualization metadata from Vercel Blob storage
 */
export async function loadMetadata(): Promise<VisualizationsMetadata> {
  try {
    const blobs = await list({ prefix: METADATA_BLOB_NAME });
    
    if (blobs.blobs.length === 0) {
      console.log("📦 [METADATA] No metadata file found, returning empty metadata");
      return {};
    }

    const metadataBlob = blobs.blobs[0];
    // Add cache-busting to avoid stale CDN responses
    const urlWithCacheBust = `${metadataBlob.url}?t=${Date.now()}`;
    const response = await fetch(urlWithCacheBust, { cache: 'no-store' });
    const metadata = await response.json();
    
    console.log("✅ [METADATA] Loaded metadata for", Object.keys(metadata).length, "posts");
    return metadata;
  } catch (error) {
    console.error("❌ [METADATA] Error loading metadata:", error);
    return {};
  }
}

/**
 * Save visualization metadata to Vercel Blob storage
 */
export async function saveMetadata(metadata: VisualizationsMetadata): Promise<void> {
  try {
    // First, delete the old metadata blob if it exists
    const blobs = await list({ prefix: METADATA_BLOB_NAME });
    if (blobs.blobs.length > 0) {
      const oldBlob = blobs.blobs[0];
      await del(oldBlob.url);
      console.log("🗑️ [METADATA] Deleted old metadata blob");
    }
    
    // Now save the new metadata
    const jsonString = JSON.stringify(metadata, null, 2);
    const blob = await put(METADATA_BLOB_NAME, jsonString, {
      access: "public",
      contentType: "application/json",
    });
    
    console.log("✅ [METADATA] Saved metadata to blob:", blob.url);
  } catch (error) {
    console.error("❌ [METADATA] Error saving metadata:", error);
    throw error;
  }
}

/**
 * Get visualizations for a specific post by slug
 */
export async function getVisualizationsBySlug(
  slug: string
): Promise<PostVisualizationMetadata | null> {
  const metadata = await loadMetadata();
  
  // Find post by slug
  const postEntry = Object.values(metadata).find((post) => post.slug === slug);
  
  if (!postEntry) {
    console.log("📭 [METADATA] No visualizations found for slug:", slug);
    return null;
  }
  
  console.log("✅ [METADATA] Found visualizations for slug:", slug);
  return postEntry;
}

/**
 * Update metadata for a specific post
 */
export async function updatePostMetadata(
  postId: string,
  updates: Partial<PostVisualizationMetadata>
): Promise<void> {
  const metadata = await loadMetadata();
  
  metadata[postId] = {
    ...metadata[postId],
    ...updates,
    lastUpdated: new Date().toISOString(),
  } as PostVisualizationMetadata;
  
  await saveMetadata(metadata);
  console.log("✅ [METADATA] Updated metadata for post:", postId);
}

/**
 * Add a visualization to a post
 * @param markCompleted - If true, also marks the post as completed (avoids race condition)
 */
export async function addVisualization(
  postId: string,
  slug: string,
  visualizationType: VisualizationType,
  visualization: Visualization,
  markCompleted: boolean = false
): Promise<void> {
  const metadata = await loadMetadata();
  
  if (!metadata[postId]) {
    metadata[postId] = {
      slug,
      postId,
      generatedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: "generating",
      visualizations: {},
    };
  }
  
  metadata[postId].visualizations[visualizationType] = visualization;
  metadata[postId].lastUpdated = new Date().toISOString();
  
  // Optionally mark as completed in the same save operation
  if (markCompleted) {
    metadata[postId].status = "completed";
    console.log(`✅ [METADATA] Added ${visualizationType} and marked as completed for post:`, postId);
  } else {
    console.log(`✅ [METADATA] Added ${visualizationType} for post:`, postId);
  }
  
  await saveMetadata(metadata);
}

/**
 * Mark post visualization generation as failed
 */
export async function markPostAsFailed(
  postId: string,
  slug: string,
  error: string
): Promise<void> {
  await updatePostMetadata(postId, {
    slug,
    postId,
    status: "failed",
    error,
    lastUpdated: new Date().toISOString(),
  });
}

/**
 * Mark post visualization generation as completed
 */
export async function markPostAsCompleted(postId: string): Promise<void> {
  const metadata = await loadMetadata();
  
  if (metadata[postId]) {
    metadata[postId].status = "completed";
    metadata[postId].lastUpdated = new Date().toISOString();
    await saveMetadata(metadata);
    console.log("✅ [METADATA] Marked post as completed:", postId);
  }
}

/**
 * Check if a post has visualizations
 */
export async function hasVisualizations(postId: string): Promise<boolean> {
  const metadata = await loadMetadata();
  return !!metadata[postId] && metadata[postId].status === "completed";
}

/**
 * Get all posts without visualizations
 */
export async function getPostsWithoutVisualizations(
  allPostIds: string[]
): Promise<string[]> {
  const metadata = await loadMetadata();
  
  return allPostIds.filter((postId) => {
    const postMeta = metadata[postId];
    return !postMeta || postMeta.status === "failed" || postMeta.status === "pending";
  });
}

/**
 * Delete visualizations for a post (cleanup)
 */
export async function deletePostVisualizations(postId: string): Promise<void> {
  const metadata = await loadMetadata();
  const postMeta = metadata[postId];
  
  if (!postMeta) {
    console.log("📭 [METADATA] No visualizations to delete for post:", postId);
    return;
  }
  
  // Delete all visualization blobs
  const deletePromises = Object.values(postMeta.visualizations).map(
    async (visual) => {
      if (visual?.url) {
        try {
          await del(visual.url);
          console.log("🗑️ [METADATA] Deleted visualization:", visual.url);
        } catch (error) {
          console.error("❌ [METADATA] Error deleting visualization:", error);
        }
      }
    }
  );
  
  await Promise.all(deletePromises);
  
  // Remove from metadata
  delete metadata[postId];
  await saveMetadata(metadata);
  
  console.log("✅ [METADATA] Deleted all visualizations for post:", postId);
}
