import { GoogleGenAI } from "@google/genai";

// Fix: Use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an image using the high-intelligence Gemini 3 Pro model.
 * Used for detailed scene description.
 */
export const analyzeScene = async (base64Image: string): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg', // Assuming jpeg from canvas
            },
          },
          {
            text: "Describe this scene in detail for a blind user. Identify obstacles, text, layout, and safety hazards. Be concise but thorough.",
          },
        ],
      },
    });

    return response.text || "No description available.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error analyzing scene. Please try again.";
  }
};

/**
 * specifically focuses on transcribing handwritten text from an image.
 * Uses Gemini 3 Pro as handwriting is a "Complex Text Task".
 */
export const readHandwriting = async (base64Image: string): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: "Transcribe the handwritten text in this image. Read it exactly as written. If it is illegible or not text, say 'Handwriting unclear'. Do not add markdown or conversational filler.",
          },
        ],
      },
    });

    return response.text || "No handwriting detected.";
  } catch (error) {
    console.error("Gemini Handwriting Error:", error);
    return "Error reading handwriting.";
  }
};

/**
 * Rapidly processes text or answers a quick question using Gemini 2.5 Flash Lite.
 * Used for quick text cleanup or summarization.
 */
export const quickAIResponse = async (inputText: string): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `Fix the following OCR text to make it natural to read aloud. If it is gibberish, say "Text unclear". Text: "${inputText}"`,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Flash Lite Error:", error);
    return "";
  }
};