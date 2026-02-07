
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeToken = async (tokenData: any) => {
  // Guidelines: Must use process.env.API_KEY directly.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("AI Key not set in environment.");
    return { verdict: "OFFLINE", analysis: "Connect API_KEY to unlock AI terminal.", score: 0 };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this Solana memecoin. Be aggressive, snappy, and use crypto degen slang.
      Token: ${tokenData.name} (${tokenData.symbol})
      Market Cap: $${tokenData.marketCap}
      24h Change: ${tokenData.priceChange24h}%
      Liquidity: $${tokenData.liquidity}
      Bonding Curve: ${tokenData.bondingCurve}%
      Description: ${tokenData.description}`,
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: "MOON, RUG, or HOLD" },
            analysis: { type: Type.STRING, description: "Snappy degen analysis" },
            score: { type: Type.NUMBER, description: "Degeneracy score 1-100" }
          },
          required: ["verdict", "analysis", "score"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Error:", error);
    return { verdict: "UNKNOWN", analysis: "AI node out of sync.", score: 50 };
  }
};
