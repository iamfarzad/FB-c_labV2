import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const FALLBACK_MODEL_NAME = "gemini-2.0-flash-exp";

export async function generateContentWithGemini(apiKey: string, prompt: string, imageData?: string, cameraFrame?: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL_NAME || FALLBACK_MODEL_NAME;
  const model = genAI.getGenerativeModel({ model: modelName });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const parts = [
    { text: prompt },
  ];

  if (imageData) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg", // Assuming JPEG, adjust if necessary
        data: imageData,
      },
    });
  }

  if (cameraFrame) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg", // Assuming JPEG, adjust if necessary
        data: cameraFrame,
      },
    });
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
    // It seems systemInstruction was here in the original app/api/chat/route.ts but not in the refactored gemini-api.ts.
    // Adding it back here if it's intended to be part of the Gemini call.
    // If not, this line can be removed.
    // systemInstruction: "You are F.B/c AI, a helpful and intelligent assistant with vision capabilities. Be conversational, helpful, and engaging.",
  });

  // Error handling for blocked responses or missing candidates
  if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
    // Check for promptFeedback if response is undefined
    // Also, check if result.response.promptFeedback exists before trying to access blockReason
    if (result.response && result.response.promptFeedback && result.response.promptFeedback.blockReason) {
      throw new Error(`API request blocked due to: ${result.response.promptFeedback.blockReason}`);
    }
    // Fallback error if no specific block reason is found
    throw new Error("API request failed or was blocked, and no content was generated. The response may have been blocked by safety settings.");
  }

  const responseText = result.response.candidates[0].content.parts.map(part => part.text).join("");
  return responseText;
}
