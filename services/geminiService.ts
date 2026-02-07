
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeToken = async (tokenData: any) => {
  /**
   * Safe key retrieval. 
   * In Vercel, if you set API_KEY, it's usually process.env.API_KEY.
   * If using Vite, it might be import.meta.env.VITE_API_KEY.
   */
  const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : '') || 
                 (import.meta as any).env?.VITE_API_KEY || 
                 "";
  
  if (!apiKey) {
    console.warn("AI Key not found. Analysis disabled.");
    return { verdict: "OFFLINE", analysis: "Terminal restricted. Set API_KEY to enable AI.", score: 0 };
  }

  const ai = new GoogleGenAI({ apiKey });
  
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
        temperature: 0.9,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING },
            analysis: { type: Type.STRING },
            score: { type: Type.NUMBER }
          },
          required: ["verdict", "analysis", "score"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Failure:", error);
    return { verdict: "ERROR", analysis: "AI Node congested.", score: 50 };
  }
};
