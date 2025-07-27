import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({
    adminPassword: process.env.ADMIN_PASSWORD || 'NOT_SET',
    jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT_SET',
    nodeEnv: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('ADMIN') || key.includes('JWT'))
  })
} 