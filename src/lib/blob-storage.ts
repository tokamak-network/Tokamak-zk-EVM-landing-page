import { put, del } from "@vercel/blob";
import { VisualizationType } from "./visualizations";

/**
 * Upload SVG visualization to Vercel Blob Storage
 */
export async function uploadVisualization(
  svgContent: string,
  postSlug: string,
  visualizationType: VisualizationType
): Promise<{ url: string; size: number }> {
  try {
    console.log(`📤 [BLOB] Uploading ${visualizationType} for post: ${postSlug}...`);
    
    // Create a unique filename
    const filename = `visualizations/${postSlug}/${visualizationType}-${Date.now()}.svg`;
    
    // Upload to Vercel Blob
    const blob = await put(filename, svgContent, {
      access: "public",
      contentType: "image/svg+xml",
    });
    
    console.log(`✅ [BLOB] Uploaded ${visualizationType}:`, blob.url);
    
    return {
      url: blob.url,
      size: svgContent.length,
    };
  } catch (error) {
    console.error(`❌ [BLOB] Error uploading ${visualizationType}:`, error);
    throw error;
  }
}

/**
 * Upload PNG/JPG visualization to Vercel Blob Storage
 */
export async function uploadImageVisualization(
  imageBuffer: Buffer,
  postSlug: string,
  visualizationType: VisualizationType,
  imageType: "png" | "jpg" = "png"
): Promise<{ url: string; size: number }> {
  try {
    console.log(`📤 [BLOB] Uploading ${visualizationType} image for post: ${postSlug}...`);
    
    // Create a unique filename
    const filename = `visualizations/${postSlug}/${visualizationType}-${Date.now()}.${imageType}`;
    
    // Determine content type
    const contentType = imageType === "png" ? "image/png" : "image/jpeg";
    
    // Upload to Vercel Blob
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType,
    });
    
    console.log(`✅ [BLOB] Uploaded ${visualizationType} image:`, blob.url);
    
    return {
      url: blob.url,
      size: imageBuffer.length,
    };
  } catch (error) {
    console.error(`❌ [BLOB] Error uploading ${visualizationType} image:`, error);
    throw error;
  }
}

/**
 * Upload base64 image data to Vercel Blob Storage
 */
export async function uploadBase64Image(
  base64Data: string,
  mimeType: string,
  postSlug: string,
  visualizationType: VisualizationType
): Promise<{ url: string; size: number; type: "png" | "jpg" }> {
  try {
    console.log(`📤 [BLOB] Uploading ${visualizationType} base64 image for post: ${postSlug}...`);
    
    // Determine file extension from mime type
    let extension: "png" | "jpg" = "png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
      extension = "jpg";
    }
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, "base64");
    
    // Create a unique filename
    const filename = `visualizations/${postSlug}/${visualizationType}-${Date.now()}.${extension}`;
    
    // Upload to Vercel Blob
    const blob = await put(filename, imageBuffer, {
      access: "public",
      contentType: mimeType,
    });
    
    console.log(`✅ [BLOB] Uploaded ${visualizationType} image:`, blob.url);
    
    return {
      url: blob.url,
      size: imageBuffer.length,
      type: extension,
    };
  } catch (error) {
    console.error(`❌ [BLOB] Error uploading ${visualizationType} base64 image:`, error);
    throw error;
  }
}

/**
 * Delete a visualization from Vercel Blob Storage
 */
export async function deleteVisualization(url: string): Promise<void> {
  try {
    console.log("🗑️ [BLOB] Deleting visualization:", url);
    await del(url);
    console.log("✅ [BLOB] Deleted visualization successfully");
  } catch (error) {
    console.error("❌ [BLOB] Error deleting visualization:", error);
    throw error;
  }
}

/**
 * Get the URL for a specific visualization
 * This is a helper function to construct URLs if needed
 */
export function getVisualizationUrl(
  postSlug: string,
  visualizationType: VisualizationType
): string {
  // This would typically query the metadata
  // For now, it's a placeholder that shows the expected format
  return `${process.env.BLOB_READ_WRITE_TOKEN}/visualizations/${postSlug}/${visualizationType}.svg`;
}

/**
 * Check if blob storage is properly configured
 */
export function isBlobStorageConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}
