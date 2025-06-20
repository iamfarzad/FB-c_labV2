// api/ai-service/route.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ProxyRequestBody, ProxyResponse, ConversationState } from './types';
import { handleConversationalFlow } from './handlers/conversation';
import { handleImageGeneration } from './handlers/imageGeneration';
import { handleVideoAnalysis } from './handlers/videoAnalysis';
import { handleDocumentAnalysis } from './handlers/documentAnalysis';
import { handleCodeExecution } from './handlers/codeExecution';
import { handleURLAnalysis } from './handlers/urlAnalysis';
import { handleLeadCapture } from './handlers/leadCapture';

// Note: Utility function imports like getGenAI, getSupabase, etc., are not directly needed in this router file
// if they are only used within the individual handlers.
// Specific imports like HarmCategory might be needed if error handling or common logic here uses them.
// For now, keeping it clean. Individual handlers import what they need.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const action = req.query.action as string | undefined; // Ensure action can be undefined
    const body: ProxyRequestBody = req.body || {}; // Ensure body is at least an empty object
    let responseResult: ProxyResponse;

    switch (action) {
        case "conversationalFlow":
        case undefined: // No action defaults to conversationalFlow
        case "": // Empty action also defaults to conversationalFlow
            responseResult = await handleConversationalFlow(body);
            break;
        case "generateImage":
            responseResult = await handleImageGeneration(body);
            break;
        case "analyzeVideo":
            responseResult = await handleVideoAnalysis(body);
            break;
        case "analyzeDocument":
            responseResult = await handleDocumentAnalysis(body);
            break;
        case "executeCode":
            responseResult = await handleCodeExecution(body);
            break;
        case "analyzeURL":
            responseResult = await handleURLAnalysis(body);
            break;
        case "leadCapture":
            responseResult = await handleLeadCapture(body);
            break;
        case "health":
            const { currentConversationState: healthState = {
                stage: 'health_check', messages: [], messagesInStage: 0,
                sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
                aiGuidance: "Health check", sidebarActivity: ""
            } as ConversationState } = body; // Ensure type assertion for default
            responseResult = {
                success: true,
                data: {
                    status: "healthy",
                    capabilities: "all_ai_service_handlers_active",
                    conversationStateForNextTurn: healthState
                },
                status: 200 // Explicitly set status for success
            };
            break;
        default:
            responseResult = { success: false, error: "Unknown or unhandled action: " + action, status: 400 };
            break;
    }

    if (responseResult.success) {
      return res.status(responseResult.status || 200).json(responseResult);
    } else {
      // Ensure status is part of the error response object if not already there
      const status = responseResult.status || 500;
      return res.status(status).json({
        ...responseResult, // Spread existing error info
        status: status // Ensure status is in the JSON body as well
      });
    }
  } catch (error: any) {
    console.error("AI Service main handler error:", error);
    const errorResponse: ProxyResponse = {
        success: false,
        error: "Internal server error: " + (error.message || "Unknown error"),
        status: 500
    };
    return res.status(500).json(errorResponse);
  }
}
