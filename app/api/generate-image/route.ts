// To run this code you need to install the following dependencies:
// npm install @google/genai
// npm install -D @types/node

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export async function POST(request: NextRequest) {
  try {
    const { prompt, numberOfImages = 1, aspectRatio = '1:1', outputMimeType = 'image/jpeg' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!genAI) {
      // Return mock response when API key is not configured
      return NextResponse.json({
        success: true,
        data: {
          text: `Generated business visualization concept: "${prompt}"`,
          description: 'Mock image generation description for demo purposes',
          note: 'Image generation description created for business presentation (API key required for actual generation)',
          sidebarActivity: 'image_generation'
        }
      });
    }

    try {
      const response = await genAI.models.generateImages({
        model: 'models/imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages,
          outputMimeType,
          aspectRatio,
        },
      });

      if (!response?.generatedImages || response.generatedImages.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No images generated' },
          { status: 500 }
        );
      }

      // Convert images to base64 for response
      const images = response.generatedImages.map((img, index) => ({
        id: `img-${Date.now()}-${index}`,
        base64: img.image?.imageBytes ? Buffer.from(img.image.imageBytes).toString('base64') : null,
        mimeType: outputMimeType
      }));

      return NextResponse.json({
        success: true,
        data: {
          images,
          prompt,
          numberOfImages: images.length,
          sidebarActivity: 'image_generation'
        }
      });

    } catch (imageError: any) {
      console.error('Image generation error:', imageError);
      
      // Fallback to description generation
      const fallbackResponse = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ 
          role: 'user', 
          parts: [{ 
            text: `Create a detailed visual description for business concept: "${prompt}"\n\nDescribe the scene with:\n- Professional business setting\n- Clear visual metaphors for AI/technology\n- Corporate color scheme\n- Specific elements that would resonate with business decision makers` 
          }] 
        }]
      });

      return NextResponse.json({
        success: true,
        data: {
          text: `Generated business visualization concept: "${prompt}"`,
          description: fallbackResponse.text,
          note: 'Image generation description created (actual image generation may require different configuration)',
          sidebarActivity: 'image_generation'
        }
      });
    }

  } catch (error: any) {
    console.error('Generate image API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
