# Google Cloud Setup Guide for fbconsulting-2025

## ✅ What's Been Completed

### Google Cloud Project Setup
- ✅ **Project Created**: `fbconsulting-2025`
- ✅ **Billing Enabled**: Account `018EA2-8B96E7-5117D6`
- ✅ **APIs Enabled**: All required services activated
- ✅ **Credentials Created**: Application Default Credentials (ADC)

## 🔧 Environment Variables to Update

### 1. Update .env.local

Add these new variables to your `.env.local` file:

```bash
# NEW: Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS="/Users/farzad/.config/gcloud/application_default_credentials.json"
GOOGLE_CLOUD_PROJECT="fbconsulting-2025"

# Keep existing Gemini API keys as fallback (can remove later)
GEMINI_API_KEY="AIzaSyDBzOxFKqYGNpHCkEqzMtlpI4utmA2m6B4"
GEMINI_API_KEY_SERVER="AIzaSyDBzOxFKqYGNpHCkEqzMtlpI4utmA2m6B4"
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSyC77mmHQCmDsUSk86pP4IbGwtSjL-fa9qc"
```

### 2. Update Vercel Environment Variables

Go to your Vercel dashboard and add these environment variables:

#### Production Environment:
```bash
GOOGLE_APPLICATION_CREDENTIALS="/Users/farzad/.config/gcloud/application_default_credentials.json"
GOOGLE_CLOUD_PROJECT="fbconsulting-2025"
```

#### Development Environment:
```bash
GOOGLE_APPLICATION_CREDENTIALS="/Users/farzad/.config/gcloud/application_default_credentials.json"
GOOGLE_CLOUD_PROJECT="fbconsulting-2025"
```

## 🔑 API Authentication Methods

### Option 1: Application Default Credentials (Recommended)
Your application will automatically use the credentials file:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/Users/farzad/.config/gcloud/application_default_credentials.json"
```

### Option 2: Service Account Key (Alternative)
If you need a service account key instead:

1. **Create Service Account**:
   ```bash
   gcloud iam service-accounts create fbconsulting-app \
     --display-name="FB Consulting App Service Account"
   ```

2. **Grant Permissions**:
   ```bash
   gcloud projects add-iam-policy-binding fbconsulting-2025 \
     --member="serviceAccount:fbconsulting-app@fbconsulting-2025.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

3. **Create Key**:
   ```bash
   gcloud iam service-accounts keys create ~/fbconsulting-key.json \
     --iam-account=fbconsulting-app@fbconsulting-2025.iam.gserviceaccount.com
   ```

## 🚀 Deployment Steps

### 1. Update Local Environment
```bash
# Copy the new environment variables to .env.local
cp .env.local.new .env.local
```

### 2. Update Vercel Configuration
- Go to Vercel Dashboard
- Navigate to your project settings
- Add the new environment variables
- Redeploy your application

### 3. Test the Setup
```bash
# Test Google Cloud authentication
gcloud auth application-default print-access-token

# Test your application locally
pnpm dev
```

## 🔍 Verification Checklist

- [ ] Google Cloud project `fbconsulting-2025` is active
- [ ] Billing account is linked and enabled
- [ ] All required APIs are enabled
- [ ] Application Default Credentials are working
- [ ] Environment variables are updated
- [ ] Vercel environment variables are set
- [ ] Application can authenticate with Google Cloud

## 🛠️ Troubleshooting

### If Authentication Fails:
1. **Check credentials file**:
   ```bash
   ls -la ~/.config/gcloud/application_default_credentials.json
   ```

2. **Refresh credentials**:
   ```bash
   gcloud auth application-default login
   ```

3. **Verify project**:
   ```bash
   gcloud config get-value project
   ```

### If APIs Don't Work:
1. **Check enabled APIs**:
   ```bash
   gcloud services list --enabled
   ```

2. **Enable missing APIs**:
   ```bash
   gcloud services enable [API_NAME]
   ```

## 📞 Support

If you encounter issues:
1. Check the Google Cloud Console for error messages
2. Verify billing account status
3. Ensure all environment variables are set correctly
4. Test authentication locally before deploying

---

**Project Details:**
- **Project ID**: `fbconsulting-2025`
- **Billing Account**: `018EA2-8B96E7-5117D6`
- **Status**: Active and ready for use
