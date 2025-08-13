#!/usr/bin/env tsx

import { execa } from 'execa';

async function runValidationStep(command: string, name: string) {
  console.info(`\n🚀 Starting: ${name}`);
  console.info('='.repeat(50));
  try {
    const { stdout, stderr } = await execa(command, { shell: true });
    console.info(stdout);
    if (stderr) {
      console.error(`\nstderr for ${name}:`);
      console.error(stderr);
    }
    console.info(`✅ Success: ${name} completed.`);
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
  console.info('\n\n\n🎯 Running Master Validation Pipeline...');
  console.info('This script provides a single source of truth for system health.');
  console.info('='.repeat(50));

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
  
  console.info('\n\n\n📊 Master Validation Summary');
  console.info('='.repeat(50));
  console.info(`Comprehensive Function Validation: ${results.pipeline ? '✅ PASSED' : '❌ FAILED'}`);
  console.info(`End-to-End Multimodal Test:        ${results.multimodal ? '✅ PASSED' : '❌ FAILED'}`);
  console.info(`Modified File Analysis:            ${results.analysis ? '✅ PASSED' : '❌ FAILED'}`);
  console.info('='.repeat(50));
  
  if (results.pipeline && results.multimodal && results.analysis) {
    console.info('\n🎉 ALL SYSTEMS GO! All validation checks passed. The system is production-ready.');
    process.exit(0);
  } else {
    console.info('\n🚨 ATTENTION! One or more validation checks failed. Review the logs above.');
    process.exit(1);
  }
}

main();
