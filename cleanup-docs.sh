#!/bin/bash

# Create archive directory
mkdir -p docs/archive

# Move outdated/completed documentation
echo "🗄️  Archiving outdated documentation..."

# Cleanup plans (work supposedly done)
mv DUPLICATE_CLEANUP_PLAN.md docs/archive/ 2>/dev/null
mv DUPLICATE_CLEANUP_STATUS.md docs/archive/ 2>/dev/null
mv COMPONENT_CLEANUP_PLAN.md docs/archive/ 2>/dev/null
mv BRANCH_EVALUATION_PLAN.md docs/archive/ 2>/dev/null

# Old branch documentation (if main branch workflow)
mv README-WEBAPP.md docs/archive/ 2>/dev/null
mv README-AI-CHAT.md docs/archive/ 2>/dev/null

# Redundant/outdated guides
mv CODEBASE_REVIEW_FIXES.md docs/archive/ 2>/dev/null
mv "__Complete AI chat mplementation Guide for fbc.md" docs/archive/ 2>/dev/null
mv AI_Functions_APIs_Documentation.md docs/archive/ 2>/dev/null

echo "✅ Archived 9 outdated documents"

# Keep these active docs:
echo -e "\n📚 Keeping active documentation:"
echo "  - README.md (main docs)"
echo "  - CHANGELOG.md (version history)"
echo "  - AI_UNIFICATION_SUMMARY.md (current architecture)"
echo "  - GEMINI_LIVE_API_STATUS.md (active feature)"
echo "  - GEMINI_LIVE_API_IMPLEMENTATION_GUIDE.md (active feature)"
echo "  - file-tree.md (useful reference)"
echo "  - DOCUMENTATION_AUDIT.md (this analysis)"

echo -e "\n🎯 Next steps:"
echo "  1. Update README.md to reflect current state"
echo "  2. Actually delete those duplicate -live.tsx files"
echo "  3. Merge or close old feature branches"