# Gemini Live – Ephemeral Client Access Tokens Enablement Evidence (fbconsulting-2025)

## 1) Project and Environment
- Project ID: `fbconsulting-2025`
- Primary account: `bayatfarzad@gmail.com`
- Enabled APIs (gcloud): `generativelanguage.googleapis.com`, `aiplatform.googleapis.com`, plus standard services
- Local dev topology:
  - Next.js app (port `3000`)
  - WebSocket bridge `server/live-server.ts` (port `3001`)
  - Google AI Studio sample app `live-audio (5)` via Vite (port `5173`)
- SDKs in use:
  - App/Server: `@google/genai` ≈ `1.13.x` (per lockfile)
  - Google sample: `@google/genai` `0.9.x`
- Live API usage is with `apiVersion: 'v1alpha'`

## 2) Models under test (request enablement for client tokens)
- `gemini-2.5-flash-preview-native-audio-dialog`
- `gemini-2.0-flash-live-001`
- `gemini-live-2.5-flash-preview`

Region request: enable in `us-central1` (and confirm any other supported regions).

## 3) Summary of behavior
- Direct-key browser connection works (Google AI Studio sample). Real-time voice chat succeeds end-to-end.
- Ephemeral client token flow:
  - Token minting via server succeeds (`authTokens.create`).
  - Browser Live WS connect using that token opens and then closes immediately with a generic/unknown session error.

Conclusion: project likely lacks entitlement for “ephemeral client access tokens” for the Live models/region.

## 4) Minimal reproducible steps

### A. Working (direct key in browser)
1. Run the AI Studio sample: `live-audio (5)`
2. `.env.local` contains `GEMINI_API_KEY=***` (browser key)
3. Start: `pnpm dev` → open `http://localhost:5173/`
4. Click mic. Conversation works; audio in/out OK (16kHz in, 24kHz out). Model used: `gemini-2.5-flash-preview-native-audio-dialog`.

### B. Failing (ephemeral token from our server)
1. Mint token:
   - Endpoint: `POST /api/live/token`
   - Server uses `@google/genai` with `apiVersion: 'v1alpha'`.
   - Token returned (fields vary by SDK: `token` | `clientToken` | `value` | `name`).
2. Client connects with:
   - `ai.live.connect({ apiKey: <ephemeral>, apiVersion: 'v1alpha', model: <one of the models above>, config: { responseModalities: ['AUDIO'], mediaResolution: 'MEDIUM', speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' }}}}})`.
3. Result: WS opens then immediately closes. Console shows “Session error: unknown”. No audio.

## 5) Evidence to attach (files/logs)
- HAR (Chrome DevTools → Network → Preserve log → reproduce → Export HAR).
- Browser console log (txt).
- Server logs (txt):
  - `/tmp/next.log` (Next.js)
  - `/tmp/ws_direct.log` (WS proxy, if used)
- gcloud info (txt):
  - `gcloud config get-value project` → `fbconsulting-2025`
  - `gcloud services list --enabled` includes `generativelanguage.googleapis.com`
- Timestamps of attempts and model IDs used.

Suggested filename: `fbconsulting-2025-gemini-live-ephemeral-evidence-YYYYMMDD.zip`.

## 6) Server endpoint for tokens (for reviewer reference)
- Path: `app/api/live/token/route.ts`
- Behavior: server calls `ai.authTokens.create` and returns short-lived token; client uses it to open Live (`v1alpha`).

## 7) Request to Google
- Enable “ephemeral client access tokens” for Gemini Live (v1alpha) on project `fbconsulting-2025`.
- Allow the models in Section 2 for client-token usage.
- Confirm supported regions (request `us-central1`) and set Live session/client-token quotas.
- Confirm immediate-close is due to missing entitlement rather than misconfiguration.

## 8) Security posture
- No long‑lived API keys in browsers for production.
- Dev-only direct-key toggle for debugging.
- Production path: server proxy and/or ephemeral tokens post‑enablement with rate limiting, logging, and budgets.

Prepared for Google Cloud Support.
