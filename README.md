## Chat Endpoints Overview

This project exposes separate chat endpoints for public and admin use:

- Public chat UI → `/api/chat`
  - Used by: `hooks/use-chat-state.ts`
  - Features: lead generation stages, optional URL context, optional Google Search, consent gate

- Admin chat UI → `/api/admin/chat`
  - Used by: `components/admin/AdminChatInterface.tsx` via `hooks/useAdminChat.ts`
  - Features: builds rich admin dashboard context via `lib/admin-context-builder.ts`, admin auth + rate limiting

- Mock chat (development only) → `/api/mock/chat`
  - Returns 404 outside development
  - Useful for UI testing without incurring AI costs

All AI generation uses the centralized config in `lib/gemini-config-enhanced.ts`. Aliases are supported so callers may use either canonical keys or aliases:

- Canonical: `chat`, `analysis`, `document`, `live`, `research`
- Aliases: `text_generation` → `chat`, `document_analysis` → `document`

# F.B/c AI

**Design System:** See [DESIGN.md](./DESIGN.md) for the canonical style guide and design token rules. All UI work must follow this guide.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/iamfarzads-projects/v0-fb-c-ai-clone)
[![Main Branch](https://img.shields.io/badge/Main%20Branch-Stable-brightgreen)](https://github.com/iamfarzad/FB-c_labV2/tree/main)
[![WebApp Branch](https://img.shields.io/badge/WebApp-Development-yellow)](https://github.com/iamfarzad/FB-c_labV2/tree/feature/webapp-clean)
[![AI Chat Branch](https://img.shields.io/badge/AI%20Chat-Development-blue)](https://github.com/iamfarzad/FB-c_labV2/tree/feature/ai-chat-utils)

## Project Structure

### Main Branches

1. **`main`** - Production-ready code
   - Always stable and tested
   - Only merged from feature branches after review
   - Deployed to production

2. **`feature/webapp-clean`** - Web Application
   - Contains all web app features **except** AI chat
   - Focus on UI/UX, pages, and web app functionality
   - See [WebApp README](README-WEBAPP.md) for details

3. **`feature/ai-chat-utils`** - AI Chat Functionality
   - Complete AI chat implementation
   - Voice and text chat features
   - API integrations
   - See [AI Chat README](README-AI-CHAT.md) for details

## Development Workflow

1. **Create a feature branch** from the appropriate base branch:
   \`\`\`bash
   # For web app features
   git checkout -b feature/my-webapp-feature feature/webapp-clean

   # For AI chat features
   git checkout -b feature/my-chat-feature feature/ai-chat-utils
   \`\`\`

2. **Make your changes**

3. **Test thoroughly**
   - Run unit tests
   - Test in development environment
   - Verify no regressions

4. **Create a Pull Request** to the appropriate branch
   - Web app features → `feature/webapp-clean`
   - AI chat features → `feature/ai-chat-utils`

5. **After review and approval**, merge to the feature branch

6. **When ready for production**, create a PR from the feature branch to `main`

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/iamfarzad/FB-c_labV2.git
cd FB-c_labV2

# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys and configuration
```

### Running the Application

\`\`\`bash
# For web app development
git checkout feature/webapp-clean
pnpm dev

# For AI chat development
git checkout feature/ai-chat-utils
pnpm dev
\`\`\`

## Deployment

Main branch is automatically deployed to Vercel:

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/iamfarzads-projects/v0-fb-c-ai-clone)

LIVE_SERVER_PORT=3001 GEMINI_API_KEY=your_key_here ts-node server/live-server.ts

## Local Development Only

If you want to test Gemini Live AI features locally, you can run the custom WebSocket server:

\`\`\`
LIVE_SERVER_PORT=3001 GEMINI_API_KEY=your_key_here ts-node server/live-server.ts
\`\`\`

**Note:** This is for local development/testing only. In production (including Vercel), all real-time features are handled by Supabase. You do NOT need to run `server/live-server.ts` in production.

## Feature Flags

- Flags live in `lib/flags.ts` with safe defaults for dev
- Override via URL: `?ff=all` enables all; `?ff=roi_inline_form,-coach_v2` enables/disables specific flags
- Persist overrides in localStorage; can toggle in console using `setFlag(name, boolean)`
- Print active flags:

```bash
pnpm flags
```
