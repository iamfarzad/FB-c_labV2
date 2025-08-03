#!/usr/bin/env tsx

import { ValidationPipeline } from './validation-pipeline'
import { FUNCTION_VALIDATION_CRITERIA } from './function-validation-criteria'

async function runComprehensiveValidation() {
  console.log('🎯 COMPREHENSIVE VALIDATION PIPELINE')
  console.log('=====================================')
  
  const pipeline = new ValidationPipeline()

  for (const [functionName, criteria] of Object.entries(FUNCTION_VALIDATION_CRITERIA)) {
    await pipeline.validateFunction(functionName, criteria)
  }

  pipeline.printResults()

  const results = pipeline.getResults();
  const fullyValidated = results.filter(r => 
    r.backend && r.frontend && r.database && r.api && r.bestPractices
  )

  console.log('\n🚨 VALIDATION DECISION:')
  console.log('=======================')
  
  if (fullyValidated.length === results.length) {
    console.log('✅ ALL FUNCTIONS ARE 100% VALIDATED')
    console.log('🎉 Ready for production deployment')
  } else {
    console.log('❌ NOT ALL FUNCTIONS ARE FULLY VALIDATED')
    console.log('⚠️ Fix validation issues before committing')
  }
}

runComprehensiveValidation().catch(console.error)
