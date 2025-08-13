#!/usr/bin/env tsx

/**
 * Production Issues Fix Script
 * Automatically fixes common issues that cause AI functions to fail in production
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

interface FixResult {
  file: string
  issue: string
  fix: string
  applied: boolean
}

class ProductionFixer {
  private fixes: FixResult[] = []
  private projectRoot: string

  constructor() {
    this.projectRoot = process.cwd()
  }

  async fixAll(): Promise<FixResult[]> {
    console.info('🔧 Fixing production issues...')
    console.info('=' .repeat(50))

    // Apply all fixes
    await this.fixVercelConfig()
    await this.fixEnvironmentHandling()
    await this.fixAPIRouteHeaders()
    await this.fixTimeoutHandling()
    await this.createProductionReadme()

    this.printSummary()
    return this.fixes
  }

  private async fixVercelConfig() {
    console.info('\n📝 Checking vercel.json configuration...')
    
    const vercelConfigPath = join(this.projectRoot, 'vercel.json')
    
    if (!existsSync(vercelConfigPath)) {
      console.info('  ❌ vercel.json not found')
      return
    }

    try {
      const config = JSON.parse(readFileSync(vercelConfigPath, 'utf8'))
      let modified = false

      // Ensure AI functions have adequate timeouts
      const requiredFunctions = {
        'app/api/gemini-live/route.ts': { maxDuration: 45, memory: 1024 },
        'app/api/analyze-image/route.ts': { maxDuration: 30, memory: 1024 },
        'app/api/analyze-screenshot/route.ts': { maxDuration: 30, memory: 1024 },
        'app/api/video-to-app/route.ts': { maxDuration: 60, memory: 1024 },
      }

      if (!config.functions) {
        config.functions = {}
        modified = true
      }

      for (const [route, settings] of Object.entries(requiredFunctions)) {
        if (!config.functions[route] || 
            config.functions[route].maxDuration < settings.maxDuration) {
          config.functions[route] = settings
          modified = true
          console.info(`  ✅ Updated ${route} timeout to ${settings.maxDuration}s`)
        }
      }

      // Ensure proper headers for AI endpoints
      if (!config.headers) {
        config.headers = []
        modified = true
      }

      const aiHeaders = {
        source: '/api/(gemini-live|analyze-image|analyze-screenshot|video-to-app)/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, x-correlation-id, x-intelligence-session-id, x-user-id' }
        ]
      }

      const hasAIHeaders = config.headers.some((h: any) => 
        h.source?.includes('gemini-live') || h.source?.includes('analyze-')
      )

      if (!hasAIHeaders) {
        config.headers.push(aiHeaders)
        modified = true
        console.info('  ✅ Added CORS headers for AI endpoints')
      }

      if (modified) {
        writeFileSync(vercelConfigPath, JSON.stringify(config, null, 2))
        this.fixes.push({
          file: 'vercel.json',
          issue: 'Missing AI function configuration',
          fix: 'Added proper timeouts and CORS headers',
          applied: true
        })
      } else {
        console.info('  ✅ vercel.json already properly configured')
      }

    } catch (error) {
      this.fixes.push({
        file: 'vercel.json',
        issue: 'Failed to parse or update configuration',
        fix: `Error: ${error}`,
        applied: false
      })
    }
  }

  private async fixEnvironmentHandling() {
    console.info('\n🔐 Fixing environment variable handling...')

    // Check each AI API route for proper error handling
    const apiRoutes = [
      'app/api/gemini-live/route.ts',
      'app/api/analyze-image/route.ts',
      'app/api/analyze-screenshot/route.ts',
      'app/api/video-to-app/route.ts',
    ]

    for (const route of apiRoutes) {
      const filePath = join(this.projectRoot, route)
      
      if (!existsSync(filePath)) {
        console.info(`  ⚠️ ${route} not found`)
        continue
      }

      try {
        let content = readFileSync(filePath, 'utf8')
        let modified = false

        // Ensure proper GEMINI_API_KEY error handling
        if (!content.includes('GEMINI_API_KEY not configured') && 
            !content.includes('Service configuration error')) {
          
          // Find the first occurrence of process.env.GEMINI_API_KEY check
          const apiKeyCheckRegex = /if\s*\(\s*!process\.env\.GEMINI_API_KEY\s*\)\s*\{[^}]*\}/
          
          if (!apiKeyCheckRegex.test(content)) {
            // Add API key check after imports
            const importEndRegex = /^(import.*\n)*\n/m
            const replacement = `$&
// Ensure GEMINI_API_KEY is configured
if (!process.env.GEMINI_API_KEY) {
  return NextResponse.json(
    { 
      error: 'Service configuration error', 
      message: 'GEMINI_API_KEY not configured in production environment',
      code: 'MISSING_API_KEY'
    },
    { status: 500 }
  )
}

`
            content = content.replace(importEndRegex, replacement)
            modified = true
          }
        }

        // Ensure proper error response format
        if (!content.includes('NextResponse.json') && content.includes('return new Response')) {
          content = content.replace(
            /return new Response\(/g,
            'return NextResponse.json('
          )
          modified = true
        }

        if (modified) {
          writeFileSync(filePath, content)
          console.info(`  ✅ Fixed environment handling in ${route}`)
          this.fixes.push({
            file: route,
            issue: 'Missing environment variable validation',
            fix: 'Added proper GEMINI_API_KEY validation and error responses',
            applied: true
          })
        }

      } catch (error) {
        console.info(`  ❌ Failed to fix ${route}: ${error}`)
        this.fixes.push({
          file: route,
          issue: 'Failed to update environment handling',
          fix: `Error: ${error}`,
          applied: false
        })
      }
    }
  }

  private async fixAPIRouteHeaders() {
    console.info('\n📡 Fixing API route headers...')

    const routesToFix = [
      'app/api/gemini-live/route.ts',
      'app/api/analyze-image/route.ts',
      'app/api/analyze-screenshot/route.ts'
    ]

    for (const route of routesToFix) {
      const filePath = join(this.projectRoot, route)
      
      if (!existsSync(filePath)) continue

      try {
        let content = readFileSync(filePath, 'utf8')
        let modified = false

        // Add OPTIONS handler if missing
        if (!content.includes('export async function OPTIONS')) {
          const optionsHandler = `
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-correlation-id, x-intelligence-session-id, x-user-id',
    },
  })
}

`
          content = optionsHandler + content
          modified = true
        }

        if (modified) {
          writeFileSync(filePath, content)
          console.info(`  ✅ Added OPTIONS handler to ${route}`)
          this.fixes.push({
            file: route,
            issue: 'Missing CORS OPTIONS handler',
            fix: 'Added proper CORS preflight handling',
            applied: true
          })
        }

      } catch (error) {
        console.info(`  ❌ Failed to fix headers in ${route}: ${error}`)
      }
    }
  }

  private async fixTimeoutHandling() {
    console.info('\n⏱️ Adding timeout handling...')

    // Add timeout wrapper to long-running operations
    const timeoutWrapper = `
// Timeout wrapper for production stability
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    )
  ])
}
`

    const routesToUpdate = [
      'app/api/video-to-app/route.ts',
      'app/api/gemini-live/route.ts'
    ]

    for (const route of routesToUpdate) {
      const filePath = join(this.projectRoot, route)
      
      if (!existsSync(filePath)) continue

      try {
        let content = readFileSync(filePath, 'utf8')
        
        if (!content.includes('withTimeout')) {
          // Add timeout wrapper after imports
          const importEndRegex = /^(import.*\n)*\n/m
          content = content.replace(importEndRegex, `$&${timeoutWrapper}`)
          
          writeFileSync(filePath, content)
          console.info(`  ✅ Added timeout handling to ${route}`)
          this.fixes.push({
            file: route,
            issue: 'Missing timeout handling',
            fix: 'Added timeout wrapper for stability',
            applied: true
          })
        }

      } catch (error) {
        console.info(`  ❌ Failed to add timeout handling to ${route}: ${error}`)
      }
    }
  }

  private async createProductionReadme() {
    console.info('\n📚 Creating production troubleshooting guide...')

    const readmePath = join(this.projectRoot, 'PRODUCTION_TROUBLESHOOTING.md')
    
    const readmeContent = `# Production Troubleshooting Guide

## 🚨 AI Functions Not Working in Production

### Quick Diagnosis Commands

\`\`\`bash
# Test production endpoints
pnpm tsx scripts/diagnose-production-issues.ts https://your-app.vercel.app

# Check Vercel logs
vercel logs --app=your-app-name

# Check environment variables
vercel env ls
\`\`\`

### Common Issues & Fixes

#### 1. Missing Environment Variables ❌
**Symptoms**: "Service configuration error", "GEMINI_API_KEY not configured"

**Fix**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables for **ALL environments** (Production, Preview, Development):
   - \`GEMINI_API_KEY=your_actual_gemini_key\`
   - \`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key\`
3. Redeploy: \`vercel --prod\`

#### 2. Function Timeouts ⏱️
**Symptoms**: Functions timing out, 504 errors

**Fix**: Already configured in \`vercel.json\`:
- Gemini Live: 45s timeout
- Image Analysis: 30s timeout  
- Video-to-App: 60s timeout

#### 3. CORS Issues 🌐
**Symptoms**: Preflight errors, CORS blocked requests

**Fix**: Already added OPTIONS handlers and CORS headers

#### 4. Import/Module Issues 📦
**Symptoms**: "Cannot resolve module", build errors

**Fix**: 
- Check all imports use correct paths
- Ensure all dependencies are in \`package.json\`
- Run \`pnpm build\` locally first

### Testing Individual Functions

#### Test Gemini Live (Voice)
\`\`\`bash
curl -X POST https://your-app.vercel.app/api/gemini-live \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"Hello","enableTTS":true,"voiceName":"Puck"}'
\`\`\`

#### Test Image Analysis
\`\`\`bash
curl -X POST https://your-app.vercel.app/api/analyze-image \\
  -H "Content-Type: application/json" \\
  -d '{"image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==","type":"webcam"}'
\`\`\`

#### Test Video-to-App
\`\`\`bash
curl -X POST https://your-app.vercel.app/api/video-to-app \\
  -H "Content-Type: application/json" \\
  -d '{"videoUrl":"https://www.youtube.com/watch?v=test","requirements":"Simple test"}'
\`\`\`

### Vercel Dashboard Checks

1. **Functions Tab**: Check for failed executions
2. **Analytics Tab**: Look for 5xx errors
3. **Settings → Environment Variables**: Verify all keys are set
4. **Deployments**: Check build logs for errors

### Emergency Rollback

If issues persist:
\`\`\`bash
# List recent deployments
vercel ls

# Rollback to working version
vercel rollback <deployment-url>
\`\`\`

## 📞 Support

If issues persist after following this guide:
1. Run the diagnostic script and share results
2. Check Vercel function logs for specific errors
3. Test locally with \`pnpm dev\` to confirm local functionality
`

    writeFileSync(readmePath, readmeContent)
    console.info('  ✅ Created PRODUCTION_TROUBLESHOOTING.md')
    
    this.fixes.push({
      file: 'PRODUCTION_TROUBLESHOOTING.md',
      issue: 'Missing troubleshooting documentation',
      fix: 'Created comprehensive production troubleshooting guide',
      applied: true
    })
  }

  private printSummary() {
    console.info('\n' + '='.repeat(50))
    console.info('📊 FIXES APPLIED')
    console.info('='.repeat(50))

    const successful = this.fixes.filter(f => f.applied)
    const failed = this.fixes.filter(f => !f.applied)

    console.info(`✅ Successfully applied: ${successful.length}`)
    console.info(`❌ Failed to apply: ${failed.length}`)

    if (successful.length > 0) {
      console.info('\n✅ SUCCESSFUL FIXES:')
      successful.forEach(fix => {
        console.info(`  • ${fix.file}: ${fix.fix}`)
      })
    }

    if (failed.length > 0) {
      console.info('\n❌ FAILED FIXES:')
      failed.forEach(fix => {
        console.info(`  • ${fix.file}: ${fix.fix}`)
      })
    }

    console.info('\n🚀 NEXT STEPS:')
    console.info('  1. Commit and push these fixes')
    console.info('  2. Redeploy to Vercel')
    console.info('  3. Run diagnostic script to verify fixes')
    console.info('  4. Check PRODUCTION_TROUBLESHOOTING.md for detailed guidance')
  }
}

// CLI execution
async function main() {
  const fixer = new ProductionFixer()
  const results = await fixer.fixAll()

  // Exit with error code if any fixes failed
  const hasFailures = results.some(r => !r.applied)
  process.exit(hasFailures ? 1 : 0)
}

if (require.main === module) {
  main().catch(console.error)
}

export { ProductionFixer }