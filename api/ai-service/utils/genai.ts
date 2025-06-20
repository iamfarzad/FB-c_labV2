import { GoogleGenAI } from "@google/genai";

let genAIInstance: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set.");
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({ apiKey: apiKey });
  }
  return genAIInstance;
}
