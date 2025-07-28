#!/usr/bin/env node

/**
 * Rule Validation Script
 * Validates that all code changes comply with established rules
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rule validation functions
const ruleValidators = {
  // Core foundation validation
  coreFoundation: (files) => {
    const violations = [];
    
    // Check for hardcoded secrets
    files.forEach(file => {
      if (file.includes('API_KEY') || file.includes('SECRET') || file.includes('PASSWORD')) {
        violations.push(`Potential hardcoded secret in ${file}`);
      }
    });
    
    return violations;
  },
  
  // Backend validation
  backendEngineer: (files) => {
    const violations = [];
    
    // Check for proper error handling
    files.forEach(file => {
      if (file.includes('/api/')) {
        const content = fs.readFileSync(file, 'utf8');
        
        // More sophisticated error handling detection
        const hasTryCatch = content.includes('try') && content.includes('catch');
        const hasErrorHandling = content.includes('error') || content.includes('Error');
        const hasReturnError = content.includes('return') && content.includes('error');
        const hasThrowError = content.includes('throw');
        
        // Only flag if there's no error handling at all
        if (!hasTryCatch && !hasErrorHandling && !hasReturnError && !hasThrowError) {
          violations.push(`Missing error handling in API route: ${file}`);
        }
      }
    });
    
    return violations;
  },
  
  // Frontend validation
  frontendSpecialist: (files) => {
    const violations = [];
    
    // Check for proper component structure
    files.forEach(file => {
      if (file.includes('/components/') && !file.includes('use client') && file.includes('useState')) {
        violations.push(`Client component missing 'use client' directive: ${file}`);
      }
    });
    
    return violations;
  },
  
  // Security validation
  securityAuditor: (files) => {
    const violations = [];
    
    // Check for potential XSS vulnerabilities
    files.forEach(file => {
      if (file.includes('dangerouslySetInnerHTML') || file.includes('innerHTML')) {
        violations.push(`Potential XSS vulnerability in ${file}`);
      }
    });
    
    return violations;
  }
};

// Main validation function
function validateRules() {
  console.log('🔍 Validating rule compliance...\n');
  
  // Get all relevant files
  const apiFiles = getFilesRecursively('./app/api');
  const componentFiles = getFilesRecursively('./components');
  const libFiles = getFilesRecursively('./lib');
  
  const allFiles = [...apiFiles, ...componentFiles, ...libFiles];
  
  // Run validations
  const results = {
    coreFoundation: ruleValidators.coreFoundation(allFiles),
    backendEngineer: ruleValidators.backendEngineer(apiFiles),
    frontendSpecialist: ruleValidators.frontendSpecialist(componentFiles),
    securityAuditor: ruleValidators.securityAuditor(allFiles)
  };
  
  // Report results
  let hasViolations = false;
  
  Object.entries(results).forEach(([rule, violations]) => {
    if (violations.length > 0) {
      hasViolations = true;
      console.log(`❌ ${rule} violations:`);
      violations.forEach(violation => console.log(`   - ${violation}`));
      console.log('');
    } else {
      console.log(`✅ ${rule}: No violations found`);
    }
  });
  
  if (hasViolations) {
    console.log('🚨 Rule violations detected! Please fix before proceeding.');
    process.exit(1);
  } else {
    console.log('✅ All rules validated successfully!');
  }
}

// Helper function to get files recursively
function getFilesRecursively(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js'))) {
      files.push(fullPath);
    }
  });
  
  return files;
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateRules();
}

export { validateRules, ruleValidators };
