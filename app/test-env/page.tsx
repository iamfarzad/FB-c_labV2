"use client"

import { useState, useEffect } from "react"

export default function TestEnvPage() {
  const [envStatus, setEnvStatus] = useState<any>({})
  const [supabaseStatus, setSupabaseStatus] = useState<string>("checking")

  useEffect(() => {
    // Check environment variables
    setEnvStatus({
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
    })

    // Test Supabase client
    const testSupabase = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        )
        setSupabaseStatus("initialized")
      } catch (error) {
        console.error('Supabase test error:', error)
        setSupabaseStatus("error")
      }
    }

    testSupabase()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Environment Variables:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(envStatus, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Supabase Status:</h2>
          <p className="text-sm">{supabaseStatus}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Browser Info:</h2>
          <p className="text-sm">
            User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}
          </p>
        </div>
      </div>
    </div>
  )
} 