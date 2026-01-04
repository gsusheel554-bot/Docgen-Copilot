
import { GoogleGenAI, Type } from "@google/genai";
import { ExecutiveSummary, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateExecutiveSummary = async (content: string): Promise<ExecutiveSummary> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze the following document and provide a structured executive summary for an asset manager. 
    The document contains page markers like [PAGE X]. Use these to identify the page number for each point.
    Focus on key financial performance metrics, trends, and risk factors.
    
    Document content: ${content}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          bullets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "The summary sentence." },
                sourceSnippet: { type: Type.STRING, description: "A short text snippet from the document that supports this bullet." },
                pageNumber: { type: Type.INTEGER, description: "The page number where this information was found based on the [PAGE X] markers." }
              },
              required: ["text", "sourceSnippet", "pageNumber"]
            },
            description: "A structured list of 5 key highlights with source verification."
          },
          metrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING },
                trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
                confidence: { type: Type.STRING, enum: ['Strong', 'Incomplete'] },
                source: { type: Type.STRING, description: "A snippet from the document justifying this metric." }
              },
              required: ["label", "value", "trend", "confidence", "source"]
            }
          },
          risks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                impact: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                description: { type: Type.STRING },
                mitigation: { type: Type.STRING }
              },
              required: ["impact", "description"]
            }
          },
          sourceReference: { type: Type.STRING, description: "Main source page or section reference." }
        },
        required: ["bullets", "metrics", "risks", "sourceReference"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Invalid response format from AI");
  }
};

export const chatWithCopilot = async (
  query: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  assetData: string
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { role: 'user', parts: [{ text: `You are an Asset Manager AI Copilot. You have access to the following asset data: ${assetData}` }] },
      ...history.map(h => ({ role: h.role, parts: h.parts })),
      { role: 'user', parts: [{ text: query }] }
    ],
    config: {
      systemInstruction: `You are an Asset Manager AI Copilot. 
      IMPORTANT RULES:
      1. When presenting data lists (like monthly performance), ALWAYS use Markdown tables.
      2. Keep descriptions concise.
      3. Use bolding for key figures.
      4. If the user asks for "trends", provide a table and then a summary.
      5. Your tone should be professional and institutional.
      6. Cite 'Internal Portfolio API' as the source for all numerical data.`
    }
  });

  return response.text || "I'm sorry, I couldn't process that request.";
};
