This was the original plan, compare it to the codebase file for file how it has been setup and where the gaps are. 

Absolutely—here is a complete specification (spec) for how the F.B/c AI experience should engage users to naturally try as many AI functions as possible, so the final PDF summary reflects deeply personalized, high-value insights (including ROI, where appropriate), but does so without being pushy—remaining helpful, professional, and adaptive for every user.

# F.B/c AI Conversational Engagement & Capability Orchestration: Final Experience Spec

## 1. High-Level Goal

Create a session flow so that:
- Most users are naturally guided (“pulled,” not “pushed”) into using a broad range of AI capabilities (ideally all 16).
- The final PDF summary is maximally personalized, action-oriented, and includes an ROI analysis wherever enough data is provided.
- Users who are not ready to use certain capabilities never feel forced, but still receive a summary based on their journey.

## 2. Principles

- **Conversational Guidance, Not Force:** AI surfaces features contextually, offering (“Would you like to try…?”), not demanding.
- **Progressive Discovery:** The more the user shares or engages, the more the AI reveals value, always connecting features to the user's specific goal or question.
- **Transparent Motivation:** Each feature is explained with its practical business value (“This will help us estimate ROI on your customer support costs…”).
- **Respectful Exit:** If the user declines a modality, summarize what’s possible and capture only what’s relevant to them.

## 3. Engagement Flow & Tactics

### 3.1. Initial Onboarding

- AI greets, learns user’s name, company, context.
- Sets expectations: “I can show you, step by step, how modern AI can drive value for [their company]. At any point, tell me to skip or jump ahead.”
- “Would you like to analyze a process or just explore what’s possible?”

### 3.2. Context Discovery

- Asks about a business challenge: “What’s one process or workflow you’d automate if you had a magic wand?”
- Offers follow-up: “If you’d like, I can help estimate potential savings using our ROI calculator. Shall I guide you step by step or would you prefer to try the calculator yourself?”

### 3.3. Progressive Capability Suggestions

The AI listens for context cues and offers relevant tools:

- **Document Offered/Discussed:**
  - “Feel free to upload your current process document and I’ll analyze it for automation opportunities.”
- **Image/Screenshot Workflow:**
  - “You can share a screenshot or photo—AI can spot bottlenecks or opportunities visually.”
- **Video/YouTube Training:**
  - “Have a demo or tutorial video? I can turn that into an app blueprint to speed up onboarding and automation.”
- **Screen/Webcam Share:**
  - “Want a live example? Share your screen or use the webcam and I’ll give immediate feedback, like a business co-pilot.”
- **Code/Calculation Prompt:**
  - “Do you want to see a custom calculation, like payback period or cost/benefit for this process?”

### 3.4. Conversational Hooks

At every step:
- If user is engaged: “Would you like to go deeper with [feature]? It’ll make your summary and recommendations even more tailored.”
- If user is hesitant/uncertain:
  - “No worries, happy to create a summary based just on what you’ve shared so far. You can always add more later.”

### 3.5. Activity Panel

- As each function is triggered, the activity panel updates (and gently encourages): “Document analysis unlocked!” … “ROI calculation ready! Try it to see practical numbers for your business.”
- Progress bar (“You’ve explored 8/16 capabilities so far!”) helps gamify experience without pressure.

## 4. Handling Different User Types

- **Highly Engaged Users:**  
  Experience most or all features; summary includes detailed ROI, process visuals, code, benchmarks, etc.
- **Browsers/Skeptics:**  
  Minimum interaction; summary focuses on their business pain, offers highlights, and explains what deeper use of AI *could* have uncovered (and a gentle “Want to try more?” follow-up).
- **Goal-Oriented Users:**  
  May want only ROI or document analysis; AI quickly delivers what’s most important and offers one or two “next best” actions.

## 5. Final Summary & PDF Handling

- AI synthesizes:
    - **Used Capabilities:** Personalizes based on actual engagement (e.g., “Based on your document and our conversation…”).
    - **ROI Calculated:** If enough data, a real calculation is shown; if not, the summary explains which steps could unlock these numbers.
    - **Recommendations:** Focus on next best actions.
    - **Gaps:** “If you’d like to deepen these insights, try sharing a document/video or running a screen analysis next session.”
- PDF summary is offered for download **and** sent to email, with a call-to-action for next steps (e.g. book consultation, schedule workshop).

## 6. Conversational Sample Flows (for Reference)

**Example A — Full Engagement:**

> AI: “Hi! I can show you how AI would overhaul your customer support. What’s your process today?”
>
> User: “We spend 60 hours/week on manual ticket handling.”
>
> AI: “Want to upload a screenshot or document of the workflow? If you do, I’ll analyze and calculate potential ROI for you…”
> *(User uploads doc, answers 2 ROI questions, tries screen share)*

PDF: Includes ROI, process analysis, business case, and app blueprint.

**Example B — Minimalist/Reluctant User:**

> AI: “Happy to summarize our conversation and next steps. If you want a more detailed report next time, just try the ROI calculator or upload a doc!”

PDF: High-level summary, highlight of key challenge, plus tips to enrich future sessions.

## 7. Spec Recap & Checklist

- [x] Greet, explain value, set soft expectations/gamify
- [x] Listen for context, connect each capability to practical benefit
- [x] Offer (never force) deeper engagement at every step
- [x] Track which features were used, and gently nudge try-outs (“Want to see more?”)
- [x] Final summary & PDF adapt to engagement: maximally personalized, but gracefully handle minimal journeys
- [x] All engagement flows are available via both chat and UI/modal for maximum accessibility

## 8. Business & UX Outcome

- **Every user receives immediate value, regardless of engagement depth.**
- **The more the user explores, the deeper and more actionable the AI’s final insight becomes—especially ROI.**
- **Users who opt out of some features are never penalized or pressured—they see exactly what else is possible, with an open invitation to try more next time.**
- **The process feels natural, helpful, modern, and never salesy—maximizing trust, lead quality, and positive brand impact.**

This is the comprehensive but user-friendly operational script and UX flow for F.B/c AI’s engagement and summary experience, ensuring every user gets the right value, the business gets rich leads and analytics, and the AI’s power is fully showcased.

# Plan to add Google-grounded search + URL context to your app

I can’t open your site from here, but I read the current Gemini docs and I’ll map concrete changes into your codebase. Key pages from Google: Google Search grounding, URL context, models/capabilities, and Live API tool use. ([Google AI for Developers][1])

## What these features do (short)

* Google Search grounding: let Gemini call Google Search and cite sources. You add `tools: [{ googleSearch: {} }]` to the request. You read `groundingMetadata` for citations. ([Google AI for Developers][1])
* URL context: give Gemini a small list of URLs to fetch and use as context. You include a `urlContext` tool with URLs. It pairs well with Search grounding. Note: this feature is still evolving and can be flaky on some sites. ([Google AI for Developers][2], [Google AI Developers Forum][3])

## Choose the SDK path

Use the **Google GenAI SDK** (`@google/genai`). Do **not** mix Vertex AI’s SDK for this feature set; multiple tool combos have limits on Vertex right now. If you stay on Vertex, you may hit “multiple tools only when all are search tools” errors. ([GitHub][4])

---

# Exact code changes in your repo

I’m assuming the current layout you shared earlier:

* API chat: `app/api/chat/route.ts` (and `app/api/chat-enhanced/route.ts` if present)
* Voice live server: `server/live-server.ts` (WebSocket → Gemini Live)
* Shared client: `lib/gemini-live-api.ts` or `lib/ai/gemini-live-client.ts`
* Lead research routes: `app/api/lead-research/route.ts` (or similar)
* UI: `app/(chat)/chat/page.tsx`, `components/chat/*`, `components/chat/tools/*`

## 1) Add grounded search to text chat routes

Files:

* `app/api/chat/route.ts`
* `app/api/chat-enhanced/route.ts` (if used)
* `lib/gemini-live-api.ts` (if you centralize model calls)

Change:

* Ensure you use `import { GoogleGenerativeAI } from "@google/genai"` **or** `import { GoogleGenAI } from "@google/genai"` depending on your version. Create model `gemini-2.5-flash` (or `2.5-pro` if needed).
* Pass the tool config.

Example:

```ts
// lib/gemini.ts
import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export function model() {
  return gemini.models.getGenerativeModel({ model: "gemini-2.5-flash" });
}
```

```ts
// app/api/chat/route.ts (inside your handler)
const urls = body.urls ?? []; // optional: collected via UI or lead-research
const useSearch = body.useSearch ?? true;

const tools: any[] = [];
if (useSearch) tools.push({ googleSearch: {} });
if (urls.length) tools.push({ urlContext: { urls: urls.map((u: string) => ({ url: u })) } });

const result = await model().generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  tools,
});

const candidate = result.response.candidates?.[0];
const citations = candidate?.groundingMetadata?.groundingChunks?.map((c: any) => c.web?.uri) ?? [];
// return text + citations to client
```

Reference for tool shape and `groundingMetadata`. ([Google AI for Developers][1])

## 2) Add grounded search + URL context to the **Live voice** session

File:

* `server/live-server.ts` (your WebSocket → Gemini Live proxy using `ai.live.connect`)

Change:

* Include `tools` in the `ai.live.connect` config.
* You **do not** implement tool execution; Search and URL context are provider tools. The model handles them and returns grounded citations in messages.

Example:

```ts
const session = await ai.live.connect({
  model: "models/gemini-2.5-flash",
  responseModalities: ["AUDIO","TEXT"],
  speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } } },
  audioConfig: { sampleRateHertz: 24000, audioChannels: 1, encoding: "LINEAR16" },
  tools: [
    { googleSearch: {} },
    // optional URL context provided by your UI or lead-research
    ...(urls?.length ? [{ urlContext: { urls: urls.map((u) => ({ url: u })) } }] : []),
  ],
  callbacks: { /* existing onopen, onmessage, onerror, onclose */ },
});
```

When handling messages:

* When you forward model text to the browser, also forward the `groundingMetadata` URIs so the UI can show citations. ([Google AI for Developers][1])

## 3) UI: collect and pass URLs, toggle Search, show citations

Files:

* `app/(chat)/chat/page.tsx`
* `components/chat/ChatFooter.tsx`
* `components/chat/ChatArea.tsx`
* `components/chat/tools/*` (VoiceInput, Multimodal tool)

Changes:

* Add a small advanced panel: checkbox “Use Google Search”, input chips for “Reference URLs”.
* Include these in the POST to `/api/chat` and in the `start` payload for the WebSocket voice session.
* Render citations under each AI message if present.

```tsx
// when sending
send({ prompt, useSearch, urls }); // chat
ws.send(JSON.stringify({ type: "start", payload: { leadContext, useSearch, urls } })); // voice
```

## 4) Lead research route: feed URLs to the model

File:

* `app/api/lead-research/route.ts`

Change:

* When you fetch Google/LinkedIn summaries, extract the canonical profile or company URLs you want the model to read.
* Return a curated `urls` array to the front-end so a user can approve them before use (consent and privacy).
* Pass those URLs into both text chat and live voice as shown.

## 5) Persist and cache to cut cost

Files:

* `lib/lead-manager.ts`, `lib/cache.ts` (or create)
* Supabase tables: `grounding_cache`, `url_fetch_cache` (up to you)

Change:

* Hash by `{model, promptHash, urlsHash, useSearch}`.
* Store the AI response and `groundingMetadata` for reuse.
* Add expiry. This avoids repeat Search calls for same prompts.

## 6) Error handling and fallbacks

* If URL context fails for a site, fetch the URL server-side yourself, sanitize HTML to text, pass it as a `file` or text chunk in the prompt. Several users report inconsistencies with URL context for some domains. Plan a fallback. ([Google AI Developers Forum][3])
* If you are on Vertex AI library for some calls, migrate those specific routes to the Gemini API SDK to avoid mixed-tool errors. ([GitHub][4])

---

# Minimal diffs by file

1. `server/live-server.ts`

* Add `tools: [{ googleSearch: {} }, { urlContext: { urls } }]` to `ai.live.connect`.
* Forward `groundingMetadata` when sending text parts to the client.

2. `app/api/chat/route.ts`

* Build `tools` array from body flags + URLs.
* Extract citations from `response.candidates[0].groundingMetadata`.
* Return `citations` to client.

3. `app/(chat)/chat/page.tsx`

* Add UI controls: toggle “Use Google Search”, URL chips input.
* Pass values to chat API and WebSocket start.

4. `components/chat/ChatArea.tsx`

* Render small “Sources” list under each AI message when citations exist.

5. `app/api/lead-research/route.ts`

* Return curated `urls` that you want the model to use (Google profile, LinkedIn company page, etc.).

6. `lib/gemini-live-api.ts` (if present)

* Centralize model creation and expose a helper that accepts `{ prompt, urls, useSearch }`.

7. DB migrations (Supabase)

* Create a cache table for grounded outputs keyed by hash.
* Optional activity log table to track tool usage per session.

---

# Key setup checks

* Gemini API key active in Vercel and on Fly for the WS server.
* Project has access to Google Search grounding (no extra code; you only set the tool). ([Google AI for Developers][1])
* You are using the **Gemini API SDK**, not accidentally calling Vertex for these routes. ([GitHub][4])

---

# Notes on the Live API

You do not need to implement function handlers for Google Search or URL context with Live API; they’re provider tools. You just include them in `tools` and consume the grounded output when it arrives. See Live/Tools references. ([Google AI for Developers][2])

---

# Why this will help your experience

* The assistant can pull in current info with citations.
* You can pre-seed with the user’s public pages for context without scraping in your code.
* The final summary can link sources directly.
* With caching, cost stays stable.

If you want, I can write the exact patches for each file on your main branch in a follow-up.

[1]: https://ai.google.dev/gemini-api/docs/google-search "Grounding with Google Search  |  Gemini API  |  Google AI for Developers"
[2]: https://ai.google.dev/gemini-api/docs/models?utm_source=chatgpt.com "Gemini models | Gemini API | Google AI for Developers"
[3]: https://discuss.ai.google.dev/t/does-url-context-even-work-can-you-fix-it/91770?utm_source=chatgpt.com "Does URL context even work? Can you fix it? - Gemini API"
[4]: https://github.com/googleapis/python-genai/issues/941?utm_source=chatgpt.com "URL context tool not working together with Google Search on Vertex AI · Issue #941 · googleapis/python-genai"
