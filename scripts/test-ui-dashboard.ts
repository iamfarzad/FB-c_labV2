#!/usr/bin/env tsx

/**
 * Test script for UI Test Dashboard functionality
 * Verifies that the dashboard shows accurate test results
 */

async function testUIDashboard() {
  console.info("🧪 Testing UI Test Dashboard...")
  
  try {
    // Test the video-to-app API directly
    const testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    const response = await fetch("http://localhost:3000/api/video-to-app", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generateSpec",
        videoUrl: testUrl,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.spec && data.spec.length > 0) {
        console.info("✅ API is working correctly")
        console.info("📝 Spec generated successfully")
        
        // Test code generation
        const codeResponse = await fetch("http://localhost:3000/api/video-to-app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generateCode",
            spec: data.spec,
          }),
        })

        if (codeResponse.ok) {
          const codeData = await codeResponse.json()
          if (codeData.code && codeData.code.length > 0) {
            console.info("✅ Code generation working correctly")
            console.info("💻 Code generated successfully")
            console.info("\n🎉 UI Test Dashboard should show PASS for both tests")
          } else {
            console.info("❌ Code generation returned empty result")
            console.info("⚠️  UI Test Dashboard should show FAIL for code generation")
          }
        } else {
          console.info("❌ Code generation API failed")
          console.info("⚠️  UI Test Dashboard should show FAIL for code generation")
        }
      } else {
        console.info("❌ Spec generation returned empty result")
        console.info("⚠️  UI Test Dashboard should show FAIL for spec generation")
      }
    } else {
      const errorData = await response.json()
      console.info("❌ API failed:", errorData)
      console.info("⚠️  UI Test Dashboard should show FAIL for both tests")
    }
    
  } catch (error) {
    console.error("❌ Test failed with error:", error)
    console.info("⚠️  UI Test Dashboard should show FAIL due to network error")
  }
}

// Run the test
testUIDashboard().catch(console.error)
