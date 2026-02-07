
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeToken = async (tokenData: any) => {
  // Always use a named parameter with process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform deep degen analysis on this Solana token. Use slang like 'moon', 'jeet', 'rug', 'pumping'.
      Token: ${tokenData.name} (${tokenData.symbol})
      Market Cap: $${tokenData.marketCap}
      24h Vol: $${tokenData.volume24h}
      Liquidity: $${tokenData.liquidity}
      Bonding: ${tokenData.bondingCurve}%`,
      config: {
        temperature: 1,
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

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Failure:", error);
    return { verdict: "ERROR", analysis: "AI Node congested or API key missing.", score: 50 };
  }
};
