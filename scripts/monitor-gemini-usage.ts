#!/usr/bin/env ts-node

/**
 * Monitor script to detect unauthorized Gemini API usage
 * Run this periodically to ensure no new scripts bypass cost controls
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ALLOWED_FILES = [
  'app/api/chat/route.ts',
  'app/api/chat-enhanced/route.ts',
  'app/api/ai-stream/route.ts',
  'app/api/admin/chat/route.ts',
  'app/api/gemini-live/route.ts',
  'app/api/analyze-image/route.ts',
  'app/api/analyze-document/route.ts',
  'app/api/analyze-screenshot/route.ts',
  'app/api/video-to-app/route.ts',
  'lib/educational-gemini-service.ts',
  'lib/gemini-live-api.ts',
  // Note: lib/video2app/textGeneration.ts is now using internal API
];

function findGeminiUsage(): string[] {
  try {
    // Use ripgrep to find all files using GEMINI_API_KEY
    const output = execSync('rg -l "GEMINI_API_KEY" --type ts --type js', { 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    
    return output.trim().split('\n').filter(line => line.length > 0);
  } catch (error) {
    console.log('No GEMINI_API_KEY usage found');
    return [];
  }
}

function main() {
  console.log('🔍 Monitoring Gemini API usage...');
  
  const foundFiles = findGeminiUsage();
  const unauthorizedFiles = foundFiles.filter(file => 
    !ALLOWED_FILES.includes(file) && 
    !file.includes('node_modules') &&
    !file.includes('.next') &&
    !file.includes('scripts/monitor-gemini-usage.ts')
  );
  
  if (unauthorizedFiles.length > 0) {
    console.error('🚨 UNAUTHORIZED GEMINI API USAGE DETECTED:');
    unauthorizedFiles.forEach(file => {
      console.error(`  - ${file}`);
    });
    console.error('\n💰 These files may cause cost overruns!');
    console.error('✅ Ensure they use internal API endpoints instead of direct GoogleGenAI calls');
    process.exit(1);
  } else {
    console.log('✅ All Gemini API usage is properly controlled');
  }
}

if (require.main === module) {
  main();
}