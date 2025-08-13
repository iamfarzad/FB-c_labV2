# Tomorrow Checklist – Gemini Live + App Debug

## 0) Ports and servers
- Ensure no port conflicts (3000/3001 rule).
```bash
lsof -ti tcp:3000 | xargs -r kill -9
lsof -ti tcp:3001 | xargs -r kill -9
```
- Start everything
```bash
pnpm dev:all   # if you use the combined script; otherwise:
pnpm dev       # Next.js on 3000
PORT=3001 LIVE_SERVER_PORT=3001 tsx --env-file=.env.local server/live-server.ts
```

## 1) Dev-only “direct key” tests (works today)
- Make sure `.env.local` has:
```ini
NEXT_PUBLIC_GEMINI_API_KEY="<YOUR_KEY>"
NEXT_PUBLIC_LIVE_MODEL=gemini-2.5-flash-preview-native-audio-dialog
```
- Open the isolated page:
  - Our test page: `http://localhost:3000/test/live-voice?direct=1`
  - Google sample (already running if started): `http://localhost:5173/`

## 2) Token mode repro (shows the issue)
- Use our test page without the direct flag:
  - `http://localhost:3000/test/live-voice`
- Expected bad behavior: WS opens then closes with “unknown”. This is the evidence Google needs.

## 3) Collect evidence (Chrome)
- Open DevTools (Cmd+Opt+I)
- Network tab → check “Preserve log” → reproduce token-mode issue → Right‑click → “Save all as HAR with content”
- Console tab → Clear → reproduce → Right‑click → “Save as…” (txt)
- Put both files into:
```
/Users/farzad/FB-c_labV2/evidence/<latest-folder>/
```
- The evidence folder/zip is already scaffolded here (newest timestamp):
```
/Users/farzad/FB-c_labV2/evidence/
```

## 4) Support request text (paste)
```
Please enable Gemini Live ephemeral client access tokens (v1alpha) for project fbconsulting-2025.
Models: gemini-2.5-flash-preview-native-audio-dialog, gemini-2.0-flash-live-001, gemini-live-2.5-flash-preview.
Region: us-central1 (confirm others). Set Live session/client-token quotas.
Direct-key browser works (Google sample). Token mint (authTokens.create) succeeds, but Live WS closes immediately with “unknown”.
APIs enabled: generativelanguage.googleapis.com, aiplatform.googleapis.com.
Evidence attached (HAR, console, server logs, gcloud info).
```

## 5) If Support UI blocks you
- Either purchase/attach a support plan and add role `roles/cloudsupport.admin` to your user on the billing account, or
- Use “Billing support” to create a case and ask routing to Gemini Live team, or
- Use the “Contact us” link in the banner and include a Google Drive link to the evidence zip.

## 6) Server‑proxy (safe prod path)
- Keep using `server/live-server.ts` for prod (no browser key). Confirm it’s running on 3001.
- Ensure `.env.local` has your server key:
```ini
GEMINI_API_KEY="<YOUR_SERVER_KEY>"
```

## 7) Commands quick ref
```bash
# Kill ports
lsof -ti tcp:3000 | xargs -r kill -9; lsof -ti tcp:3001 | xargs -r kill -9
# Start Next.js
pnpm dev
# Start WS bridge
PORT=3001 LIVE_SERVER_PORT=3001 tsx --env-file=.env.local server/live-server.ts
# Start Google sample (if needed)
cd "live-audio (5)" && pnpm dev --port 5173
```

## 8) What success looks like
- Direct mode (`?direct=1`) works end‑to‑end with voice.
- Token mode connects and stays open, produces audio; no immediate “unknown” close.

## 9) Optional
- When entitlement is granted, disable direct mode by removing `NEXT_PUBLIC_GEMINI_API_KEY` and keep token/server‑proxy only.
