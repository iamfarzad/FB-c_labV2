#!/usr/bin/env node

/**
 * Keyword Density Analyzer for SEO Optimization
 * Analyzes keyword density in HTML content and provides optimization recommendations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target keywords for analysis
const TARGET_KEYWORDS = {
  primary: [
    'AI consulting',
    'AI automation', 
    'AI consultant',
    'Farzad Bayat'
  ],
  secondary: [
    'AI implementation',
    'chatbot development',
    'AI workshops',
    'business AI',
    'workflow automation',
    'AI copilot'
  ],
  lsi: [
    'artificial intelligence',
    'machine learning',
    'AI solutions',
    'AI training',
    'AI services'
  ]
};

function extractTextFromHTML(html) {
  // Remove script and style tags
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove HTML tags
  html = html.replace(/<[^>]*>/g, ' ');
  
  // Clean up whitespace
  html = html.replace(/\s+/g, ' ').trim();
  
  return html;
}

function calculateKeywordDensity(text, keyword) {
  const wordCount = text.split(/\s+/).length;
  const keywordRegex = new RegExp(keyword, 'gi');
  const matches = text.match(keywordRegex);
  const keywordCount = matches ? matches.length : 0;
  
  return {
    keyword,
    count: keywordCount,
    density: ((keywordCount / wordCount) * 100).toFixed(2),
    wordCount
  };
}

function analyzePage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const text = extractTextFromHTML(content);
    
    const results = {
      file: path.basename(filePath),
      wordCount: text.split(/\s+/).length,
      keywords: {}
    };
    
    // Analyze all keyword categories
    Object.entries(TARGET_KEYWORDS).forEach(([category, keywords]) => {
      results.keywords[category] = keywords.map(keyword => 
        calculateKeywordDensity(text, keyword)
      );
    });
    
    return results;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

function generateReport(analysisResults) {
  console.log('\n🔍 SEO Keyword Density Analysis Report\n');
  console.log('=' .repeat(60));
  
  analysisResults.forEach(result => {
    if (!result) return;
    
    console.log(`\n📄 ${result.file}`);
    console.log(`Total Words: ${result.wordCount}`);
    console.log('-'.repeat(40));
    
    Object.entries(result.keywords).forEach(([category, keywords]) => {
      console.log(`\n${category.toUpperCase()} KEYWORDS:`);
      keywords.forEach(kw => {
        const status = parseFloat(kw.density) >= 1.0 ? '✅' : '⚠️';
        console.log(`  ${status} ${kw.keyword}: ${kw.count} times (${kw.density}%)`);
      });
    });
  });
  
  // Summary recommendations
  console.log('\n' + '='.repeat(60));
  console.log('📊 OPTIMIZATION RECOMMENDATIONS:');
  console.log('='.repeat(60));
  
  const allResults = analysisResults.filter(r => r).flatMap(r => 
    Object.values(r.keywords).flat()
  );
  
  const lowDensity = allResults.filter(kw => parseFloat(kw.density) < 1.0);
  const highDensity = allResults.filter(kw => parseFloat(kw.density) > 3.0);
  
  if (lowDensity.length > 0) {
    console.log('\n⚠️  Keywords with low density (< 1%):');
    lowDensity.forEach(kw => {
      console.log(`  - ${kw.keyword}: ${kw.density}%`);
    });
  }
  
  if (highDensity.length > 0) {
    console.log('\n⚠️  Keywords with high density (> 3%):');
    highDensity.forEach(kw => {
      console.log(`  - ${kw.keyword}: ${kw.density}%`);
    });
  }
  
  console.log('\n✅ IDEAL KEYWORD DENSITY RANGES:');
  console.log('  - Primary keywords: 1.5% - 2.5%');
  console.log('  - Secondary keywords: 1.0% - 2.0%');
  console.log('  - LSI keywords: 0.5% - 1.5%');
}

// Main execution
function main() {
  const pagesDir = path.join(__dirname, '..', 'app');
  const pages = [
    'page.tsx',
    'about/page.tsx',
    'consulting/page.tsx',
    'contact/page.tsx',
    'workshop/page.tsx'
  ];
  
  console.log('🔍 Analyzing keyword density for SEO optimization...\n');
  
  const analysisResults = pages.map(page => 
    analyzePage(path.join(pagesDir, page))
  );
  
  generateReport(analysisResults);
}

main();