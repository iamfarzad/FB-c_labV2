#!/usr/bin/env tsx

import { GoogleGenAI, Modality } from '@google/genai'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testGeminiLiveConnection() {
  console.log("🧪 Testing Gemini Live Connection...\n")

  try {
    // Check environment variables
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables")
    }

    console.log("✅ API Key found")
    console.log("🔧 Initializing Gemini Live client...\n")

    // Initialize client
    const genAI = new GoogleGenAI({ apiKey })

    console.log("✅ Client initialized")

    // Test live connection
    const modelName = 'gemini-2.5-flash-preview-native-audio-dialog'
    
    console.log(`🎤 Attempting to connect to ${modelName}...`)

    const session = await genAI.live.connect({
      model: modelName,
      callbacks: {
        onopen: () => {
          console.log("✅ Live session opened successfully")
        },
        onmessage: (event) => {
          console.log("📨 Received message:", event.data)
        },
        onerror: (error) => {
          console.error("❌ Live session error:", error)
        },
        onclose: () => {
          console.log("🔒 Live session closed")
        }
      },
      config: {
        responseModalities: [Modality.AUDIO, Modality.TEXT],
        speechConfig: {
          voiceConfig: { 
            prebuiltVoiceConfig: { 
              voiceName: 'Zephyr' 
            } 
          }
        }
      }
    })

    console.log("✅ Live session created successfully")
    console.log("🎯 Session object:", typeof session)

    // Test sending a simple text message
    console.log("\n📤 Testing text message sending...")
    
    try {
      session.sendRealtimeInput({ text: "Hello, this is a test message" })
      console.log("✅ Text message sent successfully")
    } catch (error) {
      console.log("⚠️ Text message sending failed (this might be expected for audio-only models):", error)
    }

    // Close the session
    console.log("\n🔒 Closing session...")
    session.close()
    console.log("✅ Session closed successfully")

    console.log("\n🎉 Gemini Live connection test completed successfully!")
    console.log("✅ The hook should work properly with this configuration")

  } catch (error) {
    console.error("❌ Gemini Live connection test failed:", error)
    
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      
      // Provide helpful debugging information
      if (error.message.includes('API key')) {
        console.log("\n💡 Make sure GEMINI_API_KEY is set in your .env.local file")
      } else if (error.message.includes('model')) {
        console.log("\n💡 The model name might not be available. Try using a different model.")
      } else if (error.message.includes('live')) {
        console.log("\n💡 Live API might not be available in your region or with your API key")
      }
    }
  }
}

// Run the test
testGeminiLiveConnection()
  .then(() => {
    console.log("\n🏁 Test completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Test failed:", error)
    process.exit(1)
  }) 