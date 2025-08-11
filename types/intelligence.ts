export type Stage = 'GREETING' | 'INTENT' | 'QUALIFY' | 'ACTION'

export interface CompanyContext {
  name: string
  domain: string
  industry?: string
  size?: string
  summary?: string
  website?: string
  linkedin?: string
}

export interface PersonContext {
  fullName: string
  role?: string
  seniority?: string
  profileUrl?: string
  company?: string
}

export interface ContextSnapshot {
  lead: { email: string; name: string }
  company?: CompanyContext
  person?: PersonContext
  role?: string
  roleConfidence?: number
  intent?: { type: string; confidence: number; slots: Record<string, any> }
  capabilities: string[]
}

export interface IntentResult {
  type: 'consulting' | 'workshop' | 'other'
  confidence: number
  slots: Record<string, any>
}

export interface Suggestion {
  id: string
  label: string
  action: 'open_form' | 'upload_prompt' | 'schedule_call' | 'run_audit' | 'run_tool'
  payload?: any
  capability?: string
}

export interface ToolRunInput {
  sessionId: string
  tool: 'roi' | 'doc' | 'image' | 'screenshot' | 'voice' | 'screenShare' | 'webcam' | 'translate' | 'search' | 'urlContext' | 'leadResearch' | 'meeting' | 'exportPdf' | 'calc' | 'code' | 'video2app'
  payload?: any
}

export interface ToolRunResult {
  ok: boolean
  output?: any
  error?: string
  citations?: { uri: string; title?: string }[]
}


