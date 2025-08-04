import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface SummaryData {
  leadInfo: {
    name: string;
    email: string;
    company?: string;
    role?: string;
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  leadResearch?: {
    conversation_summary?: string;
    consultant_brief?: string;
    lead_score?: number;
    ai_capabilities_shown?: string;
  };
  sessionId: string;
}

/**
 * Renders a text summary into a PDF with F.B/c branding and contact info.
 */
export function renderSummaryPdf(
  summaryData: SummaryData,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // 1. Create the document with minimal configuration to avoid font issues
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        autoFirstPage: true
      });

      // 2. Pipe to a file
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // 3. Header with F.B/c branding
      const fbcLogoPath = './public/pdf_watermark_logo/fb_bold_3dlogo_base64.svg';
      
      // Check if F.B/c logo exists, otherwise use text-only header
      if (fs.existsSync(fbcLogoPath)) {
        doc.image(fbcLogoPath, 50, 40, { width: 80 });
        doc
          .fontSize(20)
          .fillColor('#1f2937')
          .text('F.B/c AI Consulting', 140, 55, { align: 'left' });
      } else {
        // F.B/c text-only header with proper styling
        doc
          .fontSize(24)
          .fillColor('#1f2937')
          .text('F.B', 50, 50, { align: 'left' });
        doc
          .fontSize(16)
          .fillColor('#f59e0b')
          .text('/c', 85, 55, { align: 'left' });
        doc
          .fontSize(18)
          .fillColor('#1f2937')
          .text(' AI Consulting', 105, 55, { align: 'left' });
      }

      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text('AI-Powered Lead Generation & Consulting', 50, 80, { align: 'left' })
        .moveDown(2);

      // 4. Lead Information Section
      doc
        .fontSize(14)
        .fillColor('#1f2937')
        .text('Lead Information', 50, 120)
        .moveDown(0.5);

      doc
        .fontSize(11)
        .fillColor('#374151')
        .text(`Name: ${summaryData.leadInfo.name}`, 50)
        .text(`Email: ${summaryData.leadInfo.email}`, 50);
      
      if (summaryData.leadInfo.company) {
        doc.text(`Company: ${summaryData.leadInfo.company}`, 50);
      }
      if (summaryData.leadInfo.role) {
        doc.text(`Role: ${summaryData.leadInfo.role}`, 50);
      }
      
      doc.text(`Session ID: ${summaryData.sessionId}`, 50);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 50);
      doc.moveDown(1);

      // 5. Lead Research Summary
      if (summaryData.leadResearch?.conversation_summary) {
        doc
          .fontSize(14)
          .fillColor('#1f2937')
          .text('Lead Research Summary', 50)
          .moveDown(0.5);

        doc
          .fontSize(11)
          .fillColor('#374151')
          .text(summaryData.leadResearch.conversation_summary, {
            align: 'left',
            lineGap: 4,
            width: doc.page.width - 100
          })
          .moveDown(1);
      }

      // 6. Consultant Brief
      if (summaryData.leadResearch?.consultant_brief) {
        doc
          .fontSize(14)
          .fillColor('#1f2937')
          .text('Consultant Brief', 50)
          .moveDown(0.5);

        doc
          .fontSize(11)
          .fillColor('#374151')
          .text(summaryData.leadResearch.consultant_brief, {
            align: 'left',
            lineGap: 4,
            width: doc.page.width - 100
          })
          .moveDown(1);
      }

      // 7. Lead Score
      if (summaryData.leadResearch?.lead_score) {
        doc
          .fontSize(14)
          .fillColor('#1f2937')
          .text('Lead Score', 50)
          .moveDown(0.5);

        const score = summaryData.leadResearch.lead_score;
        const scoreColor = score > 70 ? '#059669' : score > 40 ? '#d97706' : '#dc2626';
        
        doc
          .fontSize(12)
          .fillColor(scoreColor)
          .text(`${score}/100`, 50)
          .moveDown(1);
      }

      // 8. AI Capabilities Identified
      if (summaryData.leadResearch?.ai_capabilities_shown) {
        doc
          .fontSize(14)
          .fillColor('#1f2937')
          .text('AI Capabilities Identified', 50)
          .moveDown(0.5);

        doc
          .fontSize(11)
          .fillColor('#374151')
          .text(summaryData.leadResearch.ai_capabilities_shown, {
            align: 'left',
            lineGap: 4,
            width: doc.page.width - 100
          })
          .moveDown(1);
      }

      // 9. Conversation History (abbreviated)
      if (summaryData.conversationHistory.length > 0) {
        doc
          .fontSize(14)
          .fillColor('#1f2937')
          .text('Conversation Highlights', 50)
          .moveDown(0.5);

        // Show only the last 3 exchanges to keep PDF manageable
        const recentHistory = summaryData.conversationHistory.slice(-6);
        
        recentHistory.forEach((message, index) => {
          const role = message.role === 'user' ? '👤 User' : '🤖 F.B/c AI';
          const timestamp = new Date(message.timestamp).toLocaleString();
          
          doc
            .fontSize(10)
            .fillColor('#6b7280')
            .text(`${role} - ${timestamp}`, 50)
            .moveDown(0.2);

          doc
            .fontSize(10)
            .fillColor('#374151')
            .text(message.content.substring(0, 200) + (message.content.length > 200 ? '...' : ''), {
              align: 'left',
              lineGap: 3,
              width: doc.page.width - 100
            })
            .moveDown(0.5);
        });
      }

      // 10. Key Insights & Recommendations
      doc.addPage();
      doc
        .fontSize(16)
        .fillColor('#1f2937')
        .text('Key Insights & Recommendations', 50, 50)
        .moveDown(1);

      const qualification = summaryData.leadResearch?.lead_score && summaryData.leadResearch.lead_score > 70 
        ? 'High-value prospect' 
        : summaryData.leadResearch?.lead_score && summaryData.leadResearch.lead_score > 40 
        ? 'Qualified prospect' 
        : 'Needs further qualification';

      doc
        .fontSize(12)
        .fillColor('#1f2937')
        .text('1. Lead Qualification:', 50)
        .moveDown(0.2);

      doc
        .fontSize(11)
        .fillColor('#374151')
        .text(qualification, 70)
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#1f2937')
        .text('2. Pain Points Identified:', 50)
        .moveDown(0.2);

      doc
        .fontSize(11)
        .fillColor('#374151')
        .text(summaryData.leadResearch?.conversation_summary ? 'See conversation summary above' : 'Continue discovery in next interaction', 70)
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#1f2937')
        .text('3. Recommended Next Steps:', 50)
        .moveDown(0.2);

      const nextSteps = [
        'Schedule follow-up consultation',
        'Send personalized AI solution proposal',
        'Share relevant case studies and testimonials',
        'Schedule technical demonstration'
      ];

      nextSteps.forEach((step, index) => {
        doc
          .fontSize(11)
          .fillColor('#374151')
          .text(`• ${step}`, 70);
      });

      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#1f2937')
        .text('4. Follow-up Timeline:', 50)
        .moveDown(0.2);

      doc
        .fontSize(11)
        .fillColor('#374151')
        .text('Within 24-48 hours', 70)
        .moveDown(2);

      // 11. Footer on every page
      const addFooter = () => {
        const bottom = doc.page.height - 50;
        doc
          .fontSize(9)
          .fillColor('#6b7280')
          .text(
            'Farzad Bayat | bayatfarzad@gmail.com | +47 123 456 78 | www.farzadbayat.com',
            50,
            bottom,
            { align: 'center', width: doc.page.width - 100 }
          );
      };

      // Add footer to all pages
      doc.on('pageAdded', addFooter);
      addFooter(); // Add to first page

      // 12. Finalize
      writeStream.on('finish', () => {
        resolve();
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate a temporary PDF file path
 */
export function generatePdfPath(sessionId: string, leadName: string): string {
  const sanitizedName = leadName.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = new Date().toISOString().split('T')[0];
  return `/tmp/FB-c_Summary_${sanitizedName}_${timestamp}_${sessionId}.pdf`;
}

/**
 * Convert markdown-like text to plain text for PDF
 */
export function sanitizeTextForPdf(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '') // Remove markdown headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
    .trim();
}
