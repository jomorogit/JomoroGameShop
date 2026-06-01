"use server"

import { GetGangres } from '@/app/action/createGame'; 
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const cleanJson = (text: string) => {
    return text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
};




export async function generateFullGameData(gameTitle: string) {
  const gengres = await GetGangres();
    if (!genAI) return { success: false, error: "Нет API ключа 🔑" };
    if (!gameTitle) return { success: false, error: "Введите название игры! ⛔" };

    const model = genAI.getGenerativeModel({ 
        model: "gemini-3.1-flash-lite-preview",
        generationConfig: { responseMimeType: "application/json" } 
    });

    const megaPrompt = `
Act as a professional Steam Marketing Specialist, Lead Game Designer, and Video Game Database. 
Analyze the game "${gameTitle}" and generate a JSON object with the following fields. 

STRICT REQUIREMENTS FOR EACH FIELD:

1. "game_description":
   - Tone: Epic, adventurous, and gripping.
   - Structure: Exactly 2 short sentences (under 200 characters). 
   - Start with a strong action verb (e.g., Survive, Conquer, Ascend).
   - Content: Highlight core conflict and the world's atmosphere.

2. "features":
   - Tone: Energetic and professional.
   - Format: A list of 6-8 distinct sections. Each section must follow the pattern: "Catchy Title!" followed by 1-2 punchy, descriptive sentences.
   - Categories to cover: World/Exploration, Combat, Progression/Crafting, Quests, Enemy Variety, and Soundtrack.
   - Use diverse action verbs (Master, Decipher, Explore).

3. "about_game":
   - Tone: Immersive, dramatic, and heroic.
   - Structure: 
     - Paragraph 1: Introduce the protagonist and the inciting incident.
     - Paragraph 2: Mention the game's legacy (sequel, spiritual successor, or genre-defining status).
     - Paragraph 3: Summarize core gameplay actions using strong verbs (Traverse, Discover, Battle).
   - Length: 500-600 characters total.

4. "developer":
   - Identify the official lead studio name.
   - If the game is fictional or you are not 100% certain, output ONLY a single question mark: "?".
   - NO extra text or punctuation.

5. "publisher":
   - Identify the official publishing company (e.g., Ubisoft, Sony Interactive Entertainment, Devolver Digital).
   - If the game is fictional, indie-self-published, or you are not 100% certain, output ONLY a single question mark: "?".
   - NO extra text or punctuation.

6. "release_date":
  - Identify the official initial release date of the game.
  - Format: Use ONLY YYYY-MM-DD (e.g., "2023-11-24").
  - If the game is fictional, unreleased, or you are not 100% certain, return an empty string "".
NO extra text, explanations, or punctuation.

7. "genres"
  - "genres": Look at the list of allowed genres below and return an array of IDs that match this game.
  ALLOWED GENRES (JSON format):
  ${JSON.stringify(gengres)}

8. "System Requirements":
   - For the following fields, provide official technical specifications for "${gameTitle}".
   - Format: Use plain strings for hardware models (e.g., "Intel Core i5-12400") and values (e.g., "16 GB", "100 GB").
   - Constraint: If the game is not available on a specific platform (Mac/Linux) or information is missing, return an empty string "".
   - DO NOT add extra descriptions like "Minimum:" inside the string.

   Fill these exact keys:
   - Windows_cpu_minimum, Windows_gpu_minimum, Windows_ram_minimum, Windows_storage_minimum
   - Windows_cpu_recommended, Windows_gpu_recommended, Windows_ram_recommended, Windows_storage_recommended
   - Mac_cpu_minimum, Mac_gpu_minimum, Mac_ram_minimum, Mac_storage_minimum
   - Mac_cpu_recommended, Mac_gpu_recommended, Mac_ram_recommended, Mac_storage_recommended
   - Linux_cpu_minimum, Linux_gpu_minimum, Linux_ram_minimum, Linux_storage_minimum
   - Linux_cpu_recommended, Linux_gpu_recommended, Linux_ram_recommended, Linux_storage_recommended


9. "rating_summary":
    - Content: Provide a maturity intensity rating for the game on a scale from 1 to 10. 📈
    - Format: Output ONLY the number.
    - If the rating is unavailable, the game is unrated, or you are not 100% certain: Output nothing (leave the field empty). 🚫
    - NO labels, extra text, or punctuation.

10. "price_eur":
    - Content: Identify the current official price of the game in Euros (€).
    - Format: Output ONLY the number (e.g., 59.99).
    - NO currency symbols, NO "EUR", NO "€".
    - If the price is unknown or the game is free, output NOTHING (leave the field empty).


GENERAL RULES:
- Language: All fields must be in English.
- Formatting: DO NOT use any markdown (no asterisks **, no hashes #). Use plain text only.
- Variety: Ensure each text feels unique to "${gameTitle}".
- Output: Return ONLY a valid JSON object.
`;

   try {
    const result = await model.generateContent(megaPrompt);
    const response = await result.response;
    const text = cleanJson(response.text());
    
    const data = JSON.parse(text);

   
    const cleanVal = (val: string): string => {
        if (typeof val !== 'string') {
            // Если пришло null, undefined или число — превращаем в строку или возвращаем пустую
            return val ? String(val) : "";
        }
        return val.replace(/\*\*/g, "").replace(/###/g, "").trim();
    };

    return { 
        success: true, 
        data: {
            // Применяем очистку ко всем полям безопасно
            game_description: cleanVal(data.game_description),
            features: cleanVal(data.features),
            about_game: cleanVal(data.about_game),
            developer: cleanVal(data.developer),
            publisher: cleanVal(data.publisher),
            release_date: cleanVal(data.release_date),
            genres: Array.isArray(data.genres) ? data.genres : [],


            // Системные требования Windows
            Windows_cpu_minimum: cleanVal(data.Windows_cpu_minimum),
            Windows_gpu_minimum: cleanVal(data.Windows_gpu_minimum),
            Windows_ram_minimum: cleanVal(data.Windows_ram_minimum),
            Windows_storage_minimum: cleanVal(data.Windows_storage_minimum),
            Windows_cpu_recommended: cleanVal(data.Windows_cpu_recommended),
            Windows_gpu_recommended: cleanVal(data.Windows_gpu_recommended),
            Windows_ram_recommended: cleanVal(data.Windows_ram_recommended),
            Windows_storage_recommended: cleanVal(data.Windows_storage_recommended),

            // Системные требования Mac
            Mac_cpu_minimum: cleanVal(data.Mac_cpu_minimum),
            Mac_gpu_minimum: cleanVal(data.Mac_gpu_minimum),
            Mac_ram_minimum: cleanVal(data.Mac_ram_minimum),
            Mac_storage_minimum: cleanVal(data.Mac_storage_minimum),
            Mac_cpu_recommended: cleanVal(data.Mac_cpu_recommended),
            Mac_gpu_recommended: cleanVal(data.Mac_gpu_recommended),
            Mac_ram_recommended: cleanVal(data.Mac_ram_recommended),
            Mac_storage_recommended: cleanVal(data.Mac_storage_recommended),

            // Системные требования Linux
            Linux_cpu_minimum: cleanVal(data.Linux_cpu_minimum),
            Linux_gpu_minimum: cleanVal(data.Linux_gpu_minimum),
            Linux_ram_minimum: cleanVal(data.Linux_ram_minimum),
            Linux_storage_minimum: cleanVal(data.Linux_storage_minimum),
            Linux_cpu_recommended: cleanVal(data.Linux_cpu_recommended),
            Linux_gpu_recommended: cleanVal(data.Linux_gpu_recommended),
            Linux_ram_recommended: cleanVal(data.Linux_ram_recommended),
            Linux_storage_recommended: cleanVal(data.Linux_storage_recommended),

            rating_summary: cleanVal(data.rating_summary),
            price_eur: cleanVal(data.price_eur),
           
        } 
    };
} catch (error) {
    console.error("❌ Gemini Error:", error);
    return { success: false, error: "Ошибка при обработке данных нейросетью 🤖" };
}
}