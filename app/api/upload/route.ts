import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
// Import supabase
import { createClient } from '@supabase/supabase-js'

export const dynamic = "force-dynamic"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'application/pdf',
  'text/plain',
  'application/json',
  'application/xml'
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: `File type ${file.type} not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}` 
      }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${sanitizedName}`
    const filepath = join(uploadDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return file info
    const fileUrl = `/uploads/${filename}`
    
    // In POST, after save:
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { error: logError } = await supabase.from('upload_logs').insert({
      filename,
      original_name: file.name,
      size: file.size,
      type: file.type,
      url: fileUrl,
      uploaded_at: new Date().toISOString(),
      session_id: request.headers.get('x-session-id') || null, // Assuming session header
      user_id: request.headers.get('x-user-id') || null
    })
    if (logError) console.error('Failed to log upload:', logError)

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Upload API Error]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Upload endpoint is working',
    maxFileSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    allowedTypes: ALLOWED_TYPES
  })
} 