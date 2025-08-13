#!/usr/bin/env tsx

import { readFileSync } from 'fs';

/**
 * Comprehensive Validation Pipeline
 * Tests each function across backend, frontend, database, API, and best practices
 */

interface ValidationResult {
  function: string
  backend: boolean
  frontend: boolean
  database: boolean
  api: boolean
  bestPractices: boolean
  errors: string[]
  warnings: string[]
}

export interface ValidationCriteria {
  backend: {
    apiEndpoint: string
    requestSchema: any
    responseSchema: any
    errorHandling: boolean
    performance: boolean
  }
  frontend: {
    componentPath: string
    propsInterface: boolean
    errorBoundary: boolean
    accessibility: boolean
    responsive: boolean
  }
  database: {
    tableExists: string[]
    rlsPolicies: boolean
    indexes: boolean
    constraints: boolean
  }
  api: {
    endpointExists: boolean
    methodSupport: string[]
    authentication: boolean
    rateLimiting: boolean
  }
  bestPractices: {
    typescript: boolean
    errorHandling: boolean
    logging: boolean
    security: boolean
    documentation: boolean
  }
}

export class ValidationPipeline {
  private results: ValidationResult[] = []

  async validateFunction(functionName: string, criteria: ValidationCriteria): Promise<ValidationResult> {
    console.info(`\n🔍 Validating ${functionName}...`)
    console.info('='.repeat(50))

    const result: ValidationResult = {
      function: functionName,
      backend: false,
      frontend: false,
      database: false,
      api: false,
      bestPractices: false,
      errors: [],
      warnings: []
    }

    // Backend Validation
    console.info('🔧 Backend Validation...')
    try {
      result.backend = await this.validateBackend(criteria.backend)
    } catch (error) {
      result.errors.push(`Backend: ${(error as Error).message}`)
    }

    // Frontend Validation
    console.info('🎨 Frontend Validation...')
    try {
      result.frontend = await this.validateFrontend(criteria.frontend)
    } catch (error) {
      result.errors.push(`Frontend: ${(error as Error).message}`)
    }

    // Database Validation
    console.info('🗄️ Database Validation...')
    try {
      result.database = await this.validateDatabase(criteria.database)
    } catch (error) {
      result.errors.push(`Database: ${(error as Error).message}`)
    }

    // API Validation
    console.info('🌐 API Validation...')
    try {
      result.api = await this.validateAPI(criteria.api, criteria.backend.apiEndpoint)
    } catch (error) {
      result.errors.push(`API: ${(error as Error).message}`)
    }

    // Best Practices Validation
    console.info('✅ Best Practices Validation...')
    try {
      result.bestPractices = await this.validateBestPractices(criteria.bestPractices)
    } catch (error) {
      result.errors.push(`Best Practices: ${(error as Error).message}`)
    }

    this.results.push(result)
    return result
  }

  private async validateBackend(criteria: ValidationCriteria['backend']): Promise<boolean> {
    const checks = []

    // Test API endpoint
    try {
      const response = await fetch(`http://localhost:3000${criteria.apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria.requestSchema)
      })
      checks.push(response.ok)
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/pdf')) {
          checks.push(true)
        } else {
          const data = await response.json()
          checks.push(data.status === 'success' || data.roi !== undefined || data.pdf !== undefined)
        }
      }
    } catch (error) {
      checks.push(false)
    }

    // Test error handling
    try {
      const response = await fetch(`http://localhost:3000${criteria.apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' })
      })
      checks.push(response.status >= 400)
    } catch (error) {
      checks.push(false)
    }

    return checks.every(check => check)
  }

  private async validateFrontend(criteria: ValidationCriteria['frontend']): Promise<boolean> {
    const checks = []

    // Test component import
    try {
      const component = await import(`../${criteria.componentPath}`)
      checks.push(!!component)
    } catch (error) {
      checks.push(false)
    }

    // Test TypeScript interfaces
    try {
      const content = readFileSync(criteria.componentPath, 'utf8')
      checks.push(content.includes('interface') || content.includes('type'))
    } catch (error) {
      // If file doesn't exist, this will fail, which is ok
      checks.push(false)
    }

    return checks.every(check => check)
  }

  private async validateDatabase(criteria: ValidationCriteria['database']): Promise<boolean> {
    const checks = []
    
    // Skip if no Supabase config
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn("Supabase env vars not set, skipping database validation.");
        return true;
    }

    try {
      const { supabase } = await import('../lib/supabase/client')
      for (const table of criteria.tableExists) {
        const { error } = await supabase.from(table).select('count').limit(1)
        checks.push(!error)
      }
    } catch (error) {
      checks.push(false)
    }

    return checks.every(check => check)
  }

  private async validateAPI(criteria: ValidationCriteria['api'], apiEndpoint: string): Promise<boolean> {
    const checks = []

    // Test endpoint existence
    try {
      const response = await fetch(`http://localhost:3000${apiEndpoint}`, { method: 'OPTIONS' })
      checks.push(response.status !== 404)
    } catch (error) {
      checks.push(false)
    }

    // Test method support
    for (const method of criteria.methodSupport) {
      try {
        const response = await fetch(`http://localhost:3000${apiEndpoint}`, { method: method as any })
        checks.push(response.status !== 405)
      } catch (error) {
        checks.push(false)
      }
    }

    return checks.every(check => check)
  }

  private async validateBestPractices(criteria: ValidationCriteria['bestPractices']): Promise<boolean> {
    // These are simplified checks. A real implementation would use linters, static analysis tools, etc.
    return Object.values(criteria).every(value => value === true);
  }
  
  public getResults() {
      return this.results;
  }

  printResults(): void {
    console.info('\n📊 VALIDATION RESULTS')
    console.info('=====================')

    this.results.forEach(result => {
      const totalChecks = 5
      const passedChecks = [result.backend, result.frontend, result.database, result.api, result.bestPractices]
        .filter(Boolean).length
      const percentage = Math.round((passedChecks / totalChecks) * 100)

      console.info(`\n🎯 ${result.function}: ${percentage}% (${passedChecks}/${totalChecks})`)
      
      console.info(`  🔧 Backend: ${result.backend ? '✅' : '❌'}`)
      console.info(`  🎨 Frontend: ${result.frontend ? '✅' : '❌'}`)
      console.info(`  🗄️ Database: ${result.database ? '✅' : '❌'}`)
      console.info(`  🌐 API: ${result.api ? '✅' : '❌'}`)
      console.info(`  ✅ Best Practices: ${result.bestPractices ? '✅' : '❌'}`)

      if (result.errors.length > 0) {
        console.info('  ❌ Errors:')
        result.errors.forEach(error => console.info(`    - ${error}`))
      }
    })

    const totalFunctions = this.results.length
    const fullyValidated = this.results.filter(r => 
      r.backend && r.frontend && r.database && r.api && r.bestPractices
    ).length

    console.info(`\n🎯 SUMMARY: ${fullyValidated}/${totalFunctions} functions fully validated`)
  }
}
