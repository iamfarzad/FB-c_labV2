#!/bin/bash

# Conversational Intelligence Hardening Script
# This script applies all the security and performance improvements

echo "Starting Conversational Intelligence Hardening..."

# Create new directories if needed
mkdir -p lib/security
mkdir -p app/api/intelligence/health
mkdir -p tests/playwright
mkdir -p tests/api

echo "Creating new files..."

# 1. Create lib/security/url-guards.ts
cat > lib/security/url-guards.ts << 'EOF'
import * as dns from 'node:dns/promises'
import * as net from 'node:net'

const BLOCK_IPV4: [string,string][] = [
  ['127.0.0.0','255.0.0.0'],      // loopback
  ['10.0.0.0','255.0.0.0'],       // private
  ['172.16.0.0','255.240.0.0'],   // private
  ['192.168.0.0','255.255.0.0'],  // private
  ['169.254.0.0','255.255.0.0'],  // link-local
]
const ALLOWED_TYPES = new Set(['text/html','text/plain','application/xhtml+xml'])

function ipToInt(ip: string){ return ip.split('.').reduce((a,o)=>(a<<8)+(+o),0) }
function inRange(ip: string,[base,mask]:[string,string]){ const i=ipToInt(ip),b=ipToInt(base),m=ipToInt(mask); return (i&m)===(b&m) }

export async function validateOutboundUrl(raw: string): Promise<URL> {
  const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
  if (u.protocol !== 'https:') throw new Error('URL_PROTOCOL_BLOCKED')
  const addrs = await dns.lookup(u.hostname, { all: true })
  for (const a of addrs) {
    if (net.isIP(a.address) !== 4) throw new Error('IP_VERSION_BLOCKED')
    if (BLOCK_IPV4.some(r => inRange(a.address, r))) throw new Error('URL_PRIVATE_NETWORK_BLOCKED')
  }
  return u
}

export function checkAllowedDomain(u: URL, allowlist: string[]): boolean {
  if (!allowlist.length) return true
  const h = u.hostname.toLowerCase()
  return allowlist.some(d => h === d.toLowerCase() || h.endsWith(\`.\${d.toLowerCase()}\`))
}

export async function headPreflight(u: URL, timeoutMs=5000, maxBytes=5_000_000) {
  const ac = new AbortController(); const t = setTimeout(()=>ac.abort(), timeoutMs)
  const r = await fetch(u.toString(), { method:'HEAD', signal: ac.signal })
  clearTimeout(t)
  if (!r.ok) throw new Error(\`HEAD_\${r.status}\`)
  const ct = (r.headers.get('content-type')||'').split(';')[0].trim()
  if (!ALLOWED_TYPES.has(ct)) throw new Error('UNSUPPORTED_CONTENT_TYPE')
  const len = +(r.headers.get('content-length')||'0')
  if (len && len > maxBytes) throw new Error('TOO_LARGE')
}
EOF

# 2. Create .env.example
cat > .env.example << 'EOF'
# Conversational Intelligence Configuration
# ==========================================

# Google Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_GROUNDING_ENABLED=true

# URL Context Configuration
URL_CONTEXT_ENABLED=true
URL_CONTEXT_MAX_URLS=10
URL_CONTEXT_ALLOWED_DOMAINS=example.com,company.com
URL_CONTEXT_TIMEOUT_MS=8000
URL_CONTEXT_MAX_BYTES=5000000

# Intelligence Provider Configuration
INTEL_PROVIDER=google # or 'mock' for testing
EMBED_DIM=768 # 768 or 1536
LIVE_ENABLED=false # Enable Gemini Live API

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Other API Keys
PERPLEXITY_API_KEY=your-perplexity-api-key

# Development/Testing
MOCK_AI_ENABLED=false
LEAD_STAGES_ENABLED=true

# Security
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Telemetry and Monitoring
TELEMETRY_ENABLED=true
LOG_LEVEL=info # debug, info, warn, error
EOF

echo "Files created successfully!"
echo ""
echo "IMPORTANT: Manual changes still needed in these files:"
echo "==========================================================="
echo ""
echo "1. app/api/tools/url/route.ts"
echo "   - Add imports for validateOutboundUrl, checkAllowedDomain, headPreflight"
echo "   - Add export const dynamic = 'force-dynamic'"
echo "   - Add export const revalidate = 0"
echo "   - Add export const fetchCache = 'force-no-store'"
echo "   - Add URL validation logic before processing"
echo "   - Add Cache-Control: no-store to all responses"
echo ""
echo "2. app/api/chat/route.ts"
echo "   - Add export const dynamic = 'force-dynamic' at top"
echo "   - Add export const revalidate = 0"
echo "   - Add export const fetchCache = 'force-no-store'"
echo "   - Update tools array to be conditional based on URL availability"
echo ""
echo "3. app/api/intelligence/context/route.ts"
echo "   - Update ETag generation to use SHA-256"
echo "   - Add proper 304 Not Modified support"
echo "   - Add Cache-Control: no-store headers"
echo ""
echo "4. app/(chat)/chat/page.tsx"
echo "   - Add fetchedOnceRef = useRef(false) for one-shot fetch"
echo "   - Update useEffect for consent to prevent duplicate fetches"
echo ""
echo "5. lib/services/url-context-service.ts"
echo "   - Update validateAndNormalizeURL to enforce HTTPS only"
echo "   - Add stream-based reading with 5MB limit"
echo "   - Add content-type validation"
echo ""
echo "6. lib/intelligence/providers/search/google-grounding.ts"
echo "   - Add extractCitations helper function"
echo "   - Update citation extraction to use the new helper"
echo ""
echo "7. lib/config/intelligence.ts"
echo "   - Add URL_CONTEXT_CONFIG export with env variables"
echo "   - Add PROVIDER_TIMEOUT_MS and other constants"
echo ""
echo "8. Update CHANGELOG.md with all these changes"
echo ""
echo "To see the exact changes needed, check the notepad in your Cursor session"
echo "or refer to the conversation history for the complete code blocks."
