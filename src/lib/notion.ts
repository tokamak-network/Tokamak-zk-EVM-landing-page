import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

console.log("🔧 [NOTION] Initializing Notion client...");
console.log("🔑 [NOTION] API Key exists:", !!process.env.NOTION_API_KEY);
console.log("🔑 [NOTION] API Key prefix:", process.env.NOTION_API_KEY?.substring(0, 10) + "...");
console.log("🗄️  [NOTION] Data Source ID (Database):", process.env.NOTION_DATABASE_ID || "NOT SET");

// Get Notion client (lazy initialization)
function getNotionClient() {
  if (!process.env.NOTION_API_KEY) {
    console.error("❌ [NOTION] ERROR: NOTION_API_KEY is not defined!");
    throw new Error("NOTION_API_KEY is not defined in environment variables");
  }
  
  console.log("✅ [NOTION] Creating Notion client with API key...");
  const client = new Client({
    auth: process.env.NOTION_API_KEY,
  });
  
  console.log("✅ [NOTION] Client created successfully");
  console.log("🔍 [NOTION] Client type:", typeof client);
  console.log("🔍 [NOTION] Client.databases.retrieve:", typeof client.databases.retrieve);
  console.log("🔍 [NOTION] Client.dataSources.query:", typeof client.dataSources?.query);
  
  return client;
}

// Export the client
export const notion = getNotionClient();

// Initialize Notion to Markdown converter
console.log("📝 [NOTION] Initializing Notion to Markdown converter...");
export const n2m = new NotionToMarkdown({ notionClient: notion });
console.log("✅ [NOTION] Notion to Markdown initialized");

// Your Notion data source ID (database ID in .env.local - same value, new API terminology)
export const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

console.log("✅ [NOTION] All Notion modules initialized successfully");
console.log("ℹ️  [NOTION] Using databases.retrieve() → dataSources.query() flow");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

