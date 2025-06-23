import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ProxyRequestBody, 
  ProxyResponse,
  AI_CAPABILITIES,
  AI_USAGE_LIMITS
} from '@/api/ai-service/types';

export class DocumentAnalysisHandler {
  private genAI: GoogleGenerativeAI;
  private supabase: SupabaseClient | null;
  private usageCount: Map<string, number> = new Map();

  constructor(apiKey: string, supabaseUrl?: string, supabaseKey?: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.supabase = supabaseUrl && supabaseKey 
      ? createClient(supabaseUrl, supabaseKey) 
      : null;
  }

  async handleDocumentAnalysis(body: ProxyRequestBody): Promise<ProxyResponse> {
    try {
      const { 
        documentData, 
        mimeType = "application/pdf", 
        prompt = "Analyze this document for business insights",
        sessionId = 'default'
      } = body;

      if (!documentData) {
        return { success: false, error: "No document data provided", status: 400 };
      }

      // Check usage limits
      const currentUsage = this.usageCount.get(sessionId) || 0;
      if (currentUsage >= AI_USAGE_LIMITS.maxDocumentAnalysis) {
        return {
          success: false,
          error: "Document analysis limit reached for this session",
          status: 429
        };
      }

      // Broadcast initial sidebar update
      if (this.supabase) {
        await this.broadcastSidebarUpdate({
          activity: 'document_analysis',
          message: '📄 Processing document...',
          timestamp: Date.now(),
          progress: 10
        });
      }

      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest" 
      });

      const businessAnalysisPrompt = `Analyze this business document and provide:
      
      1. **Executive Summary**: Key points in 2-3 sentences
      2. **Business Opportunities**: Areas where AI could help
      3. **Process Improvements**: Workflow optimizations possible
      4. **ROI Potential**: Quantifiable benefits with specific metrics
      5. **Implementation Roadmap**: Practical next steps with timeline
      6. **Risk Analysis**: Potential challenges and mitigation strategies
      
      Focus on actionable insights that a business decision-maker can use immediately.
      Be specific and avoid generic recommendations.
      
      Original request: ${prompt}`;

      // Update sidebar - analyzing
      if (this.supabase) {
        await this.broadcastSidebarUpdate({
          activity: 'document_analysis',
          message: '📄 Analyzing document content...',
          timestamp: Date.now(),
          progress: 50
        });
      }

      // Create document part for Gemini
      const documentPart = {
        inlineData: {
          data: documentData,
          mimeType: mimeType
        }
      };

      const result = await model.generateContent([businessAnalysisPrompt, documentPart]);
      const response = result.response;
      const analysis = response.text();

      // Extract structured insights
      const structuredAnalysis = this.structureDocumentAnalysis(analysis);

      // Update sidebar - complete
      if (this.supabase) {
        await this.broadcastSidebarUpdate({
          activity: 'document_analysis',
          message: '✅ Document analysis complete',
          timestamp: Date.now(),
          progress: 100
        });
      }

      // Update usage count
      this.usageCount.set(sessionId, currentUsage + 1);

      // Calculate usage
      const inputTokens = this.estimateTokens(businessAnalysisPrompt);
      const outputTokens = this.estimateTokens(analysis);
      const cost = this.estimateCost(inputTokens, outputTokens);

      return {
        success: true,
        data: {
          text: analysis,
          structuredAnalysis,
          documentType: this.detectDocumentType(mimeType),
          sidebarActivity: "document_analysis",
          capability: AI_CAPABILITIES.DOCUMENT_UNDERSTANDING,
          metadata: {
            mimeType,
            analysisDepth: 'comprehensive',
            timestamp: Date.now()
          }
        },
        usage: { inputTokens, outputTokens, cost }
      };
    } catch (error: any) {
      console.error("Error in handleDocumentAnalysis:", error);
      return {
        success: false,
        error: error.message || "Failed to analyze document",
        status: 500
      };
    }
  }

  private structureDocumentAnalysis(analysis: string): any {
    const sections = {
      executiveSummary: '',
      businessOpportunities: [] as string[],
      processImprovements: [] as string[],
      roiPotential: {
        summary: '',
        metrics: [] as string[]
      },
      implementationRoadmap: [] as string[],
      riskAnalysis: [] as string[]
    };

    const lines = analysis.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('executive summary')) {
        currentSection = 'executiveSummary';
      } else if (trimmedLine.toLowerCase().includes('business opportunities')) {
        currentSection = 'businessOpportunities';
      } else if (trimmedLine.toLowerCase().includes('process improvements')) {
        currentSection = 'processImprovements';
      } else if (trimmedLine.toLowerCase().includes('roi potential')) {
        currentSection = 'roiPotential';
      } else if (trimmedLine.toLowerCase().includes('implementation roadmap')) {
        currentSection = 'implementationRoadmap';
      } else if (trimmedLine.toLowerCase().includes('risk analysis')) {
        currentSection = 'riskAnalysis';
      } else if (trimmedLine && currentSection) {
        // Process content based on current section
        if (currentSection === 'executiveSummary') {
          sections.executiveSummary += trimmedLine + ' ';
        } else if (currentSection === 'roiPotential') {
          if (trimmedLine.match(/^[\d\-\*•]/)) {
            sections.roiPotential.metrics.push(trimmedLine.replace(/^[\d\-\*•]\s*/, ''));
          } else {
            sections.roiPotential.summary += trimmedLine + ' ';
          }
        } else if (trimmedLine.match(/^[\d\-\*•]/)) {
          const cleanedLine = trimmedLine.replace(/^[\d\-\*•]\s*/, '');
          // Only push to array sections
          if (currentSection === 'businessOpportunities' || 
              currentSection === 'processImprovements' || 
              currentSection === 'implementationRoadmap' || 
              currentSection === 'riskAnalysis') {
            (sections[currentSection] as string[]).push(cleanedLine);
          }
        }
      }
    }

    // Clean up summaries
    sections.executiveSummary = sections.executiveSummary.trim();
    sections.roiPotential.summary = sections.roiPotential.summary.trim();

    return sections;
  }

  private detectDocumentType(mimeType: string): string {
    const typeMap: Record<string, string> = {
      'application/pdf': 'PDF Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation',
      'text/plain': 'Text Document',
      'text/csv': 'CSV File',
      'application/json': 'JSON Data',
      'text/html': 'HTML Document'
    };

    return typeMap[mimeType] || 'Unknown Document Type';
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