#!/usr/bin/env node

/**
 * Simple test script to verify business content system functionality
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log('🧪 F.B/c Business Content System Test\n')

// Test 1: Check if all required files exist
console.log('1. Checking file structure...')
const requiredFiles = [
  'types/business-content.ts',
  'lib/business-content-templates.ts',
  'components/chat/BusinessContentRenderer.tsx',
  'app/(chat)/chat/types/chat.ts',
  'app/test-business-content/page.tsx'
]

let allFilesExist = true
for (const file of requiredFiles) {
  try {
    const filePath = join(projectRoot, file)
    readFileSync(filePath, 'utf8')
    console.log(`   ✅ ${file}`)
  } catch (error) {
    console.log(`   ❌ ${file} - Missing or unreadable`)
    allFilesExist = false
  }
}

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check the implementation.')
  process.exit(1)
}

// Test 2: Check template structure
console.log('\n2. Analyzing business content templates...')
try {
  const templatesFile = join(projectRoot, 'lib/business-content-templates.ts')
  const templatesContent = readFileSync(templatesFile, 'utf8')
  
  // Check for required exports
  const requiredExports = [
    'businessContentTemplates',
    'findTemplateByKeywords',
    'generateBusinessContent'
  ]
  
  for (const exportName of requiredExports) {
    if (templatesContent.includes(`export const ${exportName}`) || 
        templatesContent.includes(`export function ${exportName}`)) {
      console.log(`   ✅ ${exportName} export found`)
    } else {
      console.log(`   ❌ ${exportName} export missing`)
    }
  }
  
  // Check for template IDs
  const templateIds = ['roi_calculator', 'lead_capture', 'consultation_planner', 'business_analysis']
  for (const id of templateIds) {
    if (templatesContent.includes(`id: '${id}'`)) {
      console.log(`   ✅ Template '${id}' found`)
    } else {
      console.log(`   ⚠️  Template '${id}' might be missing`)
    }
  }
  
} catch (error) {
  console.log(`   ❌ Error reading templates file: ${error.message}`)
}

// Test 3: Check BusinessContentRenderer component
console.log('\n3. Analyzing BusinessContentRenderer component...')
try {
  const rendererFile = join(projectRoot, 'components/chat/BusinessContentRenderer.tsx')
  const rendererContent = readFileSync(rendererFile, 'utf8')
  
  const requiredFeatures = [
    'BusinessContentRenderer',
    'onInteract',
    'userContext',
    'htmlContent',
    'dangerouslySetInnerHTML'
  ]
  
  for (const feature of requiredFeatures) {
    if (rendererContent.includes(feature)) {
      console.log(`   ✅ ${feature} found`)
    } else {
      console.log(`   ❌ ${feature} missing`)
    }
  }
  
} catch (error) {
  console.log(`   ❌ Error reading renderer file: ${error.message}`)
}

// Test 4: Check Message type extension
console.log('\n4. Checking Message type extension...')
try {
  const chatTypesFile = join(projectRoot, 'app/(chat)/chat/types/chat.ts')
  const chatTypesContent = readFileSync(chatTypesFile, 'utf8')
  
  if (chatTypesContent.includes('businessContent?:')) {
    console.log('   ✅ businessContent field added to Message interface')
  } else {
    console.log('   ❌ businessContent field missing from Message interface')
  }
  
  if (chatTypesContent.includes('htmlContent: string')) {
    console.log('   ✅ htmlContent field found in businessContent')
  } else {
    console.log('   ❌ htmlContent field missing from businessContent')
  }
  
} catch (error) {
  console.log(`   ❌ Error reading chat types file: ${error.message}`)
}

// Test 5: Check CSS design system
console.log('\n5. Checking CSS design system...')
try {
  const cssFile = join(projectRoot, 'app/globals.css')
  const cssContent = readFileSync(cssFile, 'utf8')
  
  const fbcClasses = [
    'fbc-business-card',
    'fbc-metric-display',
    'fbc-lead-form',
    'fbc-business-button'
  ]
  
  for (const className of fbcClasses) {
    if (cssContent.includes(`.${className}`)) {
      console.log(`   ✅ ${className} CSS class found`)
    } else {
      console.log(`   ⚠️  ${className} CSS class might be missing`)
    }
  }
  
} catch (error) {
  console.log(`   ❌ Error reading CSS file: ${error.message}`)
}

// Test 6: Check test page
console.log('\n6. Checking test page structure...')
try {
  const testPageFile = join(projectRoot, 'app/test-business-content/page.tsx')
  const testPageContent = readFileSync(testPageFile, 'utf8')
  
  const testFeatures = [
    'TestBusinessContentPage',
    'BusinessContentRenderer',
    'handleBusinessInteraction',
    'selectedTemplate',
    'interactionLog'
  ]
  
  for (const feature of testFeatures) {
    if (testPageContent.includes(feature)) {
      console.log(`   ✅ ${feature} found in test page`)
    } else {
      console.log(`   ❌ ${feature} missing from test page`)
    }
  }
  
} catch (error) {
  console.log(`   ❌ Error reading test page file: ${error.message}`)
}

console.log('\n🎉 Business Content System Test Complete!')
console.log('\nNext steps:')
console.log('1. Run: npm run dev')
console.log('2. Visit: http://localhost:3000/test-business-content')
console.log('3. Test each template and interaction')
console.log('4. Check browser console for interaction logs')
console.log('\n📊 Expected test results:')
console.log('- All 4 templates should render correctly')
console.log('- Keyword matching should work')
console.log('- Form interactions should log to console')
console.log('- ROI calculator should show calculations')
console.log('- Lead form should capture data')
console.log('- Consultation planner should show steps')
console.log('- Business analysis should display metrics')
