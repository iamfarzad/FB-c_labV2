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
 * Generates HTML content for the PDF with modern design
 */
function generateHtmlContent(data: SummaryData): string {
  const { leadInfo, conversationHistory, leadResearch } = data;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>F.B/c AI Consulting - ${leadInfo.name} Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      font-size: 10pt;
      background: #f9fafb;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
    }
    
    /* Header Section */
    header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
      animation: pulse 4s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.3; }
    }
    
    header h1 {
      font-size: 32pt;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
    }
    
    header .subtitle {
      font-size: 14pt;
      font-weight: 400;
      opacity: 0.9;
      position: relative;
      z-index: 1;
    }
    
    header .logo {
      position: absolute;
      top: 20px;
      right: 20px;
      opacity: 0.2;
    }
    
    /* Content Sections */
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section h2 {
      font-size: 18pt;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 20px;
      position: relative;
      padding-bottom: 10px;
    }
    
    .section h2::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #f59e0b 0%, #f97316 100%);
      border-radius: 2px;
    }
    
    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .info-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
    }
    
    .info-card strong {
      display: block;
      font-size: 9pt;
      font-weight: 500;
      color: #64748b;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .info-card span {
      font-size: 11pt;
      color: #1e293b;
      font-weight: 500;
    }
    
    /* Score Display */
    .score-container {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #f8fafc;
      padding: 16px 24px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .score-value {
      font-size: 24pt;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    
    .score-value.high { color: #059669; }
    .score-value.medium { color: #f59e0b; }
    .score-value.low { color: #dc2626; }
    
    .score-label {
      font-size: 10pt;
      color: #64748b;
    }
    
    .score-bar {
      width: 120px;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    
    .score-bar-fill {
      height: 100%;
      transition: width 0.5s ease;
      border-radius: 4px;
    }
    
    .score-bar-fill.high { background: linear-gradient(90deg, #059669 0%, #10b981 100%); }
    .score-bar-fill.medium { background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%); }
    .score-bar-fill.low { background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%); }
    
    /* Conversation Items */
    .conversation-container {
      background: #f8fafc;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
    }
    
    .conversation-item {
      margin-bottom: 16px;
      padding: 16px;
      border-radius: 8px;
      position: relative;
      transition: transform 0.2s ease;
    }
    
    .conversation-item.user {
      background: white;
      border: 1px solid #e2e8f0;
      margin-left: 40px;
    }
    
    .conversation-item.assistant {
      background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
      border: 1px solid #fcd34d;
      margin-right: 40px;
    }
    
    .conversation-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 9pt;
      color: #64748b;
      margin-bottom: 8px;
    }
    
    .conversation-content {
      font-size: 10pt;
      color: #1e293b;
      line-height: 1.5;
    }
    
    /* Insights Section */
    .insights-container {
      background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
      border-radius: 12px;
      padding: 32px;
      border: 1px solid #fcd34d;
    }
    
    .insights-container h3 {
      font-size: 14pt;
      font-weight: 600;
      color: #92400e;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .insights-container p,
    .insights-container li {
      color: #78350f;
      line-height: 1.8;
    }
    
    .insights-container ul {
      list-style: none;
      padding-left: 0;
    }
    
    .insights-container li {
      position: relative;
      padding-left: 24px;
      margin-bottom: 8px;
    }
    
    .insights-container li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #f59e0b;
      font-weight: 600;
    }
    
    /* Summary Text */
    .summary-text {
      background: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-style: italic;
      color: #475569;
    }
    
    /* Footer */
    footer {
      background: #1e293b;
      color: white;
      padding: 32px 40px;
      text-align: center;
    }
    
    footer p {
      font-size: 10pt;
      opacity: 0.9;
      line-height: 1.8;
    }
    
    footer a {
      color: #fbbf24;
      text-decoration: none;
    }
    
    /* Watermark */
    .watermark {
      position: fixed;
      bottom: 50%;
      right: 50%;
      transform: translate(50%, 50%) rotate(-45deg);
      opacity: 0.05;
      z-index: -1;
      pointer-events: none;
      font-family: 'Inter', sans-serif;
      font-size: 120px;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: -0.02em;
    }
    
    /* Page Break */
    .page-break {
      page-break-before: always;
    }
    
    /* Print Styles */
    @media print {
      body {
        background: white;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <!-- Watermark -->
  <div class="watermark">
    F.B/c
  </div>
  
  <div class="container">
    <header>
      <h1>F.B/c AI Consulting</h1>
      <p class="subtitle">AI-Powered Lead Generation & Consulting Report</p>
    </header>
    
    <div class="content">
      <div class="section">
        <h2>Lead Information</h2>
        <div class="info-grid">
          <div class="info-card">
            <strong>Name</strong>
            <span>${leadInfo.name}</span>
          </div>
          <div class="info-card">
            <strong>Email</strong>
            <span>${leadInfo.email}</span>
          </div>
          ${leadInfo.company ? `
          <div class="info-card">
            <strong>Company</strong>
            <span>${leadInfo.company}</span>
          </div>` : ''}
          ${leadInfo.role ? `
          <div class="info-card">
            <strong>Role</strong>
            <span>${leadInfo.role}</span>
          </div>` : ''}
          <div class="info-card">
            <strong>Session ID</strong>
            <span>${data.sessionId}</span>
          </div>
          <div class="info-card">
            <strong>Report Date</strong>
            <span>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      ${leadResearch?.lead_score ? `
      <div class="section">
        <h2>Lead Qualification Score</h2>
        <div class="score-container">
          <div>
            <div class="score-value ${leadResearch.lead_score > 70 ? 'high' : leadResearch.lead_score > 40 ? 'medium' : 'low'}">
              ${leadResearch.lead_score}
            </div>
            <div class="score-label">out of 100</div>
          </div>
          <div class="score-bar">
            <div class="score-bar-fill ${leadResearch.lead_score > 70 ? 'high' : leadResearch.lead_score > 40 ? 'medium' : 'low'}" 
                 style="width: ${leadResearch.lead_score}%"></div>
          </div>
        </div>
      </div>
      ` : ''}

      ${leadResearch?.conversation_summary ? `
      <div class="section">
        <h2>Executive Summary</h2>
        <div class="summary-text">
          ${leadResearch.conversation_summary}
        </div>
      </div>
      ` : ''}

      ${leadResearch?.consultant_brief ? `
      <div class="section">
        <h2>Consultant Brief</h2>
        <p style="line-height: 1.8; color: #475569;">${leadResearch.consultant_brief}</p>
      </div>
      ` : ''}

      ${leadResearch?.ai_capabilities_shown ? `
      <div class="section">
        <h2>AI Capabilities Identified</h2>
        <p style="line-height: 1.8; color: #475569;">${leadResearch.ai_capabilities_shown}</p>
      </div>
      ` : ''}

      ${conversationHistory.length > 0 ? `
      <div class="section">
        <h2>Conversation Highlights</h2>
        <div class="conversation-container">
          ${conversationHistory.slice(-5).map(message => `
          <div class="conversation-item ${message.role}">
            <div class="conversation-header">
              ${message.role === 'user' ? '👤 Lead' : '🤖 F.B/c AI'} • ${new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div class="conversation-content">
              ${message.content.substring(0, 150)}${message.content.length > 150 ? '...' : ''}
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <div class="section">
        <h2>Strategic Recommendations</h2>
        <div class="insights-container">
          <h3>📊 Lead Qualification Status</h3>
          <p><strong>${leadResearch?.lead_score && leadResearch.lead_score > 70 ? 'High-Value Prospect' : leadResearch?.lead_score && leadResearch.lead_score > 40 ? 'Qualified Prospect' : 'Requires Further Qualification'}</strong></p>
          <p style="margin-top: 8px; font-size: 9pt;">${leadResearch?.lead_score && leadResearch.lead_score > 70 ? 'This lead shows strong potential for immediate engagement and conversion.' : leadResearch?.lead_score && leadResearch.lead_score > 40 ? 'This lead has good potential and should be nurtured through targeted follow-up.' : 'Additional discovery conversations are recommended to better understand needs.'}</p>
          
          <h3 style="margin-top: 24px;">🎯 Recommended Next Steps</h3>
          <ul>
            <li>Schedule a personalized AI solution demonstration within 24 hours</li>
            <li>Send tailored case studies relevant to their industry</li>
            <li>Provide ROI calculations based on their specific use case</li>
            <li>Connect with technical team for deep-dive consultation</li>
            <li>Share testimonials from similar successful implementations</li>
          </ul>
          
          <h3 style="margin-top: 24px;">⏰ Follow-up Timeline</h3>
          <p><strong>Immediate (0-24 hours):</strong> Send thank you email with session summary</p>
          <p><strong>Short-term (24-48 hours):</strong> Schedule follow-up consultation call</p>
          <p><strong>Mid-term (3-7 days):</strong> Share customized proposal and pricing</p>
        </div>
      </div>
    </div>
    
    <footer>
      <p>
        <strong>Farzad Bayat</strong> - AI Consulting Specialist<br>
        📧 bayatfarzad@gmail.com | 📱 +47 123 456 78 | 🌐 <a href="https://www.farzadbayat.com">www.farzadbayat.com</a>
      </p>
    </footer>
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
