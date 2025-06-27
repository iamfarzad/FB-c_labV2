import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      const response = await ai.models.generateImages({
        model: 'models/imagen-3.0-generate-002',
        prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
      });

      if (!response?.generatedImages || response.generatedImages.length === 0) {
        return NextResponse.json(
          { error: 'No images generated' },
          { status: 500 }
        );
      }

      const imageBytes = response.generatedImages[0]?.image?.imageBytes;
      if (!imageBytes) {
        return NextResponse.json(
          { error: 'Image generation failed - no image data' },
          { status: 500 }
        );
      }

      // Convert to base64
      const base64Image = Buffer.from(imageBytes).toString('base64');
      
      return NextResponse.json({
        success: true,
        image: `data:image/jpeg;base64,${base64Image}`,
        prompt
      });
      
    } catch (error: any) {
      console.error('Image generation error:', error);
      
      // Fallback to text description if image generation fails
      if (error.message?.includes('not found') || error.message?.includes('not supported')) {
        return NextResponse.json({
          success: false,
          error: 'Image generation not available, returning description instead',
          description: `Generated image concept for: "${prompt}"`,
          fallback: true
        });
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
