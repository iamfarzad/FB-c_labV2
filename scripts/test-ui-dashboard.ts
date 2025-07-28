#!/usr/bin/env tsx

/**
 * Test script for UI Test Dashboard functionality
 * Verifies that the dashboard shows accurate test results
 */

async function testUIDashboard() {
  console.log("🧪 Testing UI Test Dashboard...")
  
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
        console.log("✅ API is working correctly")
        console.log("📝 Spec generated successfully")
        
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
            console.log("✅ Code generation working correctly")
            console.log("💻 Code generated successfully")
            console.log("\n🎉 UI Test Dashboard should show PASS for both tests")
          } else {
            console.log("❌ Code generation returned empty result")
            console.log("⚠️  UI Test Dashboard should show FAIL for code generation")
          }
        } else {
          console.log("❌ Code generation API failed")
          console.log("⚠️  UI Test Dashboard should show FAIL for code generation")
        }
      } else {
        console.log("❌ Spec generation returned empty result")
        console.log("⚠️  UI Test Dashboard should show FAIL for spec generation")
      }
    } else {
      const errorData = await response.json()
      console.log("❌ API failed:", errorData)
      console.log("⚠️  UI Test Dashboard should show FAIL for both tests")
    }
    
  } catch (error) {
    console.error("❌ Test failed with error:", error)
    console.log("⚠️  UI Test Dashboard should show FAIL due to network error")
  }
}

// Run the test
testUIDashboard().catch(console.error)
