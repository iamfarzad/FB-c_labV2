import type { Message, CompanyInfo } from '../types';

export function calculateLeadScore(conversationHistory: Message[], userInfo: { name?: string; email?: string; companyInfo?: CompanyInfo; [key: string]: any }): number {
  let score = 0;
  if (!userInfo || !userInfo.email) return 0;

  const domain = userInfo.email?.split('@').pop()?.toLowerCase() || '';
  if (!['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'aol.com'].includes(domain)) {
    score += 20;
  }

  if (conversationHistory && conversationHistory.length > 8) {
    score += 10;
  }

  const conversationText = conversationHistory.map(m => m.text).join(' ').toLowerCase();
  if (conversationText.includes('automation') ||
      conversationText.includes('efficiency') ||
      conversationText.includes('ai') ||
      conversationText.includes('team') ||
      conversationText.includes('process')) {
    score += 15;
  }

  if (conversationText.includes('cost') ||
      conversationText.includes('price') ||
      conversationText.includes('when') ||
      conversationText.includes('timeline') ||
      conversationText.includes('budget')) {
    score += 25;
  }

  const capabilityKeywords = ['image', 'video', 'document', 'analyze', 'generate', 'code', 'website', 'search'];
  const capabilityMentions = capabilityKeywords.filter(keyword =>
      conversationText.includes(keyword)
    ).length;
  if (capabilityMentions >= 2) {
    score += 20;
  }
  return Math.min(score, 100);
}

export function extractCapabilitiesShown(conversationHistory: Message[]): string[] {
  const capabilities: Set<string> = new Set();
  const conversationText = conversationHistory.map(m => m.text).join(' ').toLowerCase();

  if (conversationText.includes('search') || conversationText.includes('grounding') || conversationText.includes('find information')) {
    capabilities.add('Google Search Integration');
  }
  if (conversationText.includes('voice') || conversationText.includes('audio') || conversationText.includes('speak')) {
    capabilities.add('Voice Generation');
  }
  if (conversationText.includes('image') || conversationText.includes('visual') || conversationText.includes('picture')) {
    capabilities.add('Image Analysis/Generation');
  }
  if (conversationText.includes('video') || conversationText.includes('youtube')) {
    capabilities.add('Video Understanding');
  }
  if (conversationText.includes('document') || conversationText.includes('pdf') || conversationText.includes('file')) {
    capabilities.add('Document Processing');
  }
  if (conversationText.includes('code') || conversationText.includes('calculation') || conversationText.includes('script')) {
    capabilities.add('Code Execution');
  }
  if (conversationText.includes('website') || conversationText.includes('url') || conversationText.includes('web page')) {
    capabilities.add('URL Analysis');
  }
  return Array.from(capabilities);
}

export function generateEmailContent(
    name: string,
    email: string,
    summary: string,
    leadScore?: number,
    companyName?: string
): string {
  const greeting = `Hi ${name},`;
  const intro = `Thank you for experiencing F.B/c's AI showcase! I'm excited about the potential I see for ${companyName || 'your business'}.`;
  const scoreInfo = leadScore ? `Your AI Readiness Score during the showcase was: ${leadScore}/100.\n` : '';
  const summarySection = `**Your Personalized AI Consultation Summary**\n\n${summary}`;
  const nextStepsTitle = "\n**What's Next?**";
  const nextStepsBody = "I'd love to dive deeper into how we can implement these AI solutions in your business.\n\n🎯 **For Team Training**: Our interactive AI workshops get your employees up to speed with practical, hands-on learning.\n🚀 **For Custom Implementation**: We build and deploy AI solutions tailored to your specific needs.";
  const bookingLink = "📅 **Book Your Free Strategy Session**\nLet's discuss your specific requirements and create a custom roadmap for your success: [Your Booking Calendar Link Here - e.g., Calendly]";
  const whyFbc = "\n**Why F.B/c?**\n- Proven AI implementation experience\n- Industry-specific expertise\n- Hands-on training approach\n- Measurable ROI focus";
  const regards = "\nBest regards,\nFarzad Bayat\nFounder, F.B/c AI Consulting\nbayatfarzad@gmail.com (Replace with actual contact)";
  const psMessage = "\nP.S. The AI capabilities you experienced today are just the beginning. Imagine what your team could accomplish with these tools at their disposal! 🚀";
  const footer = "\n---\nThis summary was generated using the same AI technology we can implement for your business.";

  return `${greeting}\n\n${intro}\n${scoreInfo}\n${summarySection}\n\n${nextStepsTitle}\n${nextStepsBody}\n\n${bookingLink}\n${whyFbc}\n${regards}\n${psMessage}\n${footer}`;
}
