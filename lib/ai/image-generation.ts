import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ProxyRequestBody, 
  ProxyResponse,
  AI_CAPABILITIES,
  AI_USAGE_LIMITS
} from '@/api/ai-service/types';

export class ImageGenerationHandler {
  private genAI: GoogleGenerativeAI;
  private supabase: SupabaseClient | null;
  private usageCount: Map<string, number> = new Map();

  constructor(apiKey: string, supabaseUrl?: string, supabaseKey?: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.supabase = supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey) 
      : null;
  }

  async handleImageGeneration(body: ProxyRequestBody): Promise<ProxyResponse> {
    try {
      const { prompt, conversationContext, sessionId = 'default' } = body;

      if (!prompt) {
        return { success: false, error: "No prompt provided for image generation", status: 400 };
      }

      // Check usage limits
      const currentUsage = this.usageCount.get(sessionId) || 0;
      if (currentUsage >= AI_USAGE_LIMITS.maxImageGeneration) {
        return {
          success: false,
          error: "Image generation limit reached for this session",
          status: 429
        };
      }

      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest" 
      });

      const enhancedPrompt = `Create a detailed visual description for business concept: "${prompt}"
      
      Context: ${conversationContext || 'General business visualization'}
      
      Describe the scene with:
      - Professional business setting
      - Clear visual metaphors for AI/technology
      - Corporate color scheme (blues, grays, whites)
      - Specific elements that would resonate with business decision makers
      - Modern, clean aesthetic
      - Elements suggesting innovation and efficiency
      
      Make it detailed enough that a professional designer could create the visualization.
      Include specific positioning, colors, and visual elements.`;

      const result = await model.generateContent(enhancedPrompt);
      const response = result.response;
      const description = response.text();

      // Broadcast sidebar update
      if (this.supabase) {
        await this.broadcastSidebarUpdate({
          activity: 'image_generation',
          message: '🎨 Generating business visualization...',
          timestamp: Date.now(),
          progress: 50
        });
      }

      // In a real implementation, this would call an image generation API
      // For now, we'll create a placeholder response with the description
      const imageData = {
        prompt: prompt,
        description: description,
        placeholderUrl: `/api/placeholder?text=${encodeURIComponent(prompt)}&width=1024&height=1024`,
        metadata: {
          style: 'business-professional',
          colorScheme: ['#1e40af', '#3b82f6', '#60a5fa', '#e5e7eb'],
          elements: this.extractVisualElements(description)
        }
      };

      // Update usage count
      this.usageCount.set(sessionId, currentUsage + 1);

      // Complete the sidebar update
      if (this.supabase) {
        await this.broadcastSidebarUpdate({
          activity: 'image_generation',
          message: '✅ Business visualization created',
          timestamp: Date.now(),
          progress: 100
        });
      }

      // Calculate usage
      const inputTokens = this.estimateTokens(enhancedPrompt);
      const outputTokens = this.estimateTokens(description);
      const cost = this.estimateCost(inputTokens, outputTokens);

      return {
        success: true,
        data: {
          text: `Generated business visualization concept: "${prompt}"`,
          description: description,
          imageData: imageData,
          note: "Professional business visualization created for your concept",
          sidebarActivity: "image_generation",
          capability: AI_CAPABILITIES.IMAGE_GENERATION
        },
        usage: { inputTokens, outputTokens, cost }
      };
    } catch (error: any) {
      console.error("Error in handleImageGeneration:", error);
      return {
        success: false,
        error: error.message || "Failed to generate image description",
        status: 500
      };
    }
  }

  private extractVisualElements(description: string): string[] {
    const elements: string[] = [];
    
    // Extract common business visualization elements
    const elementPatterns = [
      /graph/gi, /chart/gi, /dashboard/gi, /network/gi,
      /flow/gi, /process/gi, /timeline/gi, /roadmap/gi,
      /metrics/gi, /kpi/gi, /analytics/gi, /data/gi
    ];

    elementPatterns.forEach(pattern => {
      if (pattern.test(description)) {
        elements.push(pattern.source.replace(/[/\\gi]/g, ''));
      }
    });

    return elements;
  }

  private async broadcastSidebarUpdate(update: any): Promise<void> {
    if (!this.supabase) return;
    
    try {
      await this.supabase.channel('ai-showcase')
        .send({
          type: 'broadcast',
          event: 'sidebar-update',
          payload: update
        });
    } catch (error) {
      console.error('Supabase broadcast error:', error);
    }
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = inputTokens * 0.000001;
    const outputCost = outputTokens * 0.000002;
    return inputCost + outputCost;
  }
}