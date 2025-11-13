import { GoogleGenAI } from "@google/genai";

// FIX: Aligned with @google/genai guidelines by initializing the client
// directly with process.env.API_KEY and removing the conditional checks,
// as the key is assumed to be present.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiResponse = async (prompt: string): Promise<string> => {
  try {
    // FIX: Using systemInstruction to provide model context, which is a better practice
    // than including it in the main prompt content.
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful time and clock assistant. Keep responses brief and relevant to time, dates, alarms, or world clocks.",
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    if (error instanceof Error) {
        return `Sorry, I encountered an error: ${error.message}`;
    }
    return "Sorry, I couldn't get a response right now.";
  }
};
