import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ExtendedRecordMap } from "notion-types";
import { jsonrepair } from "jsonrepair";

/**
 * Parse JSON that might be wrapped in markdown code blocks or malformed
 */
function parseJSON(text: string): unknown {
  // Remove markdown code blocks if present
  let cleaned = text.trim();
  
  // Remove ```json or ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
    cleaned = cleaned.replace(/\s*```$/m, "");
  }
  
  cleaned = cleaned.trim();
  
  // Use jsonrepair to fix any malformed JSON, then parse
  const repaired = jsonrepair(cleaned);
  return JSON.parse(repaired);
}

// Initialize Gemini API
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }
  
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Extract key points from blog content using Gemini
 */
export async function extractKeyPoints(blogContent: string): Promise<string[]> {
  try {
    console.log("🤖 [GEMINI] Extracting key points from blog content...");
    
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Latest for text analysis
    
    const prompt = `Analyze the following blog post and extract 5-7 key technical points that should be visualized in an infographic.

IMPORTANT RULES:
- Focus ONLY on educational/technical concepts from the blog content
- Do NOT include any website URLs, links, or promotional content
- Do NOT include any calls-to-action like "visit our website" or "get started"
- Do NOT include any company branding or marketing messages
- Keep each point concise and informative

Return ONLY a JSON array of strings, nothing else.
    
Blog content:
${blogContent.substring(0, 8000)}
    
Example response format:
["Key point 1", "Key point 2", "Key point 3"]`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse JSON response using jsonrepair
    const keyPoints = parseJSON(text) as string[];
    
    console.log("✅ [GEMINI] Extracted", keyPoints.length, "key points");
    return keyPoints;
  } catch (error) {
    console.error("❌ [GEMINI] Error extracting key points:", error);
    throw error;
  }
}

/**
 * Model for image generation - uses Gemini's image output capability
 */
const IMAGE_MODEL = 'models/gemini-3-pro-image-preview';

/**
 * Generate an image using Gemini's image generation capability
 * Returns base64 PNG data
 */
async function generateImage(prompt: string): Promise<{ base64: string; mimeType: string }> {
  const genAI = getGeminiClient();
  
  console.log(`🔄 [GEMINI] Generating image with model: ${IMAGE_MODEL}`);
  
  // Configure model for image output
  const model = genAI.getGenerativeModel({
    model: IMAGE_MODEL,
    generationConfig: {
      // @ts-expect-error - responseModalities is a valid config for image generation
      responseModalities: ["IMAGE", "TEXT"],
    },
  });
  
  const result = await model.generateContent(prompt);
  const response = result.response;
  
  // Check if we got image data
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No response candidates from model");
  }
  
  const parts = candidates[0].content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("No content parts in response");
  }
  
  // Find the image part
  for (const part of parts) {
    if (part.inlineData) {
      console.log(`✅ [GEMINI] Generated image: ${part.inlineData.mimeType}`);
      return {
        base64: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
      };
    }
  }
  
  throw new Error("No image data in response");
}

/**
 * Image generation result type
 */
export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

/**
 * Generate PNG infographic based on blog content
 */
export async function generateInfographic(
  blogTitle: string,
  keyPoints: string[]
): Promise<GeneratedImage> {
  try {
    console.log("🎨 [GEMINI] Generating infographic image...");
    
    const prompt = `Create a modern, professional infographic image that visualizes the following blog post concepts:

Title: ${blogTitle}

Key Points to Visualize:
${keyPoints.map((point, i) => `${i + 1}. ${point}`).join("\n")}

Design Requirements:
- Dark theme with a deep navy/dark blue background (#0a1930 or similar)
- Bright cyan/teal accent colors (#4fc3f7, #028bee)
- Clean, modern, tech-focused design
- Include the title prominently at the top
- Display each key point with clear icons and readable text
- Use geometric shapes and modern design elements
- Professional look suitable for a tech blog
- Vertical layout (taller than wide)
- High contrast for readability

IMPORTANT:
- Focus ONLY on the technical concepts and key points provided
- Do NOT include any website URLs, links, or calls-to-action
- Do NOT include any branding, company logos, or promotional content
- Keep it purely educational and informational

Generate this infographic image now.`;
    
    const result = await generateImage(prompt);
    
    console.log("✅ [GEMINI] Generated infographic image");
    return result;
  } catch (error) {
    console.error("❌ [GEMINI] Error generating infographic:", error);
    throw error;
  }
}

/**
 * Generate PNG cartoon/illustration based on blog content
 */
export async function generateCartoon(
  blogTitle: string,
  blogSummary: string
): Promise<GeneratedImage> {
  try {
    console.log("🎨 [GEMINI] Generating cartoon image...");
    
    const prompt = `Create a friendly, cartoon-style illustration that represents this blog post concept:

Title: ${blogTitle}
Summary: ${blogSummary}

Design Requirements:
- Cartoon/illustration style with friendly, approachable characters or mascots
- Dark background (#0a1930) with bright cyan/teal accent colors (#4fc3f7, #028bee)
- Simple, cute characters or abstract representations
- Tech-focused but friendly and inviting
- Clean, modern cartoon style
- No text or minimal text - let the visuals tell the story
- Square or slightly horizontal layout

IMPORTANT:
- Focus ONLY on the technical concepts
- Do NOT include any website URLs or promotional content
- Do NOT include any branding or logos
- Keep it fun, educational, and visually engaging

Generate this cartoon illustration now.`;
    
    const result = await generateImage(prompt);
    
    console.log("✅ [GEMINI] Generated cartoon image");
    return result;
  } catch (error) {
    console.error("❌ [GEMINI] Error generating cartoon:", error);
    throw error;
  }
}

/**
 * Generate PNG summary card with TL;DR
 */
export async function generateSummaryCard(
  blogTitle: string,
  blogContent: string
): Promise<GeneratedImage> {
  try {
    console.log("🎨 [GEMINI] Generating summary card image...");
    
    // First extract a short summary using text model
    const genAI = getGeminiClient();
    const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const summaryPrompt = `Summarize the following blog post in ONE concise sentence (max 100 characters):

${blogContent.substring(0, 4000)}

Return only the summary text, nothing else.`;
    
    const summaryResult = await textModel.generateContent(summaryPrompt);
    const summary = summaryResult.response.text().trim();
    
    const prompt = `Create a modern TL;DR summary card image:

Title: ${blogTitle}
TL;DR: ${summary}

Design Requirements:
- Social media card style layout (horizontal, like a Twitter/LinkedIn preview card)
- Dark gradient background (from #0a1930 to #1a2347)
- Cyan accent colors (#4fc3f7, #028bee)
- "TL;DR" label prominently displayed
- Title in large, bold text
- Summary in smaller text below
- Modern, clean typography
- Decorative tech-inspired border or frame elements

IMPORTANT:
- Focus ONLY on the educational content
- Do NOT include any website URLs or calls-to-action
- Do NOT include any branding or logos
- Make it look like a shareable summary card

Generate this summary card image now.`;
    
    const result = await generateImage(prompt);
    
    console.log("✅ [GEMINI] Generated summary card image");
    return result;
  } catch (error) {
    console.error("❌ [GEMINI] Error generating summary card:", error);
    throw error;
  }
}

/**
 * Generate PNG technical diagram based on blog content
 */
export async function generateDiagram(
  blogTitle: string,
  blogContent: string
): Promise<GeneratedImage> {
  try {
    console.log("🎨 [GEMINI] Generating technical diagram image...");
    
    const prompt = `Create a technical flowchart or architecture diagram that explains the concepts from this blog post:

Title: ${blogTitle}
Content excerpt: ${blogContent.substring(0, 3000)}

Design Requirements:
- Professional technical diagram style (flowchart, architecture diagram, or process flow)
- Dark background (#0a1930) with cyan/blue colors (#4fc3f7, #028bee)
- Clear boxes, arrows, and labels showing relationships and flow
- Concise, readable text labels
- Modern, clean design suitable for a tech presentation
- Horizontal or square layout

IMPORTANT:
- Focus ONLY on the technical concepts and processes
- Show the logical flow or architecture clearly
- Do NOT include any website URLs or promotional content
- Do NOT include any branding or logos
- Make it educational and easy to understand

Generate this technical diagram now.`;
    
    const result = await generateImage(prompt);
    
    console.log("✅ [GEMINI] Generated diagram image");
    return result;
  } catch (error) {
    console.error("❌ [GEMINI] Error generating diagram:", error);
    throw error;
  }
}

/**
 * Extract plain text from Notion content for AI processing
 */
export function extractTextFromNotionContent(recordMap: Record<string, unknown> | ExtendedRecordMap): string {
  try {
    const blocks = (recordMap.block as Record<string, unknown>) || {};
    let text = "";
    
    Object.values(blocks).forEach((block: unknown) => {
      const blockValue = (block as Record<string, unknown>).value;
      if (!blockValue) return;
      
      const blockData = blockValue as Record<string, unknown>;
      const properties = blockData.properties as Record<string, unknown> | undefined;
      
      // Extract text from title
      if (properties?.title) {
        const titleArray = properties.title as Array<unknown>;
        const titleText = titleArray
          .map((item: unknown) => (Array.isArray(item) ? item[0] : item))
          .join("");
        text += titleText + "\n\n";
      }
      
      // Extract text from other text properties
      if (properties?.text) {
        const textArray = properties.text as Array<unknown>;
        const textContent = textArray
          .map((item: unknown) => (Array.isArray(item) ? item[0] : item))
          .join("");
        text += textContent + "\n\n";
      }
    });
    
    return text.trim();
  } catch (error) {
    console.error("❌ [GEMINI] Error extracting text from Notion:", error);
    return "";
  }
}
