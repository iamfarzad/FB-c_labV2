#!/usr/bin/env tsx

/**
 * Test script for Video to App functionality
 * Tests both spec generation and code generation
 */

import { validateYoutubeUrl } from '../lib/youtube'

const TEST_VIDEO_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Rick Roll for testing

async function testVideoToApp() {
  console.log("🧪 Testing Video to App functionality...")
  
  // Test 1: YouTube URL validation
  console.log("\n1. Testing YouTube URL validation...")
  const validation = await validateYoutubeUrl(TEST_VIDEO_URL)
  if (validation.isValid) {
    console.log("✅ YouTube URL validation passed")
  } else {
    console.log("❌ YouTube URL validation failed:", validation.error)
    return
  }

  // Test 2: Spec generation
  console.log("\n2. Testing AI spec generation...")
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
      console.log("❌ Spec generation failed:", errorData)
      return
    }

    const specData = await specResponse.json()
    if (specData.spec && specData.spec.length > 0) {
      console.log("✅ Spec generation successful")
      console.log("📝 Spec length:", specData.spec.length, "characters")
      console.log("📝 Spec preview:", specData.spec.substring(0, 200) + "...")
    } else {
      console.log("❌ Spec generation returned empty result")
      return
    }

    // Test 3: Code generation
    console.log("\n3. Testing AI code generation...")
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
      console.log("❌ Code generation failed:", errorData)
      return
    }

    const codeData = await codeResponse.json()
    if (codeData.code && codeData.code.length > 0) {
      console.log("✅ Code generation successful")
      console.log("💻 Code length:", codeData.code.length, "characters")
      console.log("💻 Code preview:", codeData.code.substring(0, 200) + "...")
      
      // Check if it contains HTML
      if (codeData.code.includes("<html") || codeData.code.includes("<!DOCTYPE")) {
        console.log("✅ Generated code contains valid HTML")
      } else {
        console.log("⚠️  Generated code may not contain valid HTML")
      }
    } else {
      console.log("❌ Code generation returned empty result")
      return
    }

    console.log("\n🎉 All tests passed! Video to App functionality is working correctly.")
    
  } catch (error) {
    console.error("❌ Test failed with error:", error)
  }
}

// Run the test
testVideoToApp().catch(console.error)
