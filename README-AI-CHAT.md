# AI Chat Utils

This branch contains all AI chat functionality and related utilities.

## Features
- Chat interface
- Voice input/output
- API integrations (Gemini, etc.)
- Chat history and context management

## Getting Started
1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables (copy .env.example to .env.local)
4. Run the development server: `pnpm dev`

## Branch Rules
- Must be tested before merging to `main`
- Should be self-contained with minimal web app dependencies
- Include proper error handling and logging

## Testing
Run the following before merging to `main`:
\`\`\`bash
pnpm test:chat
# Or run specific tests
pnpm test:chat:api
pnpm test:chat:ui
\`\`\`

## Merging to Main
1. Ensure all tests pass
2. Update documentation if needed
3. Create a pull request to `main`
4. Get code review approval
5. Merge when ready

## Dependencies
- Gemini API
- Voice processing libraries
- Any other AI/ML dependencies
