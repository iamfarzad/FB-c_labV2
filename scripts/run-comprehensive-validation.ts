#!/usr/bin/env tsx

import { ValidationPipeline } from './validation-pipeline'
import { FUNCTION_VALIDATION_CRITERIA } from './function-validation-criteria'

async function runComprehensiveValidation() {
  console.info('🎯 COMPREHENSIVE VALIDATION PIPELINE')
  console.info('=====================================')
  
  const pipeline = new ValidationPipeline()

  for (const [functionName, criteria] of Object.entries(FUNCTION_VALIDATION_CRITERIA)) {
    await pipeline.validateFunction(functionName, criteria)
  }

  pipeline.printResults()

  const results = pipeline.getResults();
  const fullyValidated = results.filter(r => 
    r.backend && r.frontend && r.database && r.api && r.bestPractices
  )

  console.info('\n🚨 VALIDATION DECISION:')
  console.info('=======================')
  
  if (fullyValidated.length === results.length) {
    console.info('✅ ALL FUNCTIONS ARE 100% VALIDATED')
    console.info('🎉 Ready for production deployment')
  } else {
    console.info('❌ NOT ALL FUNCTIONS ARE FULLY VALIDATED')
    console.info('⚠️ Fix validation issues before committing')
  }
}

runComprehensiveValidation().catch(console.error)
