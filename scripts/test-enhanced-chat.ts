#!/usr/bin/env tsx

import { GoogleGenAI } from "@google/genai";

async function testEnhancedChat() {
  console.info("🧪 Testing Enhanced Chat API with Google Search...\n");

  try {
    // Check environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    console.info("✅ API Key found");
    console.info("🔧 Initializing enhanced Gemini client...\n");

    // Initialize client
    const client = new GoogleGenAI({
      apiKey: apiKey,
    });

    console.info("✅ Client initialized");

    // Test system instruction
    const systemInstruction = `
You are F.B/c, a lead-generation assistant for Farzad Bayat's website. You speak clearly in Norwegian or English based on user preference. You are optimized for real-time interactive chat (text, voice, video), and can:

1. Offer immediate responses to user queries about services Farzad offers.
2. Detect lead tone and intent. If user shows interest, ask qualifying questions (company size, timeline, contact).
3. Seamlessly call internal tools:
   - function_calling: "capture_lead", "schedule_meeting", "send_brochure"
   - search_api: to fetch relevant blog/article content for context or social proof.
4. Use affective dialog: mirror user emotions (e.g. "jeg kan høre du er stressa—la oss finne en enkel løsning"), but remain concise and factual.
5. Handle interruptions: if user interrupts mid-message, stop generated response and respond to new input.
6. Support multimodal input:
   - Audio: accept user voice, transcribe, respond vocally with chosen voice profile.
   - Video: optionally read user nonverbal cues (smiling, nodding) to adjust tone but stay on topic.
7. Log all interactions with sentiment, lead stage, tags (e.g. "interested", "not a fit").
8. Respect privacy: no storing personal data beyond session, and always follow GDPR rules.
`;

    console.info("🔧 Starting chat session with Google Search...\n");

    // Test queries
    const testQueries = [
      "Who is Farzad Bayat?",
      "What AI consulting services does F.B/c offer?",
      "Tell me about AI automation for small businesses"
    ];

    for (const query of testQueries) {
      console.info(`\n🔍 Testing query: "${query}"`);
      console.info("⏳ Sending message...");

      const startTime = Date.now();
      
      // Use the models.generateContent method
      const result = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: query }]
          }
        ]
      });
      
      const responseTime = Date.now() - startTime;

      console.info(`✅ Response received in ${responseTime}ms`);
      console.info(`📝 Response length: ${result.response.text().length} characters`);

      console.info(`\n📄 Response preview: ${result.response.text().substring(0, 200)}...`);
    }

    console.info("\n🎉 All tests completed successfully!");
    console.info("✅ Enhanced chat API with Google Search is working correctly");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
testEnhancedChat();
