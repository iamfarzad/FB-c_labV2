# 🚀 Vercel Deployment Cost Control Checklist

## ✅ **Pre-Deployment Verification**

### **1. Local Testing**
```bash
# Run cost monitoring
pnpm monitor-costs

# Run all tests
pnpm test:all

# Verify deployment readiness
pnpm pre-deploy
```

### **2. Environment Variables (Vercel Dashboard)**
Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
- `GEMINI_API_KEY` - Your Google Gemini API key
- `SUPABASE_URL` - Your Supabase project URL  
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

**⚠️ Important:** Set these for all environments:
- ✅ Production
- ✅ Preview  
- ✅ Development

### **3. Function Configuration (vercel.json)**
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30,        // 30s timeout (cost protection)
      "memory": 1024            // 1GB memory limit
    },
    "app/api/video-to-app/route.ts": {
      "maxDuration": 60,        // 60s for video processing
      "memory": 1024
    },
    "app/api/analyze-document/route.ts": {
      "maxDuration": 45,        // 45s for document processing
      "memory": 1024
    }
  }
}
```

## 🔍 **Post-Deployment Verification**

### **1. Automated Testing**
```bash
# Test deployment endpoints
VERCEL_URL=https://your-app.vercel.app pnpm verify-deployment
```

### **2. Manual Vercel Dashboard Checks**

#### **Functions Tab:**
- ✅ Check function invocation counts
- ✅ Look for any timeout errors
- ✅ Monitor memory usage patterns
- ✅ Check for any failed executions

#### **Analytics Tab:**
- ✅ Monitor request volume
- ✅ Check response times
- ✅ Look for any error spikes

#### **Usage Tab:**
- ✅ Function execution time
- ✅ Bandwidth usage
- ✅ Build minutes consumed

### **3. Cost Monitoring Endpoints**

Test these critical endpoints manually:

**Chat Endpoints (Token Limited):**
```bash
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "x-demo-session-id: test-session" \
  -d '{"message": "Test message for cost verification"}'
```

**Gemini Live (Rate Limited):**
```bash
curl -X POST https://your-app.vercel.app/api/gemini-live \
  -H "Content-Type: application/json" \
  -H "x-demo-session-id: test-session" \
  -d '{"prompt": "Brief test", "enableTTS": false}'
```

**Image Analysis (Throttled):**
```bash
curl -X POST https://your-app.vercel.app/api/analyze-image \
  -H "Content-Type: application/json" \
  -d '{"imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2Q==", "type": "webcam"}'
```

## 🚨 **Cost Protection Verification**

### **1. Token Limits Active**
- ✅ Chat: 2048 tokens max
- ✅ Enhanced Chat: 2048 tokens max  
- ✅ Gemini Live: 512 tokens max
- ✅ Image Analysis: 512 tokens max
- ✅ Document Analysis: 1536 tokens max
- ✅ Video Processing: 4096 tokens max

### **2. Rate Limiting Active**
- ✅ Duplicate call prevention (3s window)
- ✅ Daily usage limits enforced
- ✅ Session-based throttling

### **3. Model Optimization**
- ✅ Using `gemini-2.5-flash` (not expensive models)
- ✅ `gemini-2.5-flash-lite` for simple tasks
- ✅ Explicit "Veo 3" model blocking

### **4. Function Timeouts**
- ✅ 30s timeout for most functions
- ✅ 60s timeout for video processing
- ✅ 45s timeout for document processing

## 📊 **Monitoring Setup**

### **1. Vercel Function Logs**
Monitor these patterns in logs:
```
✅ Good: "🟠 Gemini API Called: {...}"
✅ Good: "✅ Text generation completed"
❌ Watch: "❌ Gemini TTS generation error"
❌ Alert: "🚫 Daily cost limit reached"
```

### **2. Google Cloud Billing (If Set Up)**
- Budget: 500 NOK monthly
- Alerts: 50%, 75%, 90%, 100%
- Services: Vertex AI API, Cloud Vision API

### **3. Weekly Review Checklist**
- [ ] Check Vercel function usage
- [ ] Review Google Cloud billing
- [ ] Monitor error rates in logs
- [ ] Verify token usage patterns
- [ ] Check for any new unauthorized API calls

## 🚀 **Deployment Commands**

### **Safe Deployment Flow:**
```bash
# 1. Pre-deployment checks
pnpm pre-deploy

# 2. Deploy to Vercel
vercel --prod

# 3. Post-deployment verification  
VERCEL_URL=https://your-app.vercel.app pnpm verify-deployment

# 4. Monitor for 24 hours
# Check Vercel dashboard and Google Cloud billing
```

## 🆘 **Emergency Procedures**

### **If Costs Spike:**
1. **Immediate:** Disable GEMINI_API_KEY in Vercel environment variables
2. **Check:** Vercel function logs for runaway processes
3. **Review:** Google Cloud billing for specific service costs
4. **Fix:** Identify and patch the source
5. **Re-enable:** Only after confirming the fix

### **If Functions Timeout:**
1. **Check:** Vercel function logs for timeout patterns
2. **Verify:** Token limits are being enforced
3. **Adjust:** Increase maxDuration if needed (carefully)
4. **Monitor:** Ensure costs don't increase

## ✅ **Final Verification**

- [ ] All environment variables set
- [ ] Function timeouts configured
- [ ] Token limits enforced in code
- [ ] Rate limiting active
- [ ] Expensive models blocked
- [ ] Monitoring scripts working
- [ ] Emergency procedures documented
- [ ] Team knows how to check costs

**🎉 Your Vercel deployment is cost-optimized and ready for production!**