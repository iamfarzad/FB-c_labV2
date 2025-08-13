# Production Troubleshooting Guide

## 🚨 AI Functions Not Working in Production

### Quick Diagnosis Commands

```bash
# Test production endpoints
pnpm tsx scripts/diagnose-production-issues.ts https://your-app.vercel.app

# Check Vercel logs
vercel logs --app=your-app-name

# Check environment variables
vercel env ls
```

### Common Issues & Fixes

#### 1. Missing Environment Variables ❌
**Symptoms**: "Service configuration error", "GEMINI_API_KEY not configured"

**Fix**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables for **ALL environments** (Production, Preview, Development):
   - `GEMINI_API_KEY=your_actual_gemini_key`
   - `NEXT_PUBLIC_SUPABASE_URL=your_supabase_url`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key`
3. Redeploy: `vercel --prod`

#### 2. Function Timeouts ⏱️
**Symptoms**: Functions timing out, 504 errors

**Fix**: Already configured in `vercel.json`:
- Gemini Live: 45s timeout
- Image Analysis: 30s timeout  
- Video-to-App: 60s timeout

#### 3. CORS Issues 🌐
**Symptoms**: Preflight errors, CORS blocked requests

**Fix**: Already added OPTIONS handlers and CORS headers

#### 4. Import/Module Issues 📦
**Symptoms**: "Cannot resolve module", build errors

**Fix**: 
- Check all imports use correct paths
- Ensure all dependencies are in `package.json`
- Run `pnpm build` locally first

### Testing Individual Functions

#### Test Gemini Live (Voice)
```bash
curl -X POST https://your-app.vercel.app/api/gemini-live \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello","enableTTS":true,"voiceName":"Puck"}'
```

#### Test Image Analysis
```bash
curl -X POST https://your-app.vercel.app/api/analyze-image \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==","type":"webcam"}'
```

#### Test Video-to-App
```bash
curl -X POST https://your-app.vercel.app/api/video-to-app \
  -H "Content-Type: application/json" \
  -d '{"videoUrl":"https://www.youtube.com/watch?v=test","requirements":"Simple test"}'
```

### Vercel Dashboard Checks

1. **Functions Tab**: Check for failed executions
2. **Analytics Tab**: Look for 5xx errors
3. **Settings → Environment Variables**: Verify all keys are set
4. **Deployments**: Check build logs for errors

### Emergency Rollback

If issues persist:
```bash
# List recent deployments
vercel ls

# Rollback to working version
vercel rollback <deployment-url>
```

## 📞 Support

If issues persist after following this guide:
1. Run the diagnostic script and share results
2. Check Vercel function logs for specific errors
3. Test locally with `pnpm dev` to confirm local functionality
