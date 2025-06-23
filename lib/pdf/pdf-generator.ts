import jsPDF from 'jspdf';

export interface PDFReportData {
  name: string;
  email: string;
  companyName?: string;
  summary: string;
  leadScore: number;
  capabilitiesShown: string[];
  conversationInsights?: string[];
  recommendedSolutions?: string[];
  implementationRoadmap?: string[];
}

export class PDFGenerator {
  private doc: jsPDF;
  private readonly brandColors = {
    primary: { r: 44, g: 90, b: 160 },    // F.B/c blue
    secondary: { r: 59, g: 130, b: 246 }, // Lighter blue
    accent: { r: 99, g: 102, b: 241 },    // Purple accent
    text: { r: 31, g: 41, b: 55 },        // Dark gray
    lightText: { r: 107, g: 114, b: 128 } // Light gray
  };

  constructor() {
    this.doc = new jsPDF();
  }

  async generateFBCReport(data: PDFReportData): Promise<string> {
    // Reset document
    this.doc = new jsPDF();
    
    // Add first page - Cover
    this.addCoverPage(data);
    
    // Add executive summary page
    this.doc.addPage();
    this.addExecutiveSummary(data);
    
    // Add capabilities demonstrated page
    this.doc.addPage();
    this.addCapabilitiesPage(data);
    
    // Add recommendations page
    this.doc.addPage();
    this.addRecommendationsPage(data);
    
    // Add next steps page
    this.doc.addPage();
    this.addNextStepsPage(data);
    
    // Return as base64 data URI
    return this.doc.output('datauristring');
  }

  private addCoverPage(data: PDFReportData) {
    const { primary, text } = this.brandColors;
    
    // Header background
    this.doc.setFillColor(primary.r, primary.g, primary.b);
    this.doc.rect(0, 0, 210, 80, 'F');
    
    // Company name
    this.doc.setFontSize(36);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('F.B/c AI Consulting', 105, 35, { align: 'center' });
    
    // Report title
    this.doc.setFontSize(24);
    this.doc.text('AI Transformation Report', 105, 55, { align: 'center' });
    
    // Client information box
    this.doc.setFillColor(245, 247, 250);
    this.doc.rect(20, 100, 170, 60, 'F');
    
    this.doc.setFontSize(16);
    this.doc.setTextColor(text.r, text.g, text.b);
    this.doc.text('Prepared for:', 30, 115);
    
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.name, 30, 130);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(14);
    if (data.companyName) {
      this.doc.text(data.companyName, 30, 140);
    }
    
    this.doc.setFontSize(12);
    this.doc.text(`Date: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 30, 150);
    
    // AI Readiness Score
    this.addScoreVisualization(data.leadScore, 105, 190);
    
    // Footer
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.brandColors.lightText.r, this.brandColors.lightText.g, this.brandColors.lightText.b);
    this.doc.text('Confidential - Property of F.B/c AI Consulting', 105, 280, { align: 'center' });
  }

  private addScoreVisualization(score: number, x: number, y: number) {
    const radius = 30;
    const { primary, secondary, accent } = this.brandColors;
    
    // Background circle
    this.doc.setDrawColor(230, 230, 230);
    this.doc.setLineWidth(8);
    this.doc.circle(x, y, radius, 'S');
    
    // Score arc
    const scoreColor = score >= 70 ? accent : score >= 40 ? secondary : primary;
    this.doc.setDrawColor(scoreColor.r, scoreColor.g, scoreColor.b);
    this.doc.setLineWidth(8);
    
    // Draw arc based on score (simplified - in production use proper arc drawing)
    const endAngle = (score / 100) * 2 * Math.PI - Math.PI / 2;
    // Note: jsPDF doesn't have built-in arc method, so this is simplified
    
    // Score text
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.brandColors.text.r, this.brandColors.text.g, this.brandColors.text.b);
    this.doc.text(`${score}`, x, y + 5, { align: 'center' });
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('/100', x + 15, y + 5);
    
    this.doc.setFontSize(14);
    this.doc.text('AI Readiness Score', x, y + 50, { align: 'center' });
  }

  private addExecutiveSummary(data: PDFReportData) {
    this.addPageHeader('Executive Summary');
    
    let yPosition = 60;
    
    // Summary text
    this.doc.setFontSize(12);
    this.doc.setTextColor(this.brandColors.text.r, this.brandColors.text.g, this.brandColors.text.b);
    
    const summaryLines = this.doc.splitTextToSize(data.summary, 170);
    this.doc.text(summaryLines, 20, yPosition);
    yPosition += summaryLines.length * 7;
    
    // Key insights section
    if (data.conversationInsights && data.conversationInsights.length > 0) {
      yPosition += 15;
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Key Conversation Insights', 20, yPosition);
      
      yPosition += 10;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      
      data.conversationInsights.forEach((insight, index) => {
        if (yPosition > 250) {
          this.doc.addPage();
          this.addPageHeader('Executive Summary (continued)');
          yPosition = 60;
        }
        
        this.doc.text(`• ${insight}`, 25, yPosition);
        yPosition += 8;
      });
    }
  }

  private addCapabilitiesPage(data: PDFReportData) {
    this.addPageHeader('AI Capabilities Demonstrated');
    
    let yPosition = 60;
    const capabilitiesPerRow = 2;
    const boxWidth = 80;
    const boxHeight = 40;
    const spacing = 10;
    
    data.capabilitiesShown.forEach((capability, index) => {
      const row = Math.floor(index / capabilitiesPerRow);
      const col = index % capabilitiesPerRow;
      
      const x = 20 + col * (boxWidth + spacing);
      const y = yPosition + row * (boxHeight + spacing);
      
      // Capability box
      this.doc.setFillColor(245, 247, 250);
      this.doc.setDrawColor(this.brandColors.primary.r, this.brandColors.primary.g, this.brandColors.primary.b);
      this.doc.roundedRect(x, y, boxWidth, boxHeight, 5, 5, 'FD');
      
      // Checkmark
      this.doc.setTextColor(this.brandColors.accent.r, this.brandColors.accent.g, this.brandColors.accent.b);
      this.doc.setFontSize(16);
      this.doc.text('✓', x + 5, y + 15);
      
      // Capability text
      this.doc.setTextColor(this.brandColors.text.r, this.brandColors.text.g, this.brandColors.text.b);
      this.doc.setFontSize(10);
      const capabilityLines = this.doc.splitTextToSize(capability, boxWidth - 20);
      this.doc.text(capabilityLines, x + 15, y + 15);
    });
  }

  private addRecommendationsPage(data: PDFReportData) {
    this.addPageHeader('Recommended Solutions');
    
    let yPosition = 60;
    
    // Score-based recommendation
    const scoreRecommendation = this.getScoreBasedRecommendation(data.leadScore);
    
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'bold');
    this.doc.setTextColor(this.brandColors.primary.r, this.brandColors.primary.g, this.brandColors.primary.b);
    this.doc.text(scoreRecommendation.title, 20, yPosition);
    
    yPosition += 10;
    this.doc.setFontSize(12);
    this.doc.setFont(undefined, 'normal');
    this.doc.setTextColor(this.brandColors.text.r, this.brandColors.text.g, this.brandColors.text.b);
    const recommendationLines = this.doc.splitTextToSize(scoreRecommendation.description, 170);
    this.doc.text(recommendationLines, 20, yPosition);
    yPosition += recommendationLines.length * 7 + 15;
    
    // Specific recommendations
    if (data.recommendedSolutions && data.recommendedSolutions.length > 0) {
      this.doc.setFontSize(14);
      this.doc.setFont(undefined, 'bold');
      this.doc.text('Specific Solutions for Your Business:', 20, yPosition);
      
      yPosition += 10;
      this.doc.setFontSize(12);
      this.doc.setFont(undefined, 'normal');
      
      data.recommendedSolutions.forEach((solution) => {
        if (yPosition > 250) {
          this.doc.addPage();
          this.addPageHeader('Recommended Solutions (continued)');
          yPosition = 60;
        }
        
        this.doc.text(`• ${solution}`, 25, yPosition);
        yPosition += 8;
      });
    }
  }

  private addNextStepsPage(data: PDFReportData) {
    this.addPageHeader('Next Steps');
    
    let yPosition = 60;
    
    // Implementation roadmap
    if (data.implementationRoadmap && data.implementationRoadmap.length > 0) {
      this.doc.setFontSize(14);
      this.doc.setFont(undefined, 'bold');
      this.doc.text('Implementation Roadmap:', 20, yPosition);
      
      yPosition += 10;
      this.doc.setFontSize(12);
      this.doc.setFont(undefined, 'normal');
      
      data.implementationRoadmap.forEach((step, index) => {
        this.doc.setFillColor(this.brandColors.accent.r, this.brandColors.accent.g, this.brandColors.accent.b);
        this.doc.circle(25, yPosition - 2, 3, 'F');
        this.doc.text(`${index + 1}. ${step}`, 35, yPosition);
        yPosition += 10;
      });
    } else {
      // Default roadmap
      const defaultSteps = [
        'Schedule your free 30-minute strategy session',
        'Receive custom AI implementation roadmap',
        'Choose between training workshop or consulting engagement',
        'Begin your AI transformation journey'
      ];
      
      this.doc.setFontSize(14);
      this.doc.setFont(undefined, 'bold');
      this.doc.text('Your AI Journey Starts Here:', 20, yPosition);
      
      yPosition += 10;
      this.doc.setFontSize(12);
      this.doc.setFont(undefined, 'normal');
      
      defaultSteps.forEach((step, index) => {
        this.doc.setFillColor(this.brandColors.accent.r, this.brandColors.accent.g, this.brandColors.accent.b);
        this.doc.circle(25, yPosition - 2, 3, 'F');
        this.doc.text(`${index + 1}. ${step}`, 35, yPosition);
        yPosition += 10;
      });
    }
    
    // Contact CTA
    yPosition += 20;
    this.doc.setFillColor(this.brandColors.primary.r, this.brandColors.primary.g, this.brandColors.primary.b);
    this.doc.roundedRect(20, yPosition, 170, 50, 5, 5, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont(undefined, 'bold');
    this.doc.text('Ready to Transform Your Business with AI?', 105, yPosition + 20, { align: 'center' });
    
    this.doc.setFontSize(14);
    this.doc.setFont(undefined, 'normal');
    this.doc.text('Book Your Free Consultation Today', 105, yPosition + 35, { align: 'center' });
    
    // Contact information
    yPosition += 70;
    this.doc.setTextColor(this.brandColors.text.r, this.brandColors.text.g, this.brandColors.text.b);
    this.doc.setFontSize(12);
    this.doc.text('Contact F.B/c AI Consulting:', 20, yPosition);
    
    yPosition += 10;
    this.doc.setFont(undefined, 'normal');
    this.doc.text('Farzad Bayat, Founder', 20, yPosition);
    yPosition += 7;
    this.doc.text('Email: bayatfarzad@gmail.com', 20, yPosition);
    yPosition += 7;
    this.doc.text('Book Consultation: [Calendar Link]', 20, yPosition);
    
    // Footer note
    this.doc.setFontSize(9);
    this.doc.setTextColor(this.brandColors.lightText.r, this.brandColors.lightText.g, this.brandColors.lightText.b);
    this.doc.text('This report was generated using AI technology that F.B/c can implement for your business.', 105, 280, { align: 'center' });
  }

  private addPageHeader(title: string) {
    const { primary } = this.brandColors;
    
    // Header line
    this.doc.setDrawColor(primary.r, primary.g, primary.b);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 40, 190, 40);
    
    // Title
    this.doc.setFontSize(24);
    this.doc.setFont(undefined, 'bold');
    this.doc.setTextColor(primary.r, primary.g, primary.b);
    this.doc.text(title, 20, 30);
    
    // F.B/c branding
    this.doc.setFontSize(10);
    this.doc.setFont(undefined, 'normal');
    this.doc.setTextColor(this.brandColors.lightText.r, this.brandColors.lightText.g, this.brandColors.lightText.b);
    this.doc.text('F.B/c AI Consulting', 190, 30, { align: 'right' });
  }

  private getScoreBasedRecommendation(score: number): { title: string; description: string } {
    if (score >= 70) {
      return {
        title: '🚀 Custom AI Implementation - Fast Track',
        description: 'Your high readiness score indicates you\'re prepared for immediate AI implementation. We recommend starting with a custom AI solution tailored to your specific business needs. This approach will deliver the fastest ROI and competitive advantage.'
      };
    } else if (score >= 40) {
      return {
        title: '📊 Strategic AI Consultation',
        description: 'Your score shows solid potential for AI adoption. We recommend beginning with a strategic consultation to identify quick wins and develop a phased implementation plan that aligns with your business goals and resources.'
      };
    } else {
      return {
        title: '🎓 AI Workshop for Teams',
        description: 'Based on your current readiness level, we recommend starting with our hands-on AI workshop. This will build your team\'s AI literacy and identify the best opportunities for initial AI projects in your organization.'
      };
    }
  }
}