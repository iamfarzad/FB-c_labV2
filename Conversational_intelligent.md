Below is the full file list for a complete “Conversational Intelligence” pipeline in a Next.js App Router setup with Supabase. Each file has a purpose and minimal interface. Keep names as-is to avoid drift.

File tree

app/
  api/
    consent/route.ts
    intelligence/
      session-init/route.ts
      lead-research/route.ts
      intent/route.ts
      suggestions/route.ts
      context/route.ts
  (edge)/api/intelligence/events/route.ts         # optional telemetry sink

components/
  cards/TCConsentCard.tsx                         # modify: collects name + work email + company URL + consent
  chat/AIEChat.tsx                                # modify: calls session-init and uses context in Stage 1
  intelligence/SuggestedActions.tsx               # new: renders next-step suggestions

hooks/
  useConversationalIntelligence.ts                # new
  useLeadContext.ts                               # new
  useIdempotency.ts                               # new

lib/
  intelligence/
    conversational-intelligence.ts                # orchestrator
    lead-research.ts                              # company + person research with caching
    role-detector.ts                              # extracts role from research data
    intent-detector.ts                            # classifies consulting vs workshop vs other
    tool-suggestion-engine.ts                     # maps context+intent→actions
    capability-map.ts                             # static map of capabilities per industry/role
    providers/
      search/google-grounding.ts                  # real provider
      search/mock-grounding.ts                    # mock provider, no external calls
      enrich/company-normalizer.ts                # normalize site/about data
      enrich/person-normalizer.ts                 # normalize linkedin-like data
    scoring.ts                                    # confidence scores, thresholds
    prompts/
      intent.md
      greeting.md
      tool_suggestions.md

  conversation/
    state-manager.ts                              # stage transitions
    stages.ts                                     # GREETING, INTENT, QUALIFY, etc.
    guards.ts                                     # consent checks, context readiness

  context/
    context-manager.ts                            # read/write merged context
    context-storage.ts                            # Supabase read/write + Redis/KV cache
    context-schema.ts                             # zod schemas for safety
    context-selectors.ts                          # helpers to fetch context fragments

  telemetry/
    events.ts                                     # fire-and-forget logging with idempotency key
    rate-limit.ts                                 # per-session limits
    idempotency.ts                                # deterministic keys for same inputs

  config/intelligence.ts                          # thresholds, provider flags, timeouts

  types/
    intelligence.ts
    lead.ts
    api.ts

supabase/
  migrations/
    2025XXXX_conversational_intelligence.sql
  seeds/
    capability_map_seed.sql

mocks/
  intelligence/
    acme_company.json
    john_cto.json
    grounding_company_result.json
  providers/
    google-grounding.response.json

tests/
  unit/
    role-detector.test.ts
    intent-detector.test.ts
    tool-suggestion-engine.test.ts
    conversational-intelligence.test.ts
  api/
    session-init.spec.ts
    lead-research.spec.ts
    intent.spec.ts
    suggestions.spec.ts
  e2e/playwright/
    intelligence-flow.spec.ts

scripts/
  test-intelligence-pipeline.ts
  seed-capabilities.ts

Key files with contracts

app/api

consent/route.ts
	•	POST { email, name, companyUrl, consent: true }
	•	writes consent + basic lead row
	•	returns { sessionId }

intelligence/session-init/route.ts
	•	POST { sessionId, email, name, companyUrl }
	•	kicks off lead-research sync (fast) or async
	•	returns { sessionId, contextReady: boolean, snapshot?: Context }

intelligence/lead-research/route.ts
	•	POST { sessionId, email, name, companyUrl, provider?: 'google'|'mock' }
	•	runs provider, normalizers, role-detector
	•	stores in conversation_contexts
	•	returns { company, person, role, scores }

intelligence/intent/route.ts
	•	POST { sessionId, userMessage }
	•	returns { intent, confidence, slots }
	•	writes to intent_classifications

intelligence/suggestions/route.ts
	•	POST { sessionId, stage }
	•	returns { suggestions: Array<{id,label,action,payload}> }

intelligence/context/route.ts
	•	GET ?sessionId=... → merged context snapshot

components

TCConsentCard.tsx (modify)
	•	On Allow: POST /api/consent → /api/intelligence/session-init
	•	Store sessionId in cookie/localStorage
	•	Optimistic UI: show “using company context…” tag

AIEChat.tsx (modify)
	•	Stage GREETING pulls /api/intelligence/context
	•	Uses contextual greeting if contextReady
	•	If not ready, greet short, then ask intent in the same turn

SuggestedActions.tsx
	•	Renders actions from /api/intelligence/suggestions
	•	Emits selected action back to chat pipeline

hooks

useConversationalIntelligence.ts

export function useConversationalIntelligence() {
  const initSession = async (lead: {email:string; name:string; companyUrl?:string}) => {...}
  const getContext = async (sessionId: string) => {...}
  const classifyIntent = async (sessionId: string, text: string) => {...}
  const getSuggestions = async (sessionId: string, stage: string) => {...}
}

useLeadContext.ts
	•	Local state and hydration from server snapshot

lib/intelligence

conversational-intelligence.ts

export class ConversationalIntelligence {
  constructor(deps:{providers:{search: SearchProvider}})
  async initSession(input:{sessionId:string; email:string; name:string; companyUrl?:string}): Promise<Context>
  async researchLead(input:{email:string; name:string; companyUrl?:string}): Promise<ResearchResult>
  async detectRole(research: ResearchResult): Promise<{role:string; confidence:number}>
  async detectIntent(text:string, context: Context): Promise<IntentResult>
  async suggestTools(context: Context, intent: IntentResult, stage: Stage): Promise<Suggestion[]>
}

lead-research.ts
	•	Calls provider
	•	Caches by domain/email
	•	Merges company + person + site “about” data

role-detector.ts
	•	Regex + LLM fallback with thresholds
	•	Returns { role, confidence }

intent-detector.ts
	•	Zero-shot or few-shot on intents: consulting, workshop, other
	•	Extract slots: problem focus, team size, timeline

tool-suggestion-engine.ts
	•	Inputs: { industry, role, intent, stack? }
	•	Outputs max 3 actions, each executable

capability-map.ts
	•	Static JSON of actions per industry/role
	•	Example: SaaS+CTO → “Audit deployment”, “CS workflow analysis”, “LLM cost review”

lib/context

context-storage.ts
	•	store(sessionId, payload)
	•	get(sessionId)
	•	update(sessionId, patch)

context-manager.ts
	•	Builds merged snapshot: lead, company, person, role, latest intent

context-schema.ts
	•	zod schemas for validation

lib/conversation

state-manager.ts
	•	Stages: GREETING → INTENT → QUALIFY → ACTION
	•	Guard: require consent before research

stages.ts
	•	generateGreeting(context) with role-aware variant:
	•	If role confidence ≥ 0.7: “Hi John at TechCorp. As CTO…”
	•	Else: “Hi John at TechCorp. What’s your focus there?”

supabase/migrations

2025XXXX_conversational_intelligence.sql

create table conversation_contexts (
  session_id text primary key,
  email text not null,
  name text,
  company_url text,
  company_context jsonb,
  person_context jsonb,
  role text,
  role_confidence numeric,
  intent_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table intent_classifications (
  id uuid primary key default gen_random_uuid(),
  session_id text references conversation_contexts(session_id),
  intent text,
  confidence numeric,
  slots jsonb,
  created_at timestamptz default now()
);

create index on intent_classifications (session_id);

Minimal data contracts

types/intelligence.ts

export type Stage = 'GREETING'|'INTENT'|'QUALIFY'|'ACTION';

export interface CompanyContext { name:string; domain:string; industry?:string; size?:string; summary?:string; }
export interface PersonContext { fullName:string; role?:string; seniority?:string; profileUrl?:string; }
export interface Context { lead:{email:string; name:string}; company?:CompanyContext; person?:PersonContext; role?:string; roleConfidence?:number; intent?:{type:string; confidence:number; slots:any}; }
export interface IntentResult { type:'consulting'|'workshop'|'other'; confidence:number; slots:Record<string,any>; }
export interface Suggestion { id:string; label:string; action:'open_form'|'upload_prompt'|'schedule_call'|'run_audit'; payload?:any; }

Flow (start to finish)
	1.	TC card collects name + work email (+ company URL if user enters it) and consent.
	2.	POST /api/consent → /api/intelligence/session-init.
	3.	Session-init triggers lead-research (provider flag: GOOGLE_GROUNDING or MOCK).
	4.	Research stores context; role-detector sets role with confidence.
	5.	Chat GREETING uses context if ready. If confidence < 0.7, ask for role confirmation.
	6.	First user message goes to /api/intelligence/intent.
	7.	Suggestions fetched from /api/intelligence/suggestions based on intent + role + industry.
	8.	User picks an action. Move to QUALIFY → ACTION.

Cost control
	•	Provider toggle: INTEL_PROVIDER=mock|google
	•	Cache key: sha256(email|domain) with 24h TTL
	•	Idempotency key on session-init and lead-research
	•	Rate limit research to 1 per session per 10 min

What to implement first
	1.	DB migration.
	2.	consent, session-init, lead-research endpoints.
	3.	AIEChat.tsx greeting using context with fallback.
	4.	intent endpoint.
	5.	suggestions endpoint + SuggestedActions.tsx.
	6.	Unit tests for role, intent, suggestions.
	7.	E2E for full flow.


---

## TODO: Conversational Intelligence + Summary/PDF + Admin Integration

This section lists what already exists, what to add, how to add it, and why it matters. Keep file paths and names as written.

### 1) Consent → Context wiring (fix the missing linkage)

**What exists**
- `components/chat/AIEChat.tsx`: TC Card posts to `/api/consent`, sets local state.
- `lib/lead-manager.ts`: sets `shouldTriggerResearch` but does not call research.

**Add / modify**
- **File:** `components/chat/AIEChat.tsx`
  - After successful `/api/consent`, call `POST /api/intelligence/session-init` with `{ sessionId, email, name?, companyUrl? }` and store `sessionId` in cookie/localStorage.
  - If response has `contextReady=true`, fetch `GET /api/intelligence/context` and hydrate greeting.
- **File:** `app/api/intelligence/session-init/route.ts` (new)
  - Start lead research (sync or queue async) and upsert initial row in `conversation_contexts`.
- **File:** `app/api/intelligence/context/route.ts` (new)
  - Return merged snapshot from `context-storage`.

**Why**
- Without this, the chat greets generically and ignores company/person context.

### 2) Lead research (company + person)

**What exists**
- No connected research endpoint. Generic background message only.

**Add**
- **File:** `lib/intelligence/lead-research.ts`
  - Provider interface, caching by domain/email, merge site/about data.
- **File:** `lib/intelligence/role-detector.ts`
  - Extract role with regex; fallback to LLM if needed; return confidence.
- **File:** `app/api/intelligence/lead-research/route.ts`
  - Input: `{ sessionId, email, name?, companyUrl?, provider?: 'google'|'mock' }`.
  - Output: `{ company, person, role, scores }`. Persist to `conversation_contexts`.

**Why**
- Enables role‑aware greeting and industry‑aware suggestions.

### 3) Intent detection + suggestions

**What exists**
- Heuristic keyword chips only.

**Add**
- **File:** `lib/intelligence/intent-detector.ts`
  - Classify `consulting | workshop | other`, extract slots (focus, team size, timeline).
- **File:** `lib/intelligence/tool-suggestion-engine.ts`
  - Input: `{ industry, role, intent, usedCaps }`; Output: max 3 actionable suggestions.
- **File:** `app/api/intelligence/intent/route.ts`
  - POST `{ sessionId, userMessage }` → `{ intent, confidence, slots }`. Store in `intent_classifications` and `conversation_contexts.intent_data`.
- **File:** `app/api/intelligence/suggestions/route.ts`
  - POST `{ sessionId, stage }` → `{ suggestions }` using suggestion engine and unused capabilities.
- **File:** `components/intelligence/SuggestedActions.tsx`
  - Render suggestions; emit selected action to chat.

**Why**
- Moves from generic to intent‑aware guidance.

### 4) Shared session context

**What exists**
- No central store. Client keeps `usedCaps` locally.

**Add**
- **File:** `lib/context/context-storage.ts`
  - `store(sessionId, payload)`, `get(sessionId)`, `update(sessionId, patch)`; backs to Supabase.
- **File:** `lib/context/context-manager.ts`
  - Build merged snapshot: lead, company, person, role, intent, capabilities, tool outputs.
- **File:** `lib/context/context-schema.ts`
  - Zod schemas for the above.
- **DB:** part of migration below.

**Why**
- All components read/write the same source of truth.

### 5) Capability tracking (0/16 → 16/16)

**What exists**
- Client‑side `usedCaps` only.

**Add**
- **DB table:** `capability_usage(session_id, capability_name, usage_count, usage_data, created_at)`.
- **Server hook:** when a capability runs (ROI, doc, image, url, search, etc.), write a row and update a cached set on the session.
- **UI:** Show progress using server snapshot (not only client state).

**Why**
- Enables progressive discovery and prevents repeat suggestions.

### 6) Summary + PDF pipeline

**What exists**
- No generator; admin expects `conversation_summary` and `consultant_brief` but nothing produces them.

**Add**
- **File:** `lib/summary-generator.ts`
  - `generatePersonalizedSummary(sessionId, context)`: returns `{ consultant_brief, conversation_summary, intent_type, capability_insights, roi_block? }`.
- **File:** `lib/pdf-generator.ts`
  - `generatePDF(summary, context)`: return `pdfUrl` (store in object storage).
- **File:** `app/api/generate-summary/route.ts`
  - POST `{ sessionId }` → gather context → call summary + PDF → persist to DB → return `{ pdfUrl, consultant_brief, conversation_summary, intent_type }`.
- **File:** `app/api/send-summary-email/route.ts`
  - POST `{ email, pdfUrl, brief }` → send.
- **UI:** `AIEChat.tsx` add a “Finish & Email Summary” action that hits `generate-summary` then `send-summary-email`.

**Why**
- Produces the two admin fields you need and the final deliverable for the user.

### 7) Admin dashboard (keep it brief)

**What exists**
- `components/admin/LeadsList.tsx` modal shows `conversation_summary` and `consultant_brief`.

**Add / modify**
- **API:** `app/api/admin/leads/route.ts` must select `conversation_summary`, `consultant_brief`, `intent_type`, `ai_capabilities_shown`.
- **UI:** Add a badge/column for `intent_type` = Consulting/Workshop. Do not fetch or render full transcripts here.

**Why**
- You get the exact follow‑up overview you asked for, nothing more.

### 8) Database migrations (minimum)

**File:** `supabase/migrations/2025XXXX_conversational_intelligence.sql`

```sql
create table if not exists conversation_contexts (
  session_id text primary key,
  email text not null,
  name text,
  company_url text,
  company_context jsonb,
  person_context jsonb,
  role text,
  role_confidence numeric,
  intent_data jsonb,
  ai_capabilities_shown text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists intent_classifications (
  id uuid primary key default gen_random_uuid(),
  session_id text references conversation_contexts(session_id),
  intent text,
  confidence numeric,
  slots jsonb,
  created_at timestamptz default now()
);

create table if not exists capability_usage (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  capability_name text,
  usage_count int default 1,
  usage_data jsonb,
  created_at timestamptz default now()
);

alter table lead_summaries add column if not exists consultant_brief text;
alter table lead_summaries add column if not exists conversation_summary text;
alter table lead_summaries add column if not exists intent_type text;
```

### 9) Two paths: Consulting vs Workshop

**Intent handling**
- If `intent_type = consulting`: prioritise ROI, Document Analysis, Workflow Audit, Code/Blueprint. Summary includes pain points, ROI, next steps, call scheduling.
- If `intent_type = workshop`: prioritise Screen Share, Workshop Booking, Translate, Demo flows. Summary includes training topics, readiness, next steps, booking.

**Why**
- Different outcomes require different tool suggestions and summary content.

### 10) Acceptance tests

- GREETING uses company name when present.
- Role greeting only if `confidence ≥ 0.7`.
- Intent classified within 1 turn.
- Suggestions ≤ 3 and exclude already used capabilities.
- No external calls when `INTEL_PROVIDER=mock`.
- Summary endpoint returns `consultant_brief` + `conversation_summary` + `intent_type` and a `pdfUrl`.

### 11) Order of work

1) DB migration → 2) consent + session-init + lead-research → 3) context greeting in `AIEChat` → 4) intent endpoint → 5) suggestions endpoint + `SuggestedActions.tsx` → 6) capability tracking → 7) summary + PDF + email → 8) admin columns → 9) tests.

### 12) Validity

Yes, these tasks are required given the current repo. The TC Card does not trigger research, there is no shared context, no intent detection, and no summary generator. This plan fixes those gaps.













What each API should power
	•	Google Search Grounding → your lead research provider and on-demand “grounded” answers inside the chat and Live sessions. Use the google_search tool on generateContent (not the legacy google_search_retrieval). Handle groundingMetadata for citations in UI.  ￼
	•	Embeddings → your session memory / RAG layer for company facts, tool outputs, and reusable insights. Use gemini-embedding-001 via embedContent. Pick 768 or 1536 dims unless you have a reason to go higher.  ￼
	•	Live Tools → your Voice Chat capability with real function calling and Google Search as a tool in realtime. Use the Live API with tools: googleSearch, functionDeclarations, codeExecution where needed. For web clients, mint ephemeral tokens server-side and pass them to the browser.  ￼

Note: Google’s terms require showing Search suggestions metadata when you enable grounding; use groundingMetadata.searchEntryPoint and show citations. Also, Search Grounding is billed when you include the tool. Plan budget guards.  ￼

⸻

Drop-in file wiring (paths match your plan)

1) Google Search Grounding provider

File: lib/intelligence/providers/search/google-grounding.ts

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export type GroundedAnswer = {
  text: string;
  citations: { uri: string; title?: string }[];
  raw: any;
};

export async function groundedAnswer(query: string): Promise<GroundedAnswer> {
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config: { tools: [{ googleSearch: {} }] }, // current tool name
  });
  const text = res.text ?? "";
  const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const citations = chunks
    .map((c: any) => c.web)
    .filter(Boolean)
    .map((w: any) => ({ uri: w.uri, title: w.title }));
  return { text, citations, raw: res };
}

Why: single provider the orchestrator can call for company/person research and for grounded answers. The googleSearch tool is the current one; the legacy google_search_retrieval is only for 1.5 models.  ￼

2) Lead research uses Grounding

File: lib/intelligence/lead-research.ts
	•	Call groundedAnswer() with prompts like:
	•	“Summarize company at {domain}. Return: name, industry, size, HQ, notable products. Include URLs.”
	•	“Find current role and seniority for {name} at {company}.”
	•	Store normalized results in conversation_contexts.company_context/person_context.

File: app/api/intelligence/lead-research/route.ts
	•	Accept { sessionId, email, name?, companyUrl?, provider?: 'google'|'mock' }.
	•	When provider='google', call the provider above, persist, return { company, person, role, scores }.

3) Embeddings for memory/RAG

File: lib/embeddings/gemini.ts

import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function embedTexts(texts: string[]) {
  const r = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: texts,
  });
  return r.embeddings.map(e => e.values as number[]);
}

DB (pgvector) migration minimal:
	•	documents_embeddings(id uuid pk, session_id text, kind text, text text, embedding vector(1536))
	•	create index on documents_embeddings using ivfflat (embedding vector_cosine_ops);
	•	Use 768/1536 dims per doc guidance; MRL supports multiple sizes.  ￼

Where to call:
	•	After lead-research, embed the company/person summary.
	•	After tools run (ROI, doc analysis), embed key findings.
	•	Use cosine search to pull top k facts into prompts.

4) Live API for Voice Chat + tools

File: app/api/live/token/route.ts (server)
	•	Create ephemeral token using the Live API token service and return it to the client.  ￼

Client hook: hooks/useLiveSession.ts (new)
	•	Fetch ephemeral token from /api/live/token.
	•	Connect with:

import { GoogleGenAI, Modality } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: ephemeralToken, apiVersion: "v1alpha" }); // if required by SDK version
const session = await ai.live.connect({
  model: "gemini-live-2.5-flash-preview",
  config: {
    responseModalities: [Modality.TEXT],
    tools: [
      { googleSearch: {} },
      { functionDeclarations: [/* your functions */] },
      // { codeExecution: {} } if needed
    ],
  },
  callbacks: { onmessage: handleMessage, onerror, onopen, onclose },
});

Why: secure client access (short-lived), real voice sessions, tool calls, and grounded answers during the call.  ￼

5) Wire it into your orchestrator

File: lib/intelligence/conversational-intelligence.ts
	•	Inject providers:

constructor(deps:{ providers:{ search:{ groundedAnswer:(q:string)=>Promise<GroundedAnswer> }, embed:{ embedTexts:(t:string[])=>Promise<number[][]> }}})

	•	initSession() → runs lead-research with grounding, saves context, optionally embeds summaries.
	•	suggestTools() → can choose “Run grounded search on X” when confidence low or data stale.

6) UI changes to show citations

File: components/intelligence/SuggestedActions.tsx
	•	When an action produces grounded text, render inline citations using groundingMetadata.groundingSupports/groundingChunks as per doc examples.  ￼

⸻

Config and guardrails
	•	Models
	•	Search grounding: gemini-2.5-flash or 2.5-pro for longer/safer outputs.  ￼
	•	Live sessions: gemini-live-2.5-flash-preview (check access) with tools enabled.  ￼
	•	Embeddings: gemini-embedding-001 (June 2025 update; MRL dims).  ￼
	•	Costs
	•	Grounding is billed per request that includes the tool. Budget with rate limits and a “grounding needed?” toggle in your provider.  ￼
	•	TOS
	•	When you use Grounding, show the search suggestions UI (searchEntryPoint) and source attributions per the terms.  ￼
	•	Security
	•	Use ephemeral tokens for Live API in browser; do not ship your API key to the client.  ￼

⸻

Minimal tasks to add now
	1.	Create lib/intelligence/providers/search/google-grounding.ts and switch lead-research to use it.
	2.	Add lib/embeddings/gemini.ts and a pgvector table; start embedding company/person summaries and tool insights.
	3.	Add /api/live/token and a useLiveSession hook; enable Live tools with googleSearch and your function calls.
	4.	In AIEChat.tsx, when you render grounded answers, display citations and the Search widget from groundingMetadata.
	5.	Add a server flag: GEMINI_GROUNDING_ENABLED=true/false, EMBED_DIM=768|1536, LIVE_ENABLED=true/false.

This keeps your earlier plan intact and swaps the “back end” to Google’s APIs where they fit best.

## Appendix: Phase 1–3 Implementation Notes (2025-08-10)

### Unified Session Header
- Use a single header key on client requests: `x-intelligence-session-id: <sessionId>`
- Server init route prefers body `sessionId`, then `x-intelligence-session-id`.
- Legacy `x-demo-session-id` removed (transition complete).

### Phase 1 (Context Online)
- Idempotent `POST /api/intelligence/session-init` stores lead identifiers and runs lead research once per session.
- `GET /api/intelligence/context?sessionId=...` returns a stable snapshot; ETag/304 and in-memory rate limits in place.
- Client: TTL + in-flight de-dupe fetch; no polling; greeting uses context with role-confidence guard.

### Phase 2 (Intent + Suggestions)
- `POST /api/intelligence/intent`: classify `consulting|workshop|other`, persist to `conversation_contexts.intent_data`.
- `POST /api/intelligence/suggestions`: returns ≤3 suggestions based on role/industry/intent and unused capabilities.
- Client: first user message posts intent; `SuggestedActions` renders and refreshes on capability usage.
- Suggestion engine includes “Finish & Email Summary” (capability: `exportPdf`) when intent is consulting.

### Capability Tracking Contract
- Server is the source of truth. Record usage via `recordCapabilityUsed(sessionId, capabilityName, usageData?)`.
- Instrumented tools:
  - `search` (lead-research)
  - `translate` (/api/translate)
  - `exportPdf` (/api/export-summary)
- UI progress chip reads `context.capabilities.length`.

### Admin
- `GET /api/admin/leads?period=...&search=...&intent=consulting|workshop|other|all` filters by `intent_type`.
- UI shows `intent_type` badge and capability chips; includes an intent filter dropdown.

### Tests (essentials)
- Unit: intent detector, suggestion engine.
- API: admin leads intent filter (mocked auth + supabase client).
- E2E: intelligence flow (consent → first message → suggestions clickable). Session persistence check can use export API to assert capability progress via context API.




@https://ai.google.dev/gemini-api/docs/live-guide 

@https://ai.google.dev/gemini-api/docs/embeddings 
@https://ai.google.dev/gemini-api/docs/live-tools 
@https://ai.google.dev/gemini-api/docs/google-search 




You’re right. Too much drift. Lock it down. Here’s a tight plan to finish Phase 1–2, make all 16 tools work, and keep context shared without back-and-forth.

Phase hard stop
	•	No new paths. Only files already listed in Conversational_intelligent.md.
	•	Fixed contracts. Requests/responses exactly as in that doc.
	•	Definition of done per phase. If a checkbox is unchecked, no merge.

Stabilize Phase 1–2

Phase 1 (context online) — Do now
	•	DB migration shipped.
	•	/api/consent → /api/intelligence/session-init runs once.
	•	/api/intelligence/lead-research writes conversation_contexts.
	•	/api/intelligence/context returns a stable snapshot.
	•	UI: AIEChat greets from context. No polling. One fetch per TTL. ETag + 304 in place.
	•	Rate limit and idempotency on all four endpoints.

Acceptance
	•	Fresh session: 1× context 200 then 304s inside TTL.
	•	Greeting includes company; role only if confidence ≥ 0.7.
	•	No duplicate consent calls.

Phase 2 (intent + suggestions)
	•	/api/intelligence/intent: classify consulting|workshop|other with confidence and slots. Persist.
	•	/api/intelligence/suggestions: max 3 actions based on role, industry, intent, unused caps.
	•	SuggestedActions.tsx renders actions; selecting one triggers the right tool.

Acceptance
	•	First user message → intent stored.
	•	Suggestions change when a capability gets used.

One runtime contract for all tools

Every tool must follow this. No exceptions.

// lib/types/intelligence.ts (add)
export interface ToolRunInput {
  sessionId: string
  tool: 'roi'|'doc'|'image'|'screenshot'|'voice'|'screenShare'|'webcam'|'translate'|'search'|'urlContext'|'leadResearch'|'meeting'|'exportPdf'|'calc'|'code'|'video2app'
  payload?: any
}
export interface ToolRunResult {
  ok: boolean
  output?: any          // normalized, compact
  error?: string
  citations?: { uri:string; title?:string }[]
}

All tool handlers must:
	1.	Do work (or mock)
	2.	Update context minimal keys
	3.	Record usage
	4.	Return normalized result + citations (if any)

// lib/context/capabilities.ts
import { supabase } from '@/lib/supabase'
export async function recordCapabilityUsed(sessionId: string, cap: string, output?: any) {
  await supabase.from('capability_usage').insert({
    session_id: sessionId,
    capability_name: cap,
    usage_data: output ? { size: JSON.stringify(output).length } : null,
  })
  // dedup list on session row
  await supabase.rpc('append_capability_if_missing', { p_session_id: sessionId, p_capability: cap })
}

export async function attachToolOutput(sessionId: string, cap: string, output: any) {
  await supabase.from('conversation_contexts')
    .update({ company_context: supabase.sql`company_context`, // leave as-is
              person_context: supabase.sql`person_context`,
              intent_data: supabase.sql`intent_data`,
              // store under a compact tool_outputs object
              // NOTE: implement as a jsonb merge in SQL or do it in app layer
            })
    .eq('session_id', sessionId)
}

Add a Postgres function for dedup:

-- supabase/migrations/... in same migration
create or replace function append_capability_if_missing(p_session_id text, p_capability text) returns void as $$
begin
  update conversation_contexts
  set ai_capabilities_shown = case
    when not ai_capabilities_shown @> array[p_capability]
    then array_cat(ai_capabilities_shown, array[p_capability])
    else ai_capabilities_shown
  end
  where session_id = p_session_id;
end; $$ language plpgsql;

Capability coverage matrix

Bind UI to server snapshot context.capabilities. Do not increment locally.

Capability	Event key	API/handler
ROI Calculator	roi	app/api/tools/roi/route.ts
Document Analysis	doc	app/api/tools/doc/route.ts
Image Analysis	image	app/api/tools/image/route.ts
Screenshot Analysis	screenshot	app/api/tools/screenshot/route.ts
Voice Chat	voice	Live API wrapper; record on connect
Screen Share	screenShare	app/api/tools/screen/route.ts
Webcam Capture	webcam	app/api/tools/webcam/route.ts
Translate	translate	app/api/tools/translate/route.ts
Google Search Grounding	search	lib/intelligence/providers/search/google-grounding.ts used by lead-research and a /api/tools/search wrapper
URL Context	urlContext	app/api/tools/url/route.ts
Lead Research	leadResearch	app/api/intelligence/lead-research/route.ts
Book Meeting	meeting	app/api/tools/meeting/route.ts
Export PDF	exportPdf	app/api/generate-summary/route.ts then send-summary-email
Custom Calculation	calc	app/api/tools/calc/route.ts
Code/Blueprint	code	app/api/tools/code/route.ts
Video → App	video2app	app/api/video-to-app/route.ts

Each handler:
	•	validates { sessionId }
	•	performs work or mock
	•	recordCapabilityUsed(sessionId, '<key>', output)
	•	updates context tool output under a compact tool_outputs.<key>
	•	returns { ok, output, citations? }

Citations UI

You already added components/chat/CitationDisplay.tsx. Use it under assistant messages. Ensure server returns citations for search-grounded outputs. That satisfies attribution and makes it visible.

Cost control baseline
	•	UI: in-flight dedupe + TTL + ETag 304. Done.
	•	Server: rate limit + idempotency keys. Done for context. Replicate for tools.
	•	Provider flags: INTEL_PROVIDER=mock|google, GROUNDING_ENABLED=true|false.
	•	Strict “one caller” rule: only the chat container loads context.

Stop Cursor from inventing files
	•	Scaffold all Phase 1–2 files now as empty stubs with TODO comments. Then assistants will edit, not invent.
	•	Pre-commit guard: block new files outside allowed paths during Phase 1–2.

.husky/pre-commit:

#!/usr/bin/env bash
set -e
ALLOWED=$(cat phase-allowed-paths.txt)
CHANGED=$(git diff --cached --name-only)
for f in $CHANGED; do
  echo "$ALLOWED" | grep -qx "$f" || { echo "Blocked: $f"; exit 1; }
done

phase-allowed-paths.txt should list only Phase 1–2 files.
	•	PR template with checkboxes:
	•	No new paths
	•	Contracts unchanged
	•	Unit + API tests green
	•	E2E “intelligence-flow” green

Tests that must pass before merge

Unit
	•	role-detector
	•	intent-detector
	•	suggestion-engine

API
	•	session-init persist once with idempotency
	•	lead-research writes context
	•	intent stores classification
	•	suggestions exclude used caps

E2E (Playwright)
	•	“Consent → session-init → greeting with company”
	•	“First user message → intent stored”
	•	“Run Search tool → 1/16”
	•	“Refresh → stays 1/16”
	•	“Grounded answer shows citations chips”

Today’s cut-through list
	1.	Freeze Phase 1–2 paths in phase-allowed-paths.txt and enable the pre-commit hook.
	2.	Scaffold missing Phase 1–2 files as empty stubs.
	3.	Ensure /api/intelligence/context has ETag + rate headers. Client sends If-None-Match. You did this.
	4.	Implement recordCapabilityUsed and call it from search + one more tool. Bind UI to server capabilities.
	5.	Add SuggestedActions.tsx and wire /api/intelligence/suggestions.
	6.	Add one Playwright test: Search marks 1/16, shows citations, persists after reload.

