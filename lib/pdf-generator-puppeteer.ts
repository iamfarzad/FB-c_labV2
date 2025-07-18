import puppeteer from 'puppeteer';
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
 * Generates a PDF summary using Puppeteer for better reliability
 */
export async function generatePdfWithPuppeteer(
  summaryData: SummaryData,
  outputPath: string
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Generate HTML content
    const htmlContent = generateHtmlContent(summaryData);
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    });

  } finally {
    await browser.close();
  }
}

/**
 * Generates HTML content for the PDF
 */
function generateHtmlContent(data: SummaryData): string {
  const { leadInfo, conversationHistory, leadResearch } = data;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>F.B/c AI Consulting - Summary for ${leadInfo.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1f2937;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1f2937;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #6b7280;
      margin: 10px 0 0 0;
      font-size: 16px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #1f2937;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #1f2937;
    }
    .info-item strong {
      color: #1f2937;
    }
    .score {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      color: white;
    }
    .score.high { background: #059669; }
    .score.medium { background: #d97706; }
    .score.low { background: #dc2626; }
    .conversation-item {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .conversation-item.user {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
    }
    .conversation-item.assistant {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
    }
    .conversation-header {
      font-weight: bold;
      margin-bottom: 10px;
      color: #374151;
    }
    .conversation-content {
      color: #6b7280;
    }
    .recommendations {
      background: #fef3c7;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }
    .recommendations h3 {
      color: #92400e;
      margin-top: 0;
    }
    .recommendations ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    
    /* Watermark */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      opacity: 0.3;
      z-index: -1;
      pointer-events: none;
    }
    
    .watermark svg {
      width: 400px;
      height: 400px;
    }
    
    /* Ensure content is above watermark */
    .header, .section, .footer {
      position: relative;
      z-index: 1;
    }
  </style>
</head>
<body>
  <!-- Watermark -->
  <div class="watermark">
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff5b04;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ff8a50;stop-opacity:1" />
        </linearGradient>
      </defs>
      <g transform="translate(200,200)">
        <!-- F.B/c Logo Elements -->
        <text x="0" y="-80" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="url(#grad1)">F.B</text>
        <text x="0" y="-20" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="url(#grad1)">/c</text>
        <circle cx="0" cy="20" r="15" fill="none" stroke="url(#grad1)" stroke-width="3"/>
        <text x="0" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="url(#grad1)">AI</text>
      </g>
    </svg>
  </div>
  
  <div class="header">
    <h1>F.B/c AI Consulting</h1>
    <p>AI-Powered Lead Generation & Consulting</p>
  </div>

  <div class="section">
    <h2>Lead Information</h2>
    <div class="info-grid">
      <div class="info-item">
        <strong>Name:</strong> ${leadInfo.name}
      </div>
      <div class="info-item">
        <strong>Email:</strong> ${leadInfo.email}
      </div>
      ${leadInfo.company ? `<div class="info-item"><strong>Company:</strong> ${leadInfo.company}</div>` : ''}
      ${leadInfo.role ? `<div class="info-item"><strong>Role:</strong> ${leadInfo.role}</div>` : ''}
      <div class="info-item">
        <strong>Session ID:</strong> ${data.sessionId}
      </div>
      <div class="info-item">
        <strong>Generated:</strong> ${new Date().toLocaleString()}
      </div>
    </div>
  </div>

  ${leadResearch?.conversation_summary ? `
  <div class="section">
    <h2>Lead Research Summary</h2>
    <p>${leadResearch.conversation_summary}</p>
  </div>
  ` : ''}

  ${leadResearch?.consultant_brief ? `
  <div class="section">
    <h2>Consultant Brief</h2>
    <p>${leadResearch.consultant_brief}</p>
  </div>
  ` : ''}

  ${leadResearch?.lead_score ? `
  <div class="section">
    <h2>Lead Score</h2>
    <span class="score ${leadResearch.lead_score > 70 ? 'high' : leadResearch.lead_score > 40 ? 'medium' : 'low'}">
      ${leadResearch.lead_score}/100
    </span>
  </div>
  ` : ''}

  ${leadResearch?.ai_capabilities_shown ? `
  <div class="section">
    <h2>AI Capabilities Identified</h2>
    <p>${leadResearch.ai_capabilities_shown}</p>
  </div>
  ` : ''}

  ${conversationHistory.length > 0 ? `
  <div class="section">
    <h2>Conversation Highlights</h2>
    ${conversationHistory.slice(-6).map(message => `
      <div class="conversation-item ${message.role}">
        <div class="conversation-header">
          ${message.role === 'user' ? '👤 User' : '🤖 F.B/c AI'} - ${new Date(message.timestamp).toLocaleString()}
        </div>
        <div class="conversation-content">
          ${message.content.substring(0, 200)}${message.content.length > 200 ? '...' : ''}
        </div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="section">
    <h2>Key Insights & Recommendations</h2>
    <div class="recommendations">
      <h3>Lead Qualification</h3>
      <p>${leadResearch?.lead_score && leadResearch.lead_score > 70 ? 'High-value prospect' : leadResearch?.lead_score && leadResearch.lead_score > 40 ? 'Qualified prospect' : 'Needs further qualification'}</p>
      
      <h3>Pain Points Identified</h3>
      <p>${leadResearch?.conversation_summary ? 'See conversation summary above' : 'Continue discovery in next interaction'}</p>
      
      <h3>Recommended Next Steps</h3>
      <ul>
        <li>Schedule follow-up consultation</li>
        <li>Send personalized AI solution proposal</li>
        <li>Share relevant case studies and testimonials</li>
        <li>Schedule technical demonstration</li>
      </ul>
      
      <h3>Follow-up Timeline</h3>
      <p>Within 24-48 hours</p>
    </div>
  </div>

  <div class="footer">
    Farzad Bayat | bayatfarzad@gmail.com | +47 123 456 78 | www.farzadbayat.com
  </div>
</body>
</html>
  `;
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