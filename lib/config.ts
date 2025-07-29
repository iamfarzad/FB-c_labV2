// Centralized configuration management
export const config = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // AI Provider Configuration
  ai: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
      model: "gemini-2.5-flash",
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4",
    },
  },

  // Email Configuration
  email: {
    resend: {
      apiKey: process.env.RESEND_API_KEY,
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
    },
  },

  // Application Configuration
  app: {
    baseUrl: process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    environment: process.env.NODE_ENV || "development",
  },
} as const

// Validation function to check required environment variables
export function validateConfig() {
  const errors: string[] = []

  if (!config.supabase.url) {
    errors.push("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL")
  }

  if (!config.supabase.anonKey) {
    errors.push("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY")
  }

  if (!config.ai.gemini.apiKey) {
    errors.push("Missing GEMINI_API_KEY or VITE_GEMINI_API_KEY")
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`)
  }
}

// Helper to check if we're in development
export const isDevelopment = config.app.environment === "development"
export const isProduction = config.app.environment === "production"

// Development warning for missing Supabase variables
export function checkDevelopmentConfig() {
  if (isDevelopment) {
    const missingVars: string[] = []
    
    if (!config.supabase.url) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!config.supabase.anonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if (!config.supabase.serviceRoleKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY")
    
    if (missingVars.length > 0) {
      console.warn(`⚠️ Supabase environment variables missing for full test execution: ${missingVars.join(", ")}`)
    }
  }
}
