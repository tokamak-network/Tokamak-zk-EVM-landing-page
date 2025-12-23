// Quick test to verify Gemini model availability
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY not set");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Test different model names
const modelsToTest = [
  "gemini-2.5-flash-image",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-pro",
];

async function testModel(modelName: string) {
  try {
    console.log(`\nTesting: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    const text = result.response.text();
    console.log(`✅ ${modelName} works! Response: ${text.substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelName} failed:`, error instanceof Error ? error.message : String(error));
    return false;
  }
}

async function main() {
  console.log("Testing Gemini models...\n");
  
  for (const modelName of modelsToTest) {
    await testModel(modelName);
  }
}

main();
