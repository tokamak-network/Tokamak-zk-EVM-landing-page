import { Client } from "@notionhq/client";
import { NotionAPI } from "notion-client";

console.log("🔧 [NOTION] Initializing Notion clients...");
console.log("🔑 [NOTION] API Key exists:", !!process.env.NOTION_API_KEY);
console.log("🔑 [NOTION] API Key prefix:", process.env.NOTION_API_KEY?.substring(0, 10) + "...");
console.log("🗄️  [NOTION] Data Source ID (Database):", process.env.NOTION_DATABASE_ID || "NOT SET");

// Get Official Notion client (for database queries)
function getNotionClient() {
  if (!process.env.NOTION_API_KEY) {
    console.error("❌ [NOTION] ERROR: NOTION_API_KEY is not defined!");
    throw new Error("NOTION_API_KEY is not defined in environment variables");
  }
  
  console.log("✅ [NOTION] Creating Official Notion client with API key...");
  const client = new Client({
    auth: process.env.NOTION_API_KEY,
  });
  
  console.log("✅ [NOTION] Official client created successfully");
  return client;
}

// Get Unofficial Notion client (for fetching page recordMap)
function getNotionAPI() {
  console.log("✅ [NOTION] Creating Unofficial Notion API client...");
  const api = new NotionAPI();
  console.log("✅ [NOTION] Unofficial client created successfully");
  return api;
}

// Export the official client (for database queries)
export const notion = getNotionClient();

// Export the unofficial client (for fetching page content/recordMap)
export const notionAPI = getNotionAPI();

// Your Notion data source ID (database ID in .env.local)
export const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

console.log("✅ [NOTION] All Notion modules initialized successfully");
console.log("ℹ️  [NOTION] Official client: Database queries (metadata)");
console.log("ℹ️  [NOTION] Unofficial client: Page content (recordMap for react-notion-x)");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

