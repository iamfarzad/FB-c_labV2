# Fly.io WebSocket Server Deployment Guide

## Prerequisites

1. **Install Fly CLI** (if not already installed):
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login to Fly.io**:
```bash
fly auth login
```

## Deployment Steps

### Step 1: Navigate to Server Directory
```bash
cd server/
```

### Step 2: Initialize Fly App (First Time Only)
```bash
fly launch
```

When prompted:
- Choose an app name (e.g., `fb-consulting-websocket`)
- Select a region close to your users (e.g., `iad` for US East)
- Don't add a PostgreSQL database
- Don't add Redis

### Step 3: Set Environment Variables
```bash
# Set your Gemini API key
fly secrets set GEMINI_API_KEY="your-gemini-api-key-here"
```

### Step 4: Deploy
```bash
fly deploy
```

### Step 5: Get Your WebSocket URL
After deployment, your WebSocket URL will be:
```
wss://your-app-name.fly.dev
```

## Update Your Application

### 1. Update Vercel Environment Variables

In your Vercel dashboard, update:
```
NEXT_PUBLIC_LIVE_SERVER_URL=wss://your-app-name.fly.dev
```

### 2. Update Local Development

In your `.env.local`:
```
NEXT_PUBLIC_LIVE_SERVER_URL=wss://your-app-name.fly.dev
```

## Testing the Connection

### Test with wscat
```bash
# Install wscat if needed
npm install -g wscat

# Test connection
wscat -c wss://your-app-name.fly.dev
```

### Test Health Endpoint
```bash
curl https://your-app-name.fly.dev/health
```

## Monitoring

### View Logs
```bash
fly logs
```

### Check Status
```bash
fly status
```

### View Metrics
```bash
fly dashboard
```

## Scaling

### Scale Up Instances
```bash
# Add more instances
fly scale count 2

# Increase memory
fly scale memory 512
```

### Auto-scaling Configuration
Edit `fly.toml`:
```toml
[services.concurrency]
  type = "connections"
  hard_limit = 1000
  soft_limit = 900

[[services.auto_scale]]
  min_machines = 1
  max_machines = 10
```

## Troubleshooting

### Connection Issues

1. **Check WebSocket is running**:
```bash
fly status
```

2. **Check logs for errors**:
```bash
fly logs --tail
```

3. **Verify secrets are set**:
```bash
fly secrets list
```

### Common Errors

| Error | Solution |
|-------|----------|
| "Connection refused" | Check if app is running: `fly status` |
| "401 Unauthorized" | Verify GEMINI_API_KEY is set: `fly secrets list` |
| "502 Bad Gateway" | App may be starting, wait and retry |
| "Memory exceeded" | Scale up memory: `fly scale memory 512` |

## Cost Considerations

Fly.io Free Tier includes:
- 3 shared-cpu-1x VMs with 256MB RAM
- 160GB outbound data transfer
- 3GB persistent storage

For production:
- Consider dedicated CPU instances
- Monitor bandwidth usage
- Set up alerts for usage

## Security Best Practices

1. **Rotate API Keys Regularly**:
```bash
fly secrets set GEMINI_API_KEY="new-key-here"
```

2. **Enable Rate Limiting** (already in code)

3. **Monitor Access Logs**:
```bash
fly logs | grep "Client connected"
```

4. **Set Up Alerts**:
```bash
fly alerts create --name high-cpu --condition "cpu > 80"
```

## Maintenance

### Update Code
```bash
# Make changes to live-server.ts
# Then redeploy
fly deploy
```

### Restart App
```bash
fly apps restart
```

### SSH into Container
```bash
fly ssh console
```

## Quick Deploy Script

Run the included deploy script:
```bash
cd server/
chmod +x deploy-fly.sh
./deploy-fly.sh
```

## Environment Variables Summary

**On Fly.io (via secrets)**:
- `GEMINI_API_KEY` - Your Google AI API key

**In Vercel Dashboard**:
- `NEXT_PUBLIC_LIVE_SERVER_URL` - wss://your-app.fly.dev

**In Local .env.local**:
- `NEXT_PUBLIC_LIVE_SERVER_URL` - wss://your-app.fly.dev (for testing)

## Next Steps

1. ✅ Deploy WebSocket server to Fly.io
2. ✅ Update NEXT_PUBLIC_LIVE_SERVER_URL in Vercel
3. ✅ Test voice features in production
4. ✅ Monitor logs and performance
5. ✅ Set up alerts for errors

---

## Support Links

- [Fly.io Documentation](https://fly.io/docs/)
- [WebSocket on Fly.io](https://fly.io/docs/reference/websockets/)
- [Fly CLI Reference](https://fly.io/docs/flyctl/)

---

Last Updated: January 21, 2025