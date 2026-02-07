
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeToken = async (tokenData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this memecoin based on its data. Is it a potential 'moon' or a 'rug'? Be witty, short, and use crypto slang.
      Token: ${tokenData.name} (${tokenData.symbol})
      Market Cap: $${tokenData.marketCap}
      Price Change: ${tokenData.priceChange24h}%
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
            analysis: { type: Type.STRING, description: "Short snappy analysis" },
            score: { type: Type.NUMBER, description: "Degen score from 1-100" }
          },
          required: ["verdict", "analysis", "score"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { verdict: "UNKNOWN", analysis: "AI is currently sleeping through the bull run.", score: 50 };
  }
};
