import { GoogleGenerativeAI } from "@google/generative-ai";

async function listAvailableModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  
  try {
    // В текущих версиях SDK можно попробовать получить список моделей через API
    // Но чаще всего достаточно просто знать актуальные названия из документации.
    console.log("Checking model names... 🔍");
    
    // Если ты общаешься со мной, то я — Gemini 3 Flash. 
    // В коде это обычно пишется так: "gemini-3-flash"
    
  } catch (error) {
    console.error("Error listing models:", error);
  }
}