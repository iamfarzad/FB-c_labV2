# Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Ensure all required environment variables are set:

\`\`\`bash
# Check required variables
npm run check-env
\`\`\`

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`

### 2. Database Setup
Run database migrations in order:
\`\`\`bash
# Connect to your Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
\`\`\`

Or manually run SQL scripts:
1. `scripts/01-init.sql`
2. `scripts/02-admin-tables.sql`
3. `scripts/03-database-improvements.sql`
4. `scripts/04-token-usage-tables.sql`

### 3. Build Verification
\`\`\`bash
npm run build
npm run start
\`\`\`

### 4. Security Checklist
- [ ] No hardcoded credentials in code
- [ ] Environment variables properly configured
- [ ] CORS settings configured
- [ ] Rate limiting enabled
- [ ] Webhook signatures verified

## Deployment Steps

### Vercel Deployment
1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Deploy

### Post-Deployment
1. Verify all API endpoints
2. Test database connections
3. Confirm email webhooks
4. Monitor error logs
5. Test AI chat functionality

## Rollback Plan
1. Revert to previous Vercel deployment
2. Restore database from backup if needed
3. Update DNS if custom domain affected

## Monitoring
- Check Vercel function logs
- Monitor Supabase dashboard
- Track AI token usage
- Monitor email delivery rates
