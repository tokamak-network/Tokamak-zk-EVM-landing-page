/**
 * Script to reset all visualization metadata and blobs
 * 
 * Usage: npm run reset-visualizations
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import { list, del } from "@vercel/blob";

async function resetVisualizations() {
  console.log("🗑️ Starting visualization reset...\n");

  try {
    // Check for blob token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("❌ BLOB_READ_WRITE_TOKEN environment variable is required");
      console.log("Set it in your .env.local file or export it:");
      console.log("  export BLOB_READ_WRITE_TOKEN=your_token_here");
      process.exit(1);
    }

    // List all blobs
    console.log("📋 Listing all blobs...");
    const allBlobs = await list();
    
    if (allBlobs.blobs.length === 0) {
      console.log("✅ No blobs found. Storage is already clean.");
      return;
    }

    console.log(`Found ${allBlobs.blobs.length} blob(s):\n`);
    
    // Show what will be deleted
    for (const blob of allBlobs.blobs) {
      console.log(`  - ${blob.pathname} (${blob.size} bytes)`);
    }
    
    console.log("\n🗑️ Deleting all blobs...\n");

    // Delete each blob
    for (const blob of allBlobs.blobs) {
      try {
        await del(blob.url);
        console.log(`  ✅ Deleted: ${blob.pathname}`);
      } catch (error) {
        console.error(`  ❌ Failed to delete ${blob.pathname}:`, error);
      }
    }

    console.log("\n✅ Visualization reset complete!");
    console.log("The next page load will trigger fresh generation.");

  } catch (error) {
    console.error("❌ Error during reset:", error);
    process.exit(1);
  }
}

// Run the script
resetVisualizations();
