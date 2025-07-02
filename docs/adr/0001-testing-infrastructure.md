# ADR-0001: Testing Infrastructure

## Status: Accepted
## Date: 2025-01-02

## Context
Bot-generated PR `fix/ai-service-tests-and-logic` included test fixes for UnifiedAIService, but we've since refactored and the specific tests are obsolete. The PR was created by google-labs-jules bot to fix failing tests.

## Decision  
- Cherry-picked testing infrastructure (vitest, React Testing Library) from commit a3f0bc2
- Discarded obsolete test files for UnifiedAIService that no longer exists
- Kept example component test (button.test.tsx) as template
- Kept vitest.setup.ts for testing configuration

## Consequences
- We now have testing infrastructure ready for future tests
- Need to write new tests for current implementation
- Avoided merge conflicts and technical debt from obsolete code
- Established pattern for handling bot-generated PRs: extract value, discard obsolete parts

## Implementation
```bash
# Cherry-picked with -n flag to stage changes selectively
git cherry-pick -n a3f0bc2

# Reset files we didn't want
git reset HEAD lib/ai/unified-ai-service.test.ts lib/ai/unified-ai-service.integration.test.ts

# Committed only valuable parts
git commit -m "feat: Add testing infrastructure from bot PR"

# Cleaned up remote branch
git push origin --delete fix/ai-service-tests-and-logic
``` 