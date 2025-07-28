"use client"

import { useState, useEffect } from "react"

export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
        <p><strong>GEMINI_API_KEY:</strong> {process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing'}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
        <p className="text-sm text-muted-foreground">
          Note: SUPABASE_SERVICE_ROLE_KEY is server-only and not accessible on the client
        </p>
      </div>
    </div>
  )
}
