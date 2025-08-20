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
  return allowlist.some(d => h === d.toLowerCase() || h.endsWith(`.${d.toLowerCase()}`))
}

export async function headPreflight(u: URL, timeoutMs=5000, maxBytes=5_000_000) {
  const ac = new AbortController(); const t = setTimeout(()=>ac.abort(), timeoutMs)
  const r = await fetch(u.toString(), { method:'HEAD', signal: ac.signal })
  clearTimeout(t)
  if (!r.ok) throw new Error(`HEAD_${r.status}`)
  const ct = (r.headers.get('content-type')||'').split(';')[0].trim()
  if (!ALLOWED_TYPES.has(ct)) throw new Error('UNSUPPORTED_CONTENT_TYPE')
  const len = +(r.headers.get('content-length')||'0')
  if (len && len > maxBytes) throw new Error('TOO_LARGE')
}
