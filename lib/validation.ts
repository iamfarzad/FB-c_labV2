import { z } from 'zod';

// Lead capture validation
export const leadCaptureSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  company_name: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional(),
  message: z.string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional(),
  source: z.string()
    .max(50, 'Source must be less than 50 characters')
    .optional(),
});

// Chat message validation
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string()
    .min(1, 'Message content is required')
    .max(10000, 'Message content must be less than 10000 characters'),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema)
    .min(1, 'At least one message is required')
    .max(50, 'Maximum 50 messages allowed'),
  model: z.string()
    .max(50, 'Model name must be less than 50 characters')
    .optional(),
  temperature: z.number()
    .min(0, 'Temperature must be between 0 and 2')
    .max(2, 'Temperature must be between 0 and 2')
    .optional(),
  max_tokens: z.number()
    .min(1, 'Max tokens must be at least 1')
    .max(4000, 'Max tokens must be less than 4000')
    .optional(),
  data: z.object({
    leadContext: z.any().optional(),
    sessionId: z.string().optional(),
    userId: z.string().optional(),
  }).optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.any(), // File object from FormData
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

// Meeting booking validation
export const meetingBookingSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email format'),
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration must be less than 8 hours')
    .optional(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

// Admin analytics validation
export const adminAnalyticsSchema = z.object({
  period: z.enum(['1d', '7d', '30d', '90d'])
    .default('7d'),
  start_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  end_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
});

// Email campaign validation
export const emailCampaignSchema = z.object({
  name: z.string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters'),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  template: z.string()
    .min(1, 'Template is required')
    .max(10000, 'Template must be less than 10000 characters'),
  target_segment: z.string()
    .max(100, 'Target segment must be less than 100 characters')
    .optional(),
  scheduled_at: z.string()
    .datetime('Scheduled time must be a valid datetime')
    .optional(),
});

// Token usage validation
export const tokenUsageSchema = z.object({
  session_id: z.string()
    .min(1, 'Session ID is required')
    .max(100, 'Session ID must be less than 100 characters'),
  provider: z.string()
    .min(1, 'Provider is required')
    .max(50, 'Provider must be less than 50 characters'),
  model: z.string()
    .min(1, 'Model is required')
    .max(50, 'Model must be less than 50 characters'),
  input_tokens: z.number()
    .min(0, 'Input tokens must be non-negative'),
  output_tokens: z.number()
    .min(0, 'Output tokens must be non-negative'),
  total_tokens: z.number()
    .min(0, 'Total tokens must be non-negative'),
  input_cost: z.number()
    .min(0, 'Input cost must be non-negative'),
  output_cost: z.number()
    .min(0, 'Output cost must be non-negative'),
  total_cost: z.number()
    .min(0, 'Total cost must be non-negative'),
  request_type: z.string()
    .max(50, 'Request type must be less than 50 characters')
    .optional(),
  user_id: z.string()
    .max(100, 'User ID must be less than 100 characters')
    .optional(),
  metadata: z.record(z.any())
    .optional(),
});

// Generic validation function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d\+]/g, ''); // Keep only digits and +
}