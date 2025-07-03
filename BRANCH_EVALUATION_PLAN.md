# 🔬 Branch Evaluation Plan - Senior Dev Approach

## 📊 Branch Categories & Risk Assessment

### 🔥 HIGH VALUE - Recent Cursor Work (Evaluate First)
1. **cursor/analyze-backend-ai-functions-and-api-1158** 
   - **Features**: Gemini Live API, WebSocket streaming, voice/webcam/screen
   - **Risk**: Medium (5 commits ahead, 12 behind)
   - **Evaluation**: Check if Live API features work, conflicts with current system
   
2. **cursor/analyze-codebase-and-implement-features-incrementally-2fe0**
   - **Features**: Modular AI handlers, PDF generation, document analysis
   - **Risk**: Medium (2 commits ahead, 15 behind) 
   - **Evaluation**: Check if modular approach improves current unified service
   
3. **cursor/analyze-codebase-for-ui-and-api-consistency-f8e9**
   - **Features**: UI refactor, API integration improvements
   - **Risk**: Low (1 commit ahead, 17 behind)
   - **Evaluation**: Check UI improvements vs current design

### 🤖 BOT GENERATED - Jules (Delete)
4. **jules_wip_3053795181967652231**
   - **Action**: DELETE (bot-generated, 74 commits behind)
   - **Reason**: Same pattern as fix/ai-service-tests-and-logic we already cleaned up

### 💀 STALE BRANCHES - Mass Delete
5-11. **All feature/* and refactor/* branches (33-75 commits behind)**
   - **Action**: DELETE ALL (completely obsolete)
   - **Reason**: Too far behind, functionality likely implemented in main

## 🔄 Systematic Evaluation Process

### Step 1: Test Current Main (DONE)
- [x] `pnpm test` passes
- [x] `pnpm dev` starts
- [ ] All features work in browser

### Step 2: Evaluate High-Value Branches (1 by 1)
For each cursor branch:

```bash
# 1. Create evaluation branch
git checkout -b eval/[branch-name] origin/[branch-name]

# 2. Try to start dev server
pnpm install
pnpm dev

# 3. Test core functionality
pnpm test
curl http://localhost:3000/api/ai -X POST -d '{"message":"test"}'

# 4. Document findings
echo "Branch: [name]" >> EVALUATION_RESULTS.md
echo "Status: [WORKS/BROKEN/CONFLICTS]" >> EVALUATION_RESULTS.md
echo "Features: [list]" >> EVALUATION_RESULTS.md
echo "---" >> EVALUATION_RESULTS.md

# 5. Cleanup
git checkout main
git branch -D eval/[branch-name]
```

### Step 3: Cherry-Pick Valuable Features
After evaluation, for each WORKING branch:
- Identify specific valuable commits
- Cherry-pick individual features (not entire branch)
- Test after each cherry-pick
- Commit with clear messages

### Step 4: Mass Cleanup
```bash
# Delete all stale branches
git push origin --delete feat/new-sidebar-video-tool-page
git push origin --delete feature/ai-chat-utils  
git push origin --delete feature/ai-showcase-core-refactor
git push origin --delete feature/webapp-clean
git push origin --delete refactor/chat-api-and-utils
git push origin --delete refactor/unify-design-system
git push origin --delete jules_wip_3053795181967652231
```

## 🎯 Success Criteria

### Phase 1: Main Stable
- ✅ Dev server starts without errors
- ✅ All existing tests pass
- ✅ Core AI functionality works
- ✅ UI renders properly

### Phase 2: Feature Integration
- ✅ Each valuable feature tested in isolation
- ✅ No breaking changes to existing functionality
- ✅ New features documented
- ✅ Performance impact measured

### Phase 3: Clean Repository
- ✅ Only relevant branches remain
- ✅ Clear git history
- ✅ Updated documentation
- ✅ All tests passing

## ⚠️ Risk Mitigation

### Before Each Branch Evaluation:
1. **Backup main**: `git tag backup-main-$(date +%Y%m%d)`
2. **Clean workspace**: No uncommitted changes
3. **Document state**: Screenshot working features

### During Evaluation:
1. **Test in isolation**: Fresh node_modules for each branch
2. **Document everything**: What works, what breaks, what's valuable
3. **Small commits**: Cherry-pick individual features, not bulk merges

### Rollback Plan:
```bash
# If anything breaks main:
git reset --hard backup-main-[date]
git push origin main --force-with-lease
```

## 📈 Expected Timeline

- **Phase 1** (Main Stable): 30 minutes
- **Phase 2** (Evaluate 3 branches): 2-3 hours  
- **Phase 3** (Cleanup): 30 minutes
- **Total**: Half day of focused work

## 🎖️ Senior Dev Principles Applied

1. **Stability First**: Never compromise working main branch
2. **Systematic Approach**: Evaluate one thing at a time
3. **Document Everything**: Clear audit trail of decisions
4. **Risk Management**: Backups and rollback plans
5. **Value Focus**: Only integrate features that add real value
6. **Clean House**: Remove technical debt and clutter 