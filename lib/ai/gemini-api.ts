import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK_MODEL_NAME = 'gemini-2.0-flash-001';

interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export async function generateContentWithGemini(
  apiKey: string,
  prompt: string,
  imageData?: string,
  cameraFrame?: string
): Promise<string> {
  try {
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
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ];

    const parts: Part[] = [{ text: prompt }];

    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageData,
        },
      });
    }

    if (cameraFrame) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cameraFrame,
        },
      });
    }

    const result = await model.generateContent({
      contents: [{ role: 'user', parts }],
      generationConfig,
      safetySettings,
    });

    const response = await result.response;
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No response candidates returned from the API');
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('No content parts found in the API response');
    }

    // Safely extract text from parts
    const responseText = candidate.content.parts
      .filter((part: any) => part.text) // Filter out any parts without text
      .map((part: any) => part.text)
      .join('');

    if (!responseText) {
      throw new Error('No text content found in the API response');
    }

    return responseText;
  } catch (error: any) {
    console.error('Error generating content with Gemini:', error);

    // Enhanced error handling with more specific messages
    if (error.message.includes('API key not valid')) {
      throw new Error('Invalid Gemini API key. Please check your API key in the environment variables.');
    } else if (error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please check your Google Cloud quota and billing settings.');
    } else if (error.message.includes('model')) {
      throw new Error(`Invalid model specified. Please check the GEMINI_MODEL_NAME environment variable. Current value: ${process.env.GEMINI_MODEL_NAME || 'not set'}`);
    } else if (error.message.includes('image')) {
      throw new Error('Error processing image. Please ensure the image data is valid and in the correct format.');
    }

    throw new Error(`Failed to generate content: ${error.message}`);
  }
}
