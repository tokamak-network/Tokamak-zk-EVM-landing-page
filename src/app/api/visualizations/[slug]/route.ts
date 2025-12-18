import { NextRequest, NextResponse } from "next/server";
import { getVisualizationsBySlug } from "@/lib/visualizations";

/**
 * GET /api/visualizations/[slug]
 * 
 * Fetch visualization metadata for a specific blog post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    console.log("📊 [API] Fetching visualizations for slug:", slug);
    
    const metadata = await getVisualizationsBySlug(slug);
    
    if (!metadata) {
      console.log("📭 [API] No visualizations found for slug:", slug);
      return NextResponse.json(
        { error: "Visualizations not found" },
        { status: 404 }
      );
    }
    
    console.log("✅ [API] Visualizations found for slug:", slug);
    console.log("📊 [API] Status:", metadata.status);
    console.log("📊 [API] Visualization keys:", Object.keys(metadata.visualizations || {}));
    console.log("📊 [API] Full metadata:", JSON.stringify(metadata, null, 2));
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error("❌ [API] Error fetching visualizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
