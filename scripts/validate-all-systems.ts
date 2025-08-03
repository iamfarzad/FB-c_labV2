#!/usr/bin/env tsx

import { execa } from 'execa';

async function runValidationStep(command: string, name: string) {
  console.log(`\n🚀 Starting: ${name}`);
  console.log('='.repeat(50));
  try {
    const { stdout, stderr } = await execa(command, { shell: true });
    console.log(stdout);
    if (stderr) {
      console.error(`\nstderr for ${name}:`);
      console.error(stderr);
    }
    console.log(`✅ Success: ${name} completed.`);
    return true;
  } catch (error) {
    console.error(`\n❌ Error: ${name} failed.`);
    // error has stdout and stderr properties
    if (error instanceof Error && 'stdout' in error && 'stderr' in error) {
        console.error(error.stdout);
        console.error(error.stderr);
    } else {
        console.error(error);
    }
    return false;
  }
}

async function main() {
  console.log('\n\n\n🎯 Running Master Validation Pipeline...');
  console.log('This script provides a single source of truth for system health.');
  console.log('='.repeat(50));

  const results = {
    pipeline: false,
    multimodal: false,
    analysis: false,
  };

  results.pipeline = await runValidationStep(
    'pnpm tsx scripts/run-comprehensive-validation.ts',
    'Comprehensive Function Validation'
  );

  results.multimodal = await runValidationStep(
    'node scripts/test-complete-multimodal-system.mjs',
    'End-to-End Multimodal Test'
  );

  results.analysis = await runValidationStep(
    'pnpm tsx scripts/analyze-modified-files.ts',
    'Modified File Analysis'
  );
  
  console.log('\n\n\n📊 Master Validation Summary');
  console.log('='.repeat(50));
  console.log(`Comprehensive Function Validation: ${results.pipeline ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`End-to-End Multimodal Test:        ${results.multimodal ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Modified File Analysis:            ${results.analysis ? '✅ PASSED' : '❌ FAILED'}`);
  console.log('='.repeat(50));
  
  if (results.pipeline && results.multimodal && results.analysis) {
    console.log('\n🎉 ALL SYSTEMS GO! All validation checks passed. The system is production-ready.');
    process.exit(0);
  } else {
    console.log('\n🚨 ATTENTION! One or more validation checks failed. Review the logs above.');
    process.exit(1);
  }
}

main();
