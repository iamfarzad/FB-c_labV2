# Vercel Setup & Branch Protection Guide

## 🚀 **Project Configuration**

### **Project Details**
- **Project ID**: `prj_hcm6i4qba2sd6W0wp2IN1UDoODrO`
- **Project Name**: `v0-fb-c-ai-clone`
- **Vercel Account**: `iamfarzads-projects`
- **Framework**: Next.js 15.2.4

## 🔒 **Branch Protection Setup**

### **1. GitHub Repository Settings**

Go to your GitHub repository settings and configure:

#### **Branch Protection Rules**
- **Branch**: `main`
- **Require pull request reviews**: ✅ Enabled
- **Required approving reviews**: 1
- **Dismiss stale PR approvals**: ✅ Enabled
- **Require status checks**: ✅ Enabled
- **Require branches to be up to date**: ✅ Enabled
- **Restrict pushes that create files**: ✅ Enabled
- **Require linear history**: ✅ Enabled

#### **Required Status Checks**
- `deploy-preview` (for feature branches)
- `deploy-production` (for main branch)
- `security-check` (for all branches)

### **2. GitHub Secrets Setup**

Add these secrets to your GitHub repository:

```bash
# Required for GitHub Actions
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=team_hcm6i4qba2sd6W0wp2IN1UDoODrO
VERCEL_PROJECT_ID=prj_hcm6i4qba2sd6W0wp2IN1UDoODrO
```

### **3. Vercel Token Generation**

```bash
# Generate a new Vercel token
pnpm exec vercel login
pnpm exec vercel token create "GitHub Actions" --scope=team
```

## 🌿 **Branch Strategy**

### **Branch Types**

1. **`main`** - Production branch
   - Requires PR approval
   - Auto-deploys to production
   - Protected from direct pushes

2. **`develop`** - Development branch
   - Preview deployments
   - Integration testing
   - Auto-deploys to preview

3. **`staging`** - Staging branch
   - Pre-production testing
   - Preview deployments
   - Auto-deploys to preview

4. **`feature/*`** - Feature branches
   - Preview deployments
   - Individual feature testing
   - Auto-deploys to preview

## 🔄 **Deployment Flow**

### **Feature Development**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Creates PR → Triggers preview deployment
# PR approval → Merges to develop
```

### **Production Release**
```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main

# Triggers production deployment
# Requires approval in Vercel dashboard
```

## 🛡️ **Security Features**

### **1. Environment Variables**
- All sensitive data encrypted
- Different values per environment
- Automatic rotation support

### **2. API Protection**
- Mock endpoints disabled in production
- Rate limiting on all endpoints
- CORS protection enabled

### **3. Security Headers**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### **4. Automated Security Checks**
- Dependency vulnerability scanning
- Secret detection in code
- Security audit on every PR

## 📊 **Free Account Optimization**

### **Resource Limits**
- **Functions**: 12 serverless functions
- **Bandwidth**: 100GB/month
- **Build Minutes**: 6,000 minutes/month
- **Edge Functions**: 500,000 invocations/day

### **Cost Optimization**
- Mock API system prevents development costs
- Preview deployments use minimal resources
- Automatic cleanup of old deployments
- Efficient caching strategies

## 🔧 **Local Development**

### **Environment Setup**
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Enable mocking for development
echo "ENABLE_GEMINI_MOCKING=true" >> .env.local

# Start development server
pnpm dev
```

### **Testing**
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e
```

## 🚨 **Emergency Procedures**

### **Rollback Deployment**
```bash
# List recent deployments
pnpm exec vercel ls

# Rollback to previous deployment
pnpm exec vercel rollback <deployment-url>
```

### **Disable Mocking in Production**
```bash
# Set environment variable
pnpm exec vercel env add ENABLE_GEMINI_MOCKING production false
```

### **Emergency Hotfix**
```bash
# Create hotfix branch
git checkout -b hotfix/emergency-fix

# Make minimal changes
git commit -m "fix: emergency fix"

# Push and create PR
git push origin hotfix/emergency-fix
```

## 📈 **Monitoring & Analytics**

### **Vercel Analytics**
- Real-time performance monitoring
- Error tracking and alerting
- User behavior analytics
- Core Web Vitals tracking

### **Custom Monitoring**
- API response time monitoring
- Error rate tracking
- Cost monitoring for Gemini API
- Mock usage analytics

## 🔗 **Useful Commands**

```bash
# Deploy to preview
pnpm exec vercel --prod=false

# Deploy to production
pnpm exec vercel --prod=true

# List deployments
pnpm exec vercel ls

# View deployment logs
pnpm exec vercel logs <deployment-url>

# Check project status
pnpm exec vercel project inspect v0-fb-c-ai-clone
```

## 📞 **Support**

- **Vercel Documentation**: https://vercel.com/docs
- **GitHub Actions**: https://docs.github.com/en/actions
- **Project Issues**: Create issue in GitHub repository
- **Emergency Contact**: Use Vercel dashboard for urgent issues 