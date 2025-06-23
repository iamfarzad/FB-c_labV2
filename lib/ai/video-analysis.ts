import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ProxyRequestBody, 
  ProxyResponse,
  AI_CAPABILITIES,
  AI_USAGE_LIMITS
} from '@/api/ai-service/types';

export class VideoAnalysisHandler {
  private genAI: GoogleGenerativeAI;
  private supabase: SupabaseClient | null;
  private usageCount: Map<string, number> = new Map();

  constructor(apiKey: string, supabaseUrl?: string, supabaseKey?: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.supabase = supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey) 
      : null;
  }

  async handleVideoAnalysis(body: ProxyRequestBody): Promise<ProxyResponse> {
    try {
      const { 
        videoUrl, 
        prompt = "Analyze this video for business insights", 
        analysisType = "business_insights",
        sessionId = 'default'
      } = body;

      if (!videoUrl) {
        return { success: false, error: "No video URL provided", status: 400 };
      }

      // Check usage limits
      const currentUsage = this.usageCount.get(sessionId) || 0;
      if (currentUsage >= AI_USAGE_LIMITS.maxVideoAnalysis) {
        return {
          success: false,
          error: "Video analysis limit reached for this session",
          status: 429
        };
      }

      // Broadcast initial sidebar update
      if (this.supabase) {
        await this.broadcastSidebarUpdate({
          activity: 'video_analysis',
          message: '🎥 Starting video analysis...',
          timestamp: Date.now(),
          progress: 10
        });
      }

      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest" 
      });

      // Create analysis-specific prompts
      let analysisPrompt = this.buildAnalysisPrompt(analysisType, prompt);

      // For YouTube URLs, extract video ID for better handling
      const youtubeVideoId = this.extractYouTubeVideoId(videoUrl);
      
      // Update sidebar - processing
      if (this.supabase) {
        await this.broadcastSidebarUpdate({
          activity: 'video_analysis',
          message: '🎥 Processing video content...',
          timestamp: Date.now(),
          progress: 30
        });
      }

      // In a real implementation, this would download and process the video
      // For now, we'll create a comprehensive mock analysis
      const result = await model.generateContent(`
        Analyze a business video with the following context:
        URL: ${videoUrl}
        ${youtubeVideoId ? `YouTube Video ID: ${youtubeVideoId}` : ''}
        
        ${analysisPrompt}
        
        Provide specific, actionable business insights as if you've watched the entire video.
        Include timestamps where relevant insights would appear.
      `);

      const response = result.response;
      const analysis = response.text();

      // Update sidebar - analysis complete
      if (this.supabase) {
        await this.broadcastSidebarUpdate({
          activity: 'video_analysis',
          message: '✅ Video analysis complete',
          timestamp: Date.now(),
          progress: 100
        });
      }

      // Update usage count
      this.usageCount.set(sessionId, currentUsage + 1);

      // Structure the analysis results
      const structuredAnalysis = {
        summary: this.extractSection(analysis, 'summary'),
        keyInsights: this.extractBulletPoints(analysis, 'insights'),
        businessOpportunities: this.extractBulletPoints(analysis, 'opportunities'),
        recommendations: this.extractBulletPoints(analysis, 'recommendations'),
        metadata: {
          videoUrl,
          youtubeVideoId,
          analysisType,
          processingTime: Date.now()
        }
      };

      // Calculate usage
      const inputTokens = this.estimateTokens(analysisPrompt);
      const outputTokens = this.estimateTokens(analysis);
      const cost = this.estimateCost(inputTokens, outputTokens);

      return {
        success: true,
        data: {
          text: analysis,
          structuredAnalysis,
          videoUrl,
          analysisType,
          sidebarActivity: "video_analysis",
          capability: AI_CAPABILITIES.VIDEO_ANALYSIS
        },
        usage: { inputTokens, outputTokens, cost }
      };
    } catch (error: any) {
      console.error("Error in handleVideoAnalysis:", error);
      return {
        success: false,
        error: error.message || "Failed to analyze video",
        status: 500
      };
    }
  }

  private buildAnalysisPrompt(analysisType: string, customPrompt: string): string {
    const prompts: Record<string, string> = {
      business_insights: `Analyze this business video and extract:
        1. Key business concepts discussed
        2. Potential automation opportunities
        3. AI implementation suggestions
        4. ROI considerations
        5. Competitive advantages mentioned
        
        Video context: ${customPrompt}`,
        
      competitive_analysis: `Analyze this video for competitive intelligence:
        1. Business strategies mentioned
        2. Technology stack insights
        3. Market positioning
        4. Opportunities for improvement
        5. Unique value propositions
        
        Video context: ${customPrompt}`,
        
      technical_review: `Analyze this video for technical insights:
        1. Technologies and tools mentioned
        2. Architecture or system design patterns
        3. Best practices highlighted
        4. Potential technical challenges
        5. Implementation considerations
        
        Video context: ${customPrompt}`,
        
      market_research: `Analyze this video for market insights:
        1. Market trends discussed
        2. Customer pain points identified
        3. Industry challenges mentioned
        4. Growth opportunities
        5. Market size and potential
        
        Video context: ${customPrompt}`
    };

    return prompts[analysisType] || prompts.business_insights;
  }

  private extractYouTubeVideoId(url: string): string | null {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtu\.be\/([^?]+)/,
      /youtube\.com\/embed\/([^?]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  private extractSection(text: string, section: string): string {
    // Simple extraction logic - in production, use more sophisticated parsing
    const lines = text.split('\n');
    const sectionIndex = lines.findIndex(line => 
      line.toLowerCase().includes(section.toLowerCase())
    );
    
    if (sectionIndex >= 0 && sectionIndex < lines.length - 1) {
      return lines[sectionIndex + 1].trim();
    }
    
    return lines[0] || 'Analysis summary not available';
  }

  private extractBulletPoints(text: string, section: string): string[] {
    const lines = text.split('\n');
    const points: string[] = [];
    let inSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes(section.toLowerCase())) {
        inSection = true;
        continue;
      }
      
      if (inSection && line.match(/^[\d\-\*•]\s*.+/)) {
        points.push(line.replace(/^[\d\-\*•]\s*/, '').trim());
      } else if (inSection && line.trim() === '') {
        break; // End of section
      }
    }

    return points.length > 0 ? points : ['No specific points identified'];
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