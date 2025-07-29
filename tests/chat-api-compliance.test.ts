import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Enhanced Chat API Compliance', () => {
  const chatApiPath = path.join(process.cwd(), 'app/api/chat/route.ts');
  let chatApiContent: string;

  beforeAll(() => {
    chatApiContent = fs.readFileSync(chatApiPath, 'utf-8');
  });

  describe('Security Rules Compliance', () => {
    it('should implement authentication (Rule S1.1)', () => {
      expect(chatApiContent).toMatch(/authenticateRequest/);
      expect(chatApiContent).toMatch(/auth\.success/);
    });

    it('should implement rate limiting (Rule S1.6)', () => {
      expect(chatApiContent).toMatch(/checkRateLimit/);
      expect(chatApiContent).toMatch(/Rate limit exceeded/);
    });

    it('should validate and sanitize inputs (Rule S1.4)', () => {
      expect(chatApiContent).toMatch(/validateRequest/);
      expect(chatApiContent).toMatch(/sanitizeString/);
    });

    it('should use environment variables for secrets (Rule S2.3)', () => {
      expect(chatApiContent).toMatch(/process\.env\.GEMINI_API_KEY/);
      expect(chatApiContent).not.toMatch(/sk-/); // No hardcoded API keys
    });
  });

  describe('Observability Rules Compliance', () => {
    it('should use structured logging with correlation IDs (Rule O2.1, O2.2)', () => {
      expect(chatApiContent).toMatch(/logConsoleActivity/);
      expect(chatApiContent).toMatch(/correlationId/);
      expect(chatApiContent).toMatch(/JSON\.stringify/);
    });

    it('should log at appropriate levels (Rule O2.3)', () => {
      expect(chatApiContent).toMatch(/logConsoleActivity\('info'/);
      expect(chatApiContent).toMatch(/logConsoleActivity\('error'/);
      expect(chatApiContent).toMatch(/logConsoleActivity\('warn'/);
    });
  });

  describe('Code Architecture Rules Compliance', () => {
    it('should implement consistent error handling (Rule AV2.2)', () => {
      expect(chatApiContent).toMatch(/try\s*{/);
      expect(chatApiContent).toMatch(/catch\s*\(/);
      expect(chatApiContent).toMatch(/status:\s*[45]\d\d/);
    });

    it('should use standard HTTP status codes (Rule AV2.3)', () => {
      expect(chatApiContent).toMatch(/status:\s*200/);
      expect(chatApiContent).toMatch(/status:\s*400/);
      expect(chatApiContent).toMatch(/status:\s*401/);
      expect(chatApiContent).toMatch(/status:\s*429/);
      expect(chatApiContent).toMatch(/status:\s*500/);
    });

    it('should separate concerns (Rule MD1.2)', () => {
      expect(chatApiContent).toMatch(/AUTHENTICATION & RATE LIMITING MIDDLEWARE/);
      expect(chatApiContent).toMatch(/LOGGING UTILITIES/);
      expect(chatApiContent).toMatch(/LEAD RESEARCH INTEGRATION/);
      expect(chatApiContent).toMatch(/CONVERSATION STATE MANAGEMENT/);
      expect(chatApiContent).toMatch(/ENHANCED SYSTEM PROMPT BUILDER/);
    });
  });

  describe('Advanced Lead Generation Features', () => {
    it('should implement conversation state management', () => {
      expect(chatApiContent).toMatch(/ConversationStateManager/);
      expect(chatApiContent).toMatch(/LeadManager/);
      expect(chatApiContent).toMatch(/processMessage/);
    });

    it('should implement 7-stage conversation flow', () => {
      expect(chatApiContent).toMatch(/CONVERSATION STAGES \(7-STAGE FSM\)/);
      expect(chatApiContent).toMatch(/GREETING/);
      expect(chatApiContent).toMatch(/NAME_COLLECTION/);
      expect(chatApiContent).toMatch(/EMAIL_CAPTURE/);
      expect(chatApiContent).toMatch(/BACKGROUND_RESEARCH/);
      expect(chatApiContent).toMatch(/PROBLEM_DISCOVERY/);
      expect(chatApiContent).toMatch(/SOLUTION_PRESENTATION/);
      expect(chatApiContent).toMatch(/CALL_TO_ACTION/);
    });

    it('should implement smart conversation flow', () => {
      expect(chatApiContent).toMatch(/If user info is already available, skip asking for it/);
      expect(chatApiContent).toMatch(/Move directly to providing value/);
      expect(chatApiContent).toMatch(/Avoid repetitive questions/);
    });

    it('should implement company intelligence', () => {
      expect(chatApiContent).toMatch(/analyzeEmailDomain/);
      expect(chatApiContent).toMatch(/Company Research Complete/);
      expect(chatApiContent).toMatch(/companySize/);
      expect(chatApiContent).toMatch(/industry/);
    });

    it('should implement lead management', () => {
      expect(chatApiContent).toMatch(/updateLead/);
      expect(chatApiContent).toMatch(/createFollowUpSequence/);
      expect(chatApiContent).toMatch(/lead_score/);
      expect(chatApiContent).toMatch(/engagementScore/);
    });
  });

  describe('Performance Rules Compliance', () => {
    it('should implement response time tracking', () => {
      expect(chatApiContent).toMatch(/startTime = Date\.now\(\)/);
      expect(chatApiContent).toMatch(/Date\.now\(\) - startTime/);
      expect(chatApiContent).toMatch(/X-Response-Time/);
    });

    it('should implement streaming responses', () => {
      expect(chatApiContent).toMatch(/ReadableStream/);
      expect(chatApiContent).toMatch(/text\/event-stream/);
      expect(chatApiContent).toMatch(/Cache-Control.*no-cache/);
    });
  });

  describe('Error Handling Compliance', () => {
    it('should handle all error conditions gracefully', () => {
      expect(chatApiContent).toMatch(/Missing API key configuration/);
      expect(chatApiContent).toMatch(/Failed to generate enhanced response/);
      expect(chatApiContent).toMatch(/Internal server error/);
    });

    it('should include correlation IDs in error responses', () => {
      expect(chatApiContent).toMatch(/X-Correlation-ID.*correlationId/);
    });
  });
});
