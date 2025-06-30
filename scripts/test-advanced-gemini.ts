// Test script for advanced Gemini features
// Run with: npx ts-node scripts/test-advanced-gemini.ts

async function testAdvancedGemini() {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000';

  const testPrompt = "I need you to search for information about AI companies and give me a detailed analysis of the current market trends in artificial intelligence.";

  console.log('🧪 Testing Advanced Gemini Features...\n');
  console.log('Features being tested:');
  console.log('✅ Thinking Config (thinkingBudget: -1)');
  console.log('✅ URL Context Tools');
  console.log('✅ Streaming Response');
  console.log('✅ Model: gemini-2.5-flash (Stable GA)\n');

  try {
    const response = await fetch(`${baseUrl}/api/gemini-advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: testPrompt
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log('🎉 SUCCESS! Advanced features are working.\n');
      console.log('📊 Response Details:');
      console.log(`- Model: ${data.data.model}`);
      console.log(`- Thinking Enabled: ${data.data.features.thinkingEnabled}`);
      console.log(`- URL Context Enabled: ${data.data.features.urlContextEnabled}`);
      console.log(`- Streaming: ${data.data.features.streaming}`);
      console.log(`- Chunks Received: ${data.data.chunks.length}`);
      console.log(`- Total Text Length: ${data.data.text.length} characters\n`);
      
      console.log('📝 Response Preview:');
      console.log(data.data.text.substring(0, 200) + '...\n');
      
      console.log('🔍 Stream Chunks:');
      data.data.chunks.slice(0, 3).forEach((chunk: any, i: number) => {
        console.log(`  Chunk ${i + 1}: "${chunk.text.substring(0, 50)}..."`);
      });
      
    } else {
      console.log('❌ FAILED!');
      console.log('Error:', data.error);
      if (data.details) {
        console.log('Details:', data.details);
      }
    }

  } catch (error: any) {
    console.log('❌ REQUEST FAILED!');
    console.error('Error:', error.message);
  }
}

// Run the test
testAdvancedGemini(); 