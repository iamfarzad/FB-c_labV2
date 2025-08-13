#!/usr/bin/env tsx

/**
 * Test script for Video to App functionality
 * Tests both spec generation and code generation
 */

import { validateYoutubeUrl } from '../lib/youtube'

const TEST_VIDEO_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Rick Roll for testing

async function testVideoToApp() {
  console.info("🧪 Testing Video to App functionality...")
  
  // Test 1: YouTube URL validation
  console.info("\n1. Testing YouTube URL validation...")
  const validation = await validateYoutubeUrl(TEST_VIDEO_URL)
  if (validation.isValid) {
    console.info("✅ YouTube URL validation passed")
  } else {
    console.info("❌ YouTube URL validation failed:", validation.error)
    return
  }

  // Test 2: Spec generation
  console.info("\n2. Testing AI spec generation...")
  try {
    const specResponse = await fetch("http://localhost:3000/api/video-to-app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generateSpec",
        videoUrl: TEST_VIDEO_URL,
      }),
    })

    if (!specResponse.ok) {
      const errorData = await specResponse.json()
      console.info("❌ Spec generation failed:", errorData)
      return
    }

    const specData = await specResponse.json()
    if (specData.spec && specData.spec.length > 0) {
      console.info("✅ Spec generation successful")
      console.info("📝 Spec length:", specData.spec.length, "characters")
      console.info("📝 Spec preview:", specData.spec.substring(0, 200) + "...")
    } else {
      console.info("❌ Spec generation returned empty result")
      return
    }

    // Test 3: Code generation
    console.info("\n3. Testing AI code generation...")
    const codeResponse = await fetch("http://localhost:3000/api/video-to-app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generateCode",
        spec: specData.spec,
      }),
    })

    if (!codeResponse.ok) {
      const errorData = await codeResponse.json()
      console.info("❌ Code generation failed:", errorData)
      return
    }

    const codeData = await codeResponse.json()
    if (codeData.code && codeData.code.length > 0) {
      console.info("✅ Code generation successful")
      console.info("💻 Code length:", codeData.code.length, "characters")
      console.info("💻 Code preview:", codeData.code.substring(0, 200) + "...")
      
      // Check if it contains HTML
      if (codeData.code.includes("<html") || codeData.code.includes("<!DOCTYPE")) {
        console.info("✅ Generated code contains valid HTML")
      } else {
        console.info("⚠️  Generated code may not contain valid HTML")
      }
    } else {
      console.info("❌ Code generation returned empty result")
      return
    }

    console.info("\n🎉 All tests passed! Video to App functionality is working correctly.")
    
  } catch (error) {
    console.error("❌ Test failed with error:", error)
  }
}

// Run the test
testVideoToApp().catch(console.error)
