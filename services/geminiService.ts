
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeToken = async (tokenData: any) => {
  // Always use a named parameter with process.env.API_KEY as per instructions
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform deep degen analysis on this Solana token. Use slang like 'moon', 'jeet', 'rug', 'pumping', 'diamond hands'.
      Token: ${tokenData.name} (${tokenData.symbol})
      Market Cap: $${tokenData.marketCap}
      24h Vol: $${tokenData.volume24h}
      Liquidity: $${tokenData.liquidity}
      Bonding: ${tokenData.bondingCurve}%
      Holders: ${tokenData.holders || 'Unknown'}`,
      config: {
        temperature: 0.9,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: "A short, catchy verdict like 'MOONSHOT' or 'JEET TRAP'" },
            analysis: { type: Type.STRING, description: "Deep technical analysis using crypto slang" },
            score: { type: Type.NUMBER, description: "Degen score from 0 to 100" }
          },
          required: ["verdict", "analysis", "score"]
        }
      }
    });

    // Use .text property directly as defined in GenerateContentResponse
    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Analysis Failure:", error);
    return { 
      verdict: "NODE ERROR", 
      analysis: "AI Neural Engine is currently congested. The dev is likely jeeting. Try again shortly.", 
      score: 50 
    };
  }
};
