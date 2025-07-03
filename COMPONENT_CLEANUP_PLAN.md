# COMPONENT CLEANUP PLAN

## Current Mess:
- `/components/` - Main component library (KEEP)
- `/app/components/` - Duplicate UI components (DELETE)
- `/app/chat/components/` - Chat-specific components (MOVE)

## Action Plan:

### 1. DELETE Duplicates
\`\`\`bash
rm -rf app/components/
\`\`\`

### 2. MOVE Chat Components
\`\`\`bash
# Move chat components to main components directory
mv app/chat/components/* components/chat/
\`\`\`

### 3. UPDATE Imports
Replace all imports:
- `@/app/components/*` → `@/components/*`
- `@/app/chat/components/*` → `@/components/chat/*`

### 4. STANDARDIZE Structure
\`\`\`
components/
├── ui/           # Shadcn UI components
├── chat/         # Chat-specific components
├── home/         # Home page components
├── about/        # About page components
└── ...
\`\`\`

## Files to Update:
- All TypeScript files with component imports
- Update tsconfig paths if needed
- Update any build scripts

## Benefits:
- Single source of truth for components
- Cleaner imports
- Better maintainability
- Proper component organization
