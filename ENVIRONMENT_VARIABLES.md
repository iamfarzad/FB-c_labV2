# Environment Variables Configuration

This document provides comprehensive documentation for all environment variables required by the F.B Consulting AI Platform.

## Required Variables

These variables MUST be set for the application to function properly.

### Core AI Configuration

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | `AIza...` | [Google AI Studio](https://makersuite.google.com/app/apikey) |

### Database Configuration (Supabase)

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` | Supabase Dashboard > Settings > API |
| `SUPABASE_ANON_KEY` | Public anonymous key | `eyJ...` | Supabase Dashboard > Settings > API > anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) | `eyJ...` | Supabase Dashboard > Settings > API > service_role |

⚠️ **Security Warning**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or commit it to version control.

### WebSocket Server Configuration

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `NEXT_PUBLIC_LIVE_SERVER_URL` | WebSocket server URL | Development: `ws://localhost:3001`<br>Production: `wss://ws.example.com` | Deploy server to get URL |
| `LIVE_SERVER_PORT` | Port for WebSocket server | `3001` | Choose available port |

### Email Service (Resend)

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `RESEND_API_KEY` | Resend API key | `re_...` | [Resend Dashboard](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | Verified sender email | `F.B Consulting <noreply@fbconsulting.ai>` | Resend > Domains |

### Application Configuration

| Variable | Description | Example | Where to Get |
|----------|-------------|---------|--------------|
| `NEXT_PUBLIC_APP_URL` | Public application URL | Development: `http://localhost:3000`<br>Production: `https://fbconsulting.ai` | Your domain |
| `NODE_ENV` | Environment mode | `development` \| `production` \| `test` | Set based on environment |

## Optional Variables

These variables enhance functionality but have default values.

### Enhanced Features

| Variable | Description | Default | Purpose |
|----------|-------------|---------|---------|
| `GOOGLE_SEARCH_API_KEY` | Google Custom Search API | None | Web search in chat |
| `GOOGLE_SEARCH_ENGINE_ID` | Custom Search Engine ID | None | Web search context |

### Demo/Trial Configuration

| Variable | Description | Default | Purpose |
|----------|-------------|---------|---------|
| `DEMO_DAILY_TOKEN_LIMIT` | Daily token limit for demo users | `10000` | Cost control |
| `DEMO_PER_REQUEST_LIMIT` | Per-request token limit | `500` | Prevent abuse |
| `DEMO_MAX_MESSAGES_PER_SESSION` | Max messages per demo session | `50` | Session limits |

### Rate Limiting

| Variable | Description | Default | Purpose |
|----------|-------------|---------|---------|
| `RATE_LIMIT_WINDOW_MS` | Rate limit time window | `60000` (1 min) | Prevent spam |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `20` | API protection |

### Monitoring & Analytics

| Variable | Description | Default | Purpose |
|----------|-------------|---------|---------|
| `SENTRY_DSN` | Sentry error tracking | None | Error monitoring |
| `SENTRY_ENVIRONMENT` | Sentry environment tag | `development` | Error grouping |
| `LOGROCKET_APP_ID` | LogRocket session recording | None | User analytics |

### Development Tools

| Variable | Description | Default | Purpose |
|----------|-------------|---------|---------|
| `DEBUG` | Enable debug logging | `false` | Development debugging |
| `USE_MOCK_API` | Use mock API responses | `false` | Testing without API calls |
| `DISABLE_RATE_LIMIT` | Disable rate limiting | `false` | Development convenience |

### Security Configuration

| Variable | Description | Default | Purpose |
|----------|-------------|---------|---------|
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | Same origin | Cross-origin requests |
| `SESSION_SECRET` | Session encryption key | Random | Cookie security |
| `ADMIN_PASSWORD` | Admin dashboard password | Required | Admin access |

## Environment-Specific Setup

### Development (.env.local)

```bash
# Core
GEMINI_API_KEY=your_dev_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# WebSocket
NEXT_PUBLIC_LIVE_SERVER_URL=ws://localhost:3001
LIVE_SERVER_PORT=3001

# Email
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL="Dev <dev@example.com>"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Dev Tools
DEBUG=true
USE_MOCK_API=false
DISABLE_RATE_LIMIT=true
```

### Production (Vercel Dashboard)

Set these in Vercel Dashboard > Settings > Environment Variables:

```bash
# Core (Production values)
GEMINI_API_KEY=your_prod_key
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_key

# WebSocket (External server)
NEXT_PUBLIC_LIVE_SERVER_URL=wss://ws.fbconsulting.ai

# Email (Production)
RESEND_API_KEY=your_prod_resend_key
RESEND_FROM_EMAIL="F.B Consulting <noreply@fbconsulting.ai>"

# App
NEXT_PUBLIC_APP_URL=https://fbconsulting.ai
NODE_ENV=production

# Security
SESSION_SECRET=generate_with_openssl_rand_hex_32
ADMIN_PASSWORD=strong_unique_password
```

## WebSocket Server Deployment

For the WebSocket server (deploy separately):

```bash
# Only needs Gemini API
GEMINI_API_KEY=your_key
LIVE_SERVER_PORT=3001
```

## Validation Checklist

Before deploying, ensure:

- [ ] All required variables are set
- [ ] API keys have appropriate permissions
- [ ] URLs don't have trailing slashes
- [ ] Supabase RLS policies are configured
- [ ] WebSocket server is accessible
- [ ] Email domain is verified in Resend
- [ ] Production uses different keys than development
- [ ] Service role key is only in server environment
- [ ] Session secret is randomly generated
- [ ] Admin password is changed from default

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use different API keys for development and production**
3. **Rotate API keys regularly (quarterly recommended)**
4. **Monitor usage and set alerts for unusual activity**
5. **Use environment-specific service accounts**
6. **Enable 2FA on all service provider accounts**
7. **Audit environment variable access logs**

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "GEMINI_API_KEY not configured" | Ensure the key is set and valid |
| WebSocket connection fails | Check `NEXT_PUBLIC_LIVE_SERVER_URL` format and server status |
| Emails not sending | Verify Resend API key and domain verification |
| Database connection errors | Check Supabase keys and project status |
| CORS errors | Add origin to `CORS_ALLOWED_ORIGINS` |

### Debug Commands

```bash
# Check if environment variables are loaded
node -e "console.log(process.env.GEMINI_API_KEY ? 'Set' : 'Not set')"

# Test Supabase connection
npx supabase status

# Test WebSocket server
wscat -c ws://localhost:3001

# Verify Resend configuration
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

## Support

For environment configuration issues:

1. Check this documentation first
2. Review error logs in Vercel/Supabase dashboards
3. Contact support with specific error messages
4. Include environment (dev/staging/prod) in support requests

---

Last Updated: January 21, 2025