# AI Functions and APIs Documentation

## Introduction

This document provides a comprehensive overview of the AI functions and APIs used in this project, their implementation details, their intended purpose, and a comparative analysis against the provided implementation guide (`__Complete AI Showcase Implementation Guide with C.md`).

## AI Functions and APIs

### Function/API 1: Enhanced Gemini API Handler

*   **Purpose:** The Enhanced Gemini API Handler serves as the central processing unit for a variety of AI-powered interactions. Its capabilities include:
    *   Managing conversational flows with users.
    *   Generating images based on prompts (specifically, generating textual descriptions for images).
    *   Analyzing video content for insights.
    *   Processing and understanding uploaded documents.
    *   Executing code snippets for business logic or calculations.
    *   Analyzing content from provided URLs.
    *   Capturing lead information and generating summaries.
    It integrates with Google's Gemini AI models, uses Supabase for real-time database interactions and broadcasting updates, and leverages ElevenLabs for generating human-like voice responses.

*   **Implementation:**
    *   **Primary Location:** `api/gemini-proxy.ts`. This file aligns closely with the implementation details and Vercel-specific types (`VercelRequest`, `VercelResponse`) mentioned in the `__Complete AI Showcase Implementation Guide with C.md`.
    *   **Related Implementation:** `app/api/gemini/route.ts`. This file provides a similar set of functionalities but is structured as a Next.js API route handler and uses slightly different import paths for some libraries (e.g., `@google/generative-ai` instead of `@google/genai`, and `@elevenlabs/elevenlabs-js` instead of `elevenlabs`).
    *   **Technology:** TypeScript.
    *   **Core Libraries (primarily from `api/gemini-proxy.ts`):**
        *   `@google/genai`: For interacting with Google Gemini models. (Note: `app/api/gemini/route.ts` 
        *   `@supabase/supabase-js`: For database operations and real-time communication via Supabase.
        *   `elevenlabs`: For text-to-speech voice generation. (Note: `app/api/gemini/route.ts` uses `ElevenLabsClient` from `"@elevenlabs/elevenlabs-js"`)
    *   **Structure (based on `api/gemini-proxy.ts`):** The API is structured around a main `handler` function that receives HTTP requests (Vercel serverless function signature). This handler inspects an `action` query parameter to delegate tasks to specialized asynchronous functions, such as:
        *   `handleConversationalFlow(body: ProxyRequestBody): Promise<ProxyResponse>`
        *   `handleImageGeneration(body: ProxyRequestBody): Promise<ProxyResponse>`
        *   `handleVideoAnalysis(body: ProxyRequestBody): Promise<ProxyResponse>`
        *   `handleDocumentAnalysis(body: ProxyRequestBody): Promise<ProxyResponse>`
        *   `handleCodeExecution(body: ProxyRequestBody): Promise<ProxyResponse>`
        *   `handleURLAnalysis(body: ProxyRequestBody): Promise<ProxyResponse>`
        *   `handleLeadCapture(body: ProxyRequestBody): Promise<ProxyResponse>`
    *   **Supporting Functions:** Includes various helper functions for tasks like:
        *   `getGenAI()`: Initializes and returns the GoogleGenAI instance.
        *   `getSupabase()`: Initializes and returns the Supabase client.
        *   `estimateTokens(text: string): number`: Estimates the number of tokens for a given text.
        *   `estimateCost(inputTokens: number, outputTokens: number): number`: Estimates the cost based on token usage.
        *   `generateVoiceWithElevenLabs(text: string): Promise<{ audioBase64: string }>`: Generates audio from text.
        *   `determineNextStage(...)`: Manages conversational state transitions.
        *   `calculateLeadScore(...)`: Scores leads based on interaction history.
        *   `extractCapabilitiesShown(...)`: Identifies AI capabilities demonstrated during a session.
        *   `generateEmailContent(...)`: Creates email content for lead follow-up.
    *   **Error Handling:** Each handler function and the main proxy handler include try-catch blocks to manage errors and return appropriate JSON responses.
    *   **Usage Limits:** Implements basic usage limits for demonstration purposes (e.g., `AI_USAGE_LIMITS.maxMessagesPerSession`).
    *   **Model Name:** The implementation guide mentions `gemini-2.0-flash-exp`, whereas the actual code in both `api/gemini-proxy.ts` and `app/api/gemini/route.ts` primarily uses `gemini-1.5-flash-latest`.

*   **Comparison with Implementation Guide:** The documentation for this API is derived directly from the `__Complete AI Showcase Implementation Guide with C.md`. The `api/gemini-proxy.ts` file is the closest match to the guide's description. Key deviations include the exact file path (guide mentions `/api/gemini.ts`), minor differences in AI model versions, and slight variations in library import paths in the `app/api/gemini/route.ts` alternative.

### Function/API 2: Database Schema (Supabase)

*   **Purpose:** The Supabase database schema is designed to store information related to leads generated through the AI showcase. It captures essential user details, the summary of their interaction with the AI, a consultant-specific brief, a calculated lead score, and a list of AI capabilities that were demonstrated to the user. The schema is optimized for "minimal storage" while providing the necessary data for lead management and enabling real-time updates on lead activity.

*   **Implementation:**
    *   **Technology:** Supabase (which uses PostgreSQL).
    *   **Table Definition:** A single table named `lead_summaries` is defined with the following SQL structure:
        ```sql
        CREATE TABLE lead_summaries (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          company_name TEXT,
          conversation_summary TEXT NOT NULL,
          consultant_brief TEXT NOT NULL,
          lead_score INTEGER DEFAULT 0,
          ai_capabilities_shown TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ```
    *   **Key Columns:**
        *   `id`: A unique identifier for each lead record.
        *   `name`, `email`, `company_name`: Basic contact information of the lead.
        *   `conversation_summary`: A summary of the interaction the lead had with the AI.
        *   `consultant_brief`: A more detailed brief intended for the consultant who will follow up with the lead.
        *   `lead_score`: A numerical score indicating the potential quality or engagement level of the lead.
        *   `ai_capabilities_shown`: An array of text strings listing the AI features demonstrated to the lead.
        *   `created_at`: Timestamp indicating when the lead record was created.
    *   **Real-time Functionality:** Real-time updates are enabled for this table to allow immediate broadcasting of new lead information. This is configured using the SQL command:
        ```sql
        ALTER PUBLICATION supabase_realtime ADD TABLE lead_summaries;
        ```
    *   **Performance Optimization:** To ensure efficient data retrieval, indexes are created on key columns:
        ```sql
        CREATE INDEX idx_lead_summaries_email ON lead_summaries(email);
        CREATE INDEX idx_lead_summaries_lead_score ON lead_summaries(lead_score DESC);
        CREATE INDEX idx_lead_summaries_created_at ON lead_summaries(created_at DESC);
        ```

*   **Comparison with Implementation Guide:** The documented schema is an exact representation of the SQL DDL provided in the `__Complete AI Showcase Implementation Guide with C.md` (Section 3). There are no deviations.

### Function/API 3: Main Chat Interface (`AIShowcase.tsx`)

*   **Purpose:** This component renders the primary user interface for the AI showcase. It facilitates the interactive chat between the user and the AI, manages the display of conversation history, handles user inputs, allows users to trigger various AI capability demonstrations, and provides real-time feedback on AI activities through a dedicated sidebar. A key function is to guide the user through the showcase and ultimately capture their information as a lead.

*   **Implementation:**
    *   **Location:** `components/AIShowcase.tsx`. This is consistent with the implementation guide and confirmed by `ls` output.
    *   **Technology:** React (specifically as a Next.js client-side component, indicated by `"use client"`), TypeScript (TSX).
    *   **State Management:**
        *   Employs React hooks (`useState`, `useEffect`) for managing local component state.
        *   `conversationState`: An object of type `ConversationState` stores the session ID, current interaction stage (e.g., 'greeting', 'email_request'), user messages (`Message` interface), collected user information (name, email, company details), and a list of AI capabilities shown.
        *   `sidebarActivity`: An object of type `SidebarActivity` to reflect the AI's current background tasks in the UI.
        *   `isLoading`: A boolean state to indicate when the application is awaiting a response from the AI.
        *   Session Persistence: The `conversationState` is saved to and retrieved from `sessionStorage` to allow users to resume their session.
    *   **Real-time Communication:**
        *   Utilizes the `@supabase/supabase-js` client to subscribe to a Supabase real-time channel named `ai-showcase`.
        *   Listens for `broadcast` events:
            *   `ai-response`: Updates the chat with the AI's message, plays audio if available, and updates the conversation state.
            *   `sidebar-update`: Updates the sidebar with the current AI activity.
    *   **API Interactions (Backend: Enhanced Gemini API Handler):**
        *   `handleSendMessage(message: string)`: Sends the user's typed message to the backend API endpoint `/api/gemini?action=conversationalFlow`. It also updates the local `conversationState` with the user's message.
        *   `triggerCapabilityDemo(capability: string)`: Constructs a predefined prompt for a selected AI capability and sends it using `handleSendMessage`.
        *   `completeShowcase()`: Called when the user decides to finish the showcase. This function sends the conversation history and user information to `/api/gemini?action=leadCapture` to generate a summary and save the lead.
    *   **Key UI Elements:**
        *   **Sidebar (`AI Activity Monitor`):**
            *   Displays a list of "Capabilities Showcased" to the user.
            *   Shows the "Current Activity" of the AI (e.g., "company_analysis", "voice_generation").
            *   Provides "Try AI Capabilities" buttons (e.g., "Image Generation", "Video Analysis") for users to initiate demos.
            *   A "Complete AI Showcase & Get Summary" button appears when the user has provided their name and email and interacted sufficiently.
        *   **Main Chat Area:**
            *   Displays the sequence of user and AI messages.
            *   AI messages can include playable audio (if `audioData` is provided) and links to grounding sources.
            *   An input component (`ChatInput`) allows the user to type and send messages.
            *   A loading indicator shows when the AI is processing.
    *   **Component Structure:**
        *   `AIShowcase`: The main functional component.
        *   `ChatInput`: A sub-component responsible for the message input field and send button.
    *   **Workflow Highlights:**
        1.  The component initializes with a greeting message from the AI.
        2.  It guides the user to provide their name and then email, updating the `conversationState` stage accordingly.
        3.  User interactions (messages, demo triggers) are sent to the backend API.
        4.  AI responses and sidebar updates are received via Supabase real-time channels and reflected in the UI.
        5.  Once the conditions are met (user information collected, sufficient interaction), the user can opt to complete the showcase, which triggers lead capture.

*   **Comparison with Implementation Guide:** The documented structure and functionality are based directly on the TypeScript code and explanations for `components/AIShowcase.tsx` provided in Section 4 of the `__Complete AI Showcase Implementation Guide with C.md`. No significant deviations are noted.

### Function/API 4: PDF Generation (`pdfGenerator.ts`)

*   **Purpose:** This utility is responsible for generating a branded PDF report which serves as a take-away for leads who have completed the AI showcase. The report includes personalized information such as the client's details, a summary of the AI capabilities they witnessed, an executive overview of their interaction, their calculated lead score, and clear next steps for a potential consultation, all presented with F.B/c branding.

*   **Implementation:**
    *   **Location:** `utils/pdfGenerator.ts`. This is consistent with the implementation guide (Section 5) and confirmed by `ls` output.
    *   **Technology:** TypeScript.
    *   **Core Libraries:** Primarily uses the `jspdf` library for client-side PDF document creation and manipulation.
    *   **Main Function:** The core of this utility is the asynchronous function `generateFBCReport`.
        ```typescript
        export const generateFBCReport = async (summaryData: {
          name: string;
          email: string;
          companyName?: string;
          summary: string;
          leadScore: number;
          capabilitiesShown: string[];
        }): Promise<string> => {
          // ... implementation ...
        };
        ```
    *   **Key Functionality Steps:**
        1.  **Initialization:** A new `jsPDF` object is instantiated.
        2.  **Branding and Header:**
            *   The F.B/c company name ("F.B/c AI Consulting") is added with a specific font size (24pt) and color (blue: 44, 90, 160).
            *   The report title "AI Transformation Report" is added below the company name.
        3.  **Client Information Section:** Displays:
            *   `Prepared for: [Client Name]`
            *   `Company: [Company Name (or N/A)]`
            *   `Date: [Current Date]`
            *   `AI Readiness Score: [Lead Score]/100`
        4.  **AI Capabilities Demonstrated Section:** Lists the AI capabilities shown to the user, prefixed with a "✓" symbol.
        5.  **Executive Summary Section:** The `summaryData.summary` text is added, with `jspdf` handling text splitting to fit the page width.
        6.  **Next Steps Page:** A new page is added to detail suggested next actions for the client, such as scheduling a strategy session.
        7.  **Contact Information Section:** Provides contact details for F.B/c AI Consulting, including founder's name, email, website, and a placeholder for a consultation booking link.
        8.  **Footer:** A small note is added at the bottom indicating that the report was AI-generated.
        9.  **Output:** The generated PDF is returned as a Base64 encoded data URI string (`pdf.output('datauristring')`), suitable for embedding or direct download.

*   **Comparison with Implementation Guide:** The documented functionality and structure are an accurate reflection of the `utils/pdfGenerator.ts` code provided in Section 5 of the `__Complete AI Showcase Implementation Guide with C.md`. There are no observed deviations.

### Project Implementation Checklist (from Guide)

*   **Purpose:** The implementation guide includes a checklist (Section 6) that outlines the development process for the AI showcase platform. This checklist is intended as a roadmap for building the application, covering phases from initial setup to production deployment. It is not a functional software component itself but rather a project management aid.

*   **Structure:** The checklist is divided into five main phases:
    1.  **Phase 1: Core Setup:** Focuses on Vercel and Supabase project initialization, environment variable configuration, implementing the core Gemini API handler, database schema setup, and initial conversational flow testing.
    2.  **Phase 2: AI Capabilities Showcase:** Details the implementation of the 16 distinct Gemini capabilities listed in the guide, from text and image generation to video/audio understanding and code execution.
    3.  **Phase 3: Real-time Experience:** Covers Supabase real-time broadcasting, the sidebar activity monitor, voice streaming with ElevenLabs, and testing the overall 15-minute showcase flow.
    4.  **Phase 4: Lead Generation:** Involves implementing session management, the lead scoring algorithm, conversation summary generation, branded PDF creation, email automation, and consultation booking integration.
    5.  **Phase 5: Production Deployment:** Outlines final steps like performance optimization, error handling, usage monitoring, analytics, user testing, and launching the live showcase.

*   **Comparison with Implementation Guide:** This section summarizes the purpose and structure of the checklist found in the `__Complete AI Showcase Implementation Guide with C.md`. The checklist itself is a comprehensive list of tasks within these phases.

## Conclusion

This document provides a detailed overview of the key AI-related functions, APIs, and components as outlined in the `__Complete AI Showcase Implementation Guide with C.md`. It covers the backend API handler (Gemini API), the database schema (Supabase), the main frontend chat interface (`AIShowcase.tsx`), and the PDF generation utility (`pdfGenerator.ts`). For each component, its purpose, implementation details (including technology, core libraries, and structure), and a comparison with the source guide have been provided.

The primary implementation files identified are `api/gemini-proxy.ts` for the backend API, `components/AIShowcase.tsx` for the frontend, and `utils/pdfGenerator.ts` for PDF reports, with Supabase for the database. Minor discrepancies, such as file path naming conventions for the API handler and specific AI model versions or library import paths, have been noted where applicable. Overall, the implemented components align well with the detailed descriptions in the guide. The guide's implementation checklist has also been summarized to provide context on the project's development lifecycle.

This compiled information should serve as a useful reference for understanding the architecture and functionality of the AI showcase application.

## Appendix

[Any additional information, diagrams, or code snippets that might be relevant]
