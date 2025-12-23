import { getBlogPostBySlug } from "./blog";
import {
  extractKeyPoints,
  generateInfographic,
  generateCartoon,
  generateSummaryCard,
  generateDiagram,
  extractTextFromNotionContent,
  GeneratedImage,
} from "./gemini-service";
import { uploadBase64Image } from "./blob-storage";
import {
  updatePostMetadata,
  addVisualization,
  markPostAsFailed,
  markPostAsCompleted,
  VisualizationType,
} from "./visualizations";

/**
 * Process a single blog post and generate all visualizations
 */
export async function processBlogPost(
  slug: string,
  postId?: string
): Promise<{ success: boolean; error?: string }> {
  console.log("\n🔄 [PROCESS] ========== PROCESSING BLOG POST ==========");
  console.log("🔄 [PROCESS] Slug:", slug);
  
  try {
    // Step 1: Fetch the blog post
    console.log("📥 [PROCESS] Step 1: Fetching blog post...");
    const post = await getBlogPostBySlug(slug);
    
    if (!post) {
      throw new Error(`Blog post not found: ${slug}`);
    }
    
    const actualPostId = postId || post.id;
    console.log("✅ [PROCESS] Post fetched:", post.title);
    
    // Update metadata to "generating" status
    await updatePostMetadata(actualPostId, {
      slug,
      postId: actualPostId,
      status: "generating",
      generatedAt: new Date().toISOString(),
      visualizations: {},
    });
    
    // Step 2: Extract text content from Notion
    console.log("📝 [PROCESS] Step 2: Extracting text content...");
    
    let blogContent = "";
    if (post.recordMap) {
      blogContent = extractTextFromNotionContent(post.recordMap);
    }
    
    // Fallback to description if no content
    if (!blogContent || blogContent.length < 100) {
      console.log("⚠️  [PROCESS] Not enough content from recordMap, using title and description");
      blogContent = `${post.title}\n\n${post.description}`;
    }
    
    console.log("✅ [PROCESS] Extracted text:", blogContent.length, "characters");
    
    // Step 3: Extract key points using Gemini
    console.log("🤖 [PROCESS] Step 3: Extracting key points...");
    const keyPoints = await extractKeyPoints(blogContent);
    console.log("✅ [PROCESS] Extracted", keyPoints.length, "key points");
    
    // Step 4: Generate visualizations
    console.log("🎨 [PROCESS] Step 4: Generating visualizations...");
    
  // Define all visualization types to generate
  const visualizations: Array<{
    type: VisualizationType;
    generator: () => Promise<GeneratedImage>;
  }> = [
    {
      type: "infographic",
      generator: () => generateInfographic(post.title, keyPoints),
    },
    {
      type: "cartoon",
      generator: () => generateCartoon(post.title, post.description),
    },
    {
      type: "summaryCard",
      generator: () => generateSummaryCard(post.title, blogContent),
    },
    {
      type: "diagram",
      generator: () => generateDiagram(post.title, blogContent),
    },
  ];
  
  // Generate and upload each visualization
  // Track successful generations to mark completed on the last one
  let successCount = 0;
  const totalVisualizations = visualizations.length;
  
  for (let i = 0; i < visualizations.length; i++) {
    const { type, generator } = visualizations[i];
    const isLast = i === visualizations.length - 1;
    
    try {
      console.log(`🎨 [PROCESS] Generating ${type}...`);
      
      const imageResult = await generator();
      console.log(`✅ [PROCESS] Generated ${type} image (${imageResult.mimeType})`);
      
      // Upload to Vercel Blob
      console.log(`📤 [PROCESS] Uploading ${type}...`);
      const { url, size, type: imageType } = await uploadBase64Image(
        imageResult.base64,
        imageResult.mimeType,
        slug,
        type
      );
      
      // Add to metadata - mark as completed on the last visualization to avoid race condition
      const shouldMarkCompleted = isLast;
      await addVisualization(actualPostId, slug, type, {
        url,
        type: imageType,
        generatedAt: new Date().toISOString(),
        size,
      }, shouldMarkCompleted);
      
      successCount++;
      console.log(`✅ [PROCESS] Successfully generated and uploaded ${type}`);
      
      // Wait between calls if we have multiple visualizations to generate
      if (!isLast && totalVisualizations > 1) {
        console.log("⏳ [PROCESS] Waiting 15 seconds before next generation...");
        await new Promise((resolve) => setTimeout(resolve, 15000));
      }
    } catch (error) {
      console.error(`❌ [PROCESS] Error generating ${type}:`, error);
      // If this was the last one and we had some successes, still mark as completed
      if (isLast && successCount > 0) {
        console.log("✅ [PROCESS] Marking as completed despite last error (had successful generations)...");
        await markPostAsCompleted(actualPostId);
      }
      // Continue with other visualizations even if one fails
    }
  }
  
  // If all failed, mark as completed anyway (but with no visualizations)
  if (successCount === 0) {
    console.log("⚠️ [PROCESS] No successful generations, marking as completed anyway...");
    await markPostAsCompleted(actualPostId);
  }
    
    console.log("🎉 [PROCESS] Successfully processed blog post:", slug);
    console.log("🔄 [PROCESS] =============================================\n");
    
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ [PROCESS] Error processing blog post:", errorMessage);
    console.error("❌ [PROCESS] Full error:", error);
    
    // Mark as failed if we have a post ID
    if (postId) {
      await markPostAsFailed(postId, slug, errorMessage);
    }
    
    console.log("🔄 [PROCESS] =============================================\n");
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Process multiple blog posts in sequence (to avoid rate limits)
 */
export async function processBlogPosts(
  slugsWithIds: Array<{ slug: string; postId: string }>,
  maxConcurrent: number = 1
): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{ slug: string; error: string }>;
}> {
  console.log("\n🔄 [BATCH] ========== BATCH PROCESSING ==========");
  console.log("🔄 [BATCH] Total posts to process:", slugsWithIds.length);
  console.log("🔄 [BATCH] Max concurrent:", maxConcurrent);
  
  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [] as Array<{ slug: string; error: string }>,
  };
  
  // Process posts sequentially to avoid rate limits
  for (const { slug, postId } of slugsWithIds) {
    console.log(`\n🔄 [BATCH] Processing ${results.processed + 1}/${slugsWithIds.length}: ${slug}`);
    
    const result = await processBlogPost(slug, postId);
    results.processed++;
    
    if (result.success) {
      results.succeeded++;
      console.log(`✅ [BATCH] Success: ${slug}`);
    } else {
      results.failed++;
      results.errors.push({ slug, error: result.error || "Unknown error" });
      console.log(`❌ [BATCH] Failed: ${slug}`);
    }
    
    // Add a small delay between posts to avoid rate limits
    if (results.processed < slugsWithIds.length) {
      console.log("⏳ [BATCH] Waiting 2 seconds before next post...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  
  console.log("\n✅ [BATCH] Batch processing complete!");
  console.log("📊 [BATCH] Results:");
  console.log("   - Processed:", results.processed);
  console.log("   - Succeeded:", results.succeeded);
  console.log("   - Failed:", results.failed);
  
  if (results.errors.length > 0) {
    console.log("❌ [BATCH] Errors:");
    results.errors.forEach(({ slug, error }) => {
      console.log(`   - ${slug}: ${error}`);
    });
  }
  
  console.log("🔄 [BATCH] ==========================================\n");
  
  return results;
}

/**
 * Retry failed visualizations for a specific post
 */
export async function retryFailedPost(
  slug: string,
  postId: string
): Promise<{ success: boolean; error?: string }> {
  console.log("\n🔁 [RETRY] Retrying failed post:", slug);
  return processBlogPost(slug, postId);
}
