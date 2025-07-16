import { z } from 'zod'

// Base schemas
export const EmailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email address too long') // RFC 5321 limit
export const NameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long')
export const CompanySchema = z.string().max(200, 'Company name too long').optional()

// Lead capture validation
export const LeadCaptureSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  company: CompanySchema,
  engagementType: z.enum(['chat', 'voice', 'screen_share', 'webcam'], {
    errorMap: () => ({ message: 'Invalid engagement type' })
  }),
  initialQuery: z.string().max(1000, 'Query too long').optional(),
  tcAcceptance: z.object({
    accepted: z.boolean(),
    timestamp: z.number().positive('Invalid timestamp'),
    userAgent: z.string().optional()
  })
})

// Chat validation
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content required'),
  imageUrl: z.string().url('Invalid image URL').optional()
})

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1, 'At least one message required'),
  data: z.object({
    leadContext: z.object({
      name: z.string().optional(),
      company: z.string().optional(),
      role: z.string().optional(),
      interests: z.string().optional()
    }).optional(),
    sessionId: z.string().optional(),
    userId: z.string().optional()
  }).optional()
})

// Gemini Live validation
export const GeminiLiveSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(5000, 'Prompt too long'),
  enableTTS: z.boolean().default(false),
  voiceStyle: z.enum(['neutral', 'friendly', 'professional']).default('neutral'),
  voiceName: z.string().default('Kore'),
  streamAudio: z.boolean().default(false)
})

// Lead research validation
export const LeadResearchSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  company: CompanySchema,
  linkedinUrl: z.string().url('Invalid LinkedIn URL').max(500, 'LinkedIn URL too long').optional()
})

// Video to app validation
export const VideoToAppSchema = z.object({
  action: z.enum(['generateSpec', 'generateCode']),
  videoUrl: z.string().url('Invalid video URL').max(1000, 'Video URL too long').optional(),
  spec: z.string().max(10000, 'Specification too long').optional()
})

// Educational content validation
export const EducationalInteractionSchema = z.object({
  id: z.string(),
  type: z.string(),
  value: z.string().optional(),
  elementType: z.string(),
  elementText: z.string(),
  appContext: z.string().nullable(),
  learningObjective: z.string().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  timeSpent: z.number().positive().optional(),
  isCorrect: z.boolean().optional(),
  timestamp: z.number().positive()
})

export const VideoLearningContextSchema = z.object({
  videoUrl: z.string().url('Invalid video URL').max(1000, 'Video URL too long'),
  videoTitle: z.string().max(200, 'Video title too long').optional(),
  generatedSpec: z.string().min(1, 'Generated spec required').max(10000, 'Generated spec too long'),
  learningObjectives: z.array(z.string().max(500, 'Learning objective too long')).min(1, 'At least one learning objective required'),
  keyTopics: z.array(z.string().max(200, 'Key topic too long')).min(1, 'At least one key topic required'),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced'])
})

export const EducationalContentSchema = z.object({
  interactionHistory: z.array(EducationalInteractionSchema).min(1, 'Interaction history required'),
  videoContext: VideoLearningContextSchema,
  maxHistoryLength: z.number().int().positive().default(5)
})

// Meeting validation
export const MeetingBookingSchema = z.object({
  leadId: z.string().uuid('Invalid lead ID'),
  name: NameSchema,
  email: EmailSchema,
  company: CompanySchema,
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  preferredTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  timeZone: z.string().max(50, 'Timezone too long').default('UTC'),
  message: z.string().max(1000, 'Message too long').optional()
})

// Admin validation
export const AdminStatsQuerySchema = z.object({
  period: z.enum(['1d', '7d', '30d', '90d']).default('7d')
})

export const TokenUsageQuerySchema = z.object({
  timeframe: z.enum(['1h', '24h', '7d', '30d', '90d']).default('24h'),
  provider: z.string().optional(),
  model: z.string().optional()
})

export const TokenUsageLogSchema = z.object({
  sessionId: z.string(),
  provider: z.string(),
  model: z.string(),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  inputCost: z.number().nonnegative(),
  outputCost: z.number().nonnegative(),
  totalCost: z.number().nonnegative(),
  requestType: z.string().default('chat'),
  userId: z.string().optional(),
  metadata: z.record(z.any()).default({})
})

// GDPR validation
export const GDPRDeleteSchema = z.object({
  email: EmailSchema
})

export const GDPRExportSchema = z.object({
  email: EmailSchema
})

export const GDPRConsentSchema = z.object({
  email: EmailSchema,
  consentType: z.enum(['marketing', 'analytics', 'necessary']),
  granted: z.boolean(),
  timestamp: z.string().datetime('Invalid timestamp')
})

// Webhook validation
export const ResendWebhookSchema = z.object({
  type: z.enum(['email.sent', 'email.delivered', 'email.bounced', 'email.complained', 'email.opened', 'email.clicked']),
  data: z.record(z.any())
})

// API versioning
export const APIVersionSchema = z.object({
  version: z.string().regex(/^v\d+$/, 'Invalid version format'),
  accept: z.string().optional()
})

// Rate limiting
export const RateLimitSchema = z.object({
  userId: z.string().optional(),
  endpoint: z.string(),
  timestamp: z.number().positive()
})

// Security validation
export const SecurityHeadersSchema = z.object({
  'x-api-key': z.string().optional(),
  'authorization': z.string().startsWith('Bearer ', 'Invalid authorization format').optional(),
  'x-forwarded-for': z.string().optional(),
  'user-agent': z.string().optional()
})

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
  status: z.number().int().positive()
})

// Success response schema
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional()
})

// Health check schema
export const HealthCheckSchema = z.object({
  status: z.enum(['healthy', 'unhealthy', 'degraded']),
  timestamp: z.string().datetime(),
  version: z.string(),
  uptime: z.number().positive(),
  services: z.record(z.object({
    status: z.enum(['healthy', 'unhealthy']),
    responseTime: z.number().positive().optional()
  }))
})

// Configuration validation
export const ConfigValidationSchema = z.object({
  database: z.enum(['connected', 'disconnected']),
  ai_providers: z.enum(['configured', 'not_configured']),
  email_service: z.enum(['configured', 'not_configured']),
  websocket_server: z.enum(['running', 'stopped']).optional()
})

// Export all schemas
export const ValidationSchemas = {
  LeadCapture: LeadCaptureSchema,
  Chat: ChatRequestSchema,
  GeminiLive: GeminiLiveSchema,
  LeadResearch: LeadResearchSchema,
  VideoToApp: VideoToAppSchema,
  EducationalContent: EducationalContentSchema,
  MeetingBooking: MeetingBookingSchema,
  AdminStats: AdminStatsQuerySchema,
  TokenUsage: TokenUsageQuerySchema,
  TokenUsageLog: TokenUsageLogSchema,
  GDPRDelete: GDPRDeleteSchema,
  GDPRExport: GDPRExportSchema,
  GDPRConsent: GDPRConsentSchema,
  ResendWebhook: ResendWebhookSchema,
  APIVersion: APIVersionSchema,
  RateLimit: RateLimitSchema,
  SecurityHeaders: SecurityHeadersSchema,
  ErrorResponse: ErrorResponseSchema,
  SuccessResponse: SuccessResponseSchema,
  HealthCheck: HealthCheckSchema,
  ConfigValidation: ConfigValidationSchema
}

// Helper function to validate and sanitize input
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

// Helper function to validate and sanitize input with custom error handling
export function validateInputSafe<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(e => e.message)
      }
    }
    return { 
      success: false, 
      errors: ['Unknown validation error']
    }
  }
}