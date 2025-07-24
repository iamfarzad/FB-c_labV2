import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testGroundedSearch() {
  console.log('🧪 Testing Grounded Search Implementation...\n');

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    // Test 1: Verify correct tool configuration
    console.log('✅ Test 1: Tool Configuration');
    const tools = [
      { urlContext: {} },
      { googleSearch: {} }
    ];
    console.log('Tools configured:', JSON.stringify(tools, null, 2));

    // Test 2: Verify API configuration
    console.log('\n✅ Test 2: API Configuration');
    const config = {
      thinkingConfig: {
        thinkingBudget: -1,
      },
      tools,
      responseMimeType: 'text/plain',
    };
    console.log('Config:', JSON.stringify(config, null, 2));

    // Test 3: Test actual grounded search
    console.log('\n✅ Test 3: Grounded Search API Call');
    const model = 'gemini-2.5-flash';
    const searchQuery = `I need you to search the name "John Doe" on google and linkedin using email "john@example.com"
then summarize his background and industry, and write a quick bullet points pain point in his industry and how llm can automate most of it.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: searchQuery }]
      }
    ];

    console.log('Making API call...');
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    console.log('✅ API call successful! Collecting response...\n');
    
    let fullResponse = '';
    let chunkCount = 0;
    
    for await (const chunk of response) {
      if (chunk.text) {
        fullResponse += chunk.text;
        chunkCount++;
        process.stdout.write(chunk.text);
      }
    }

    console.log(`\n\n✅ Test completed successfully!`);
    console.log(`- Chunks received: ${chunkCount}`);
    console.log(`- Total response length: ${fullResponse.length} characters`);
    console.log(`- Response contains search results: ${fullResponse.toLowerCase().includes('search') || fullResponse.toLowerCase().includes('found')}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

// Run the test
testGroundedSearch().then(() => {
  console.log('\n🏁 Test script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
}); 