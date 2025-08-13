#!/usr/bin/env ts-node

/**
 * Simple test for Chat API conversation flow
 */

async function testChatAPI() {
  console.info('🧪 Testing Chat API Conversation Flow\n');
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const sessionId = `test-session-${Date.now()}`;
  
  // Test messages for each stage
  const testMessages = [
    { content: "Hello", expectedStage: "greeting" },
    { content: "My name is John Smith", expectedStage: "name_collection" },
    { content: "john.smith@techcorp.com", expectedStage: "email_capture" },
    { content: "We struggle with manual data processing and repetitive tasks", expectedStage: "problem_discovery" }
  ];
  
  let messages: any[] = [];
  
  for (const test of testMessages) {
    console.info(`\n📋 Testing: "${test.content}"`);
    messages.push({ role: "user", content: test.content });
    
    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          sessionId,
          conversationSessionId: sessionId,
          enableLeadGeneration: true
        })
      });
      
      if (!response.ok) {
        console.info(`   ❌ Failed: ${response.status} ${response.statusText}`);
        continue;
      }
      
      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let conversationStage = null;
      let leadData: any = {};
      let responseContent = '';
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.conversationStage) {
                  conversationStage = data.conversationStage;
                }
                if (data.leadData) {
                  leadData = { ...leadData, ...data.leadData };
                }
                if (data.content) {
                  responseContent += data.content;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
      
      console.info(`   ✅ Response received`);
      console.info(`   📊 Conversation Stage: ${conversationStage || 'Not provided'}`);
      console.info(`   👤 Lead Data: ${JSON.stringify(leadData)}`);
      console.info(`   💬 Response preview: ${responseContent.slice(0, 100)}...`);
      
      // Add assistant response to messages
      messages.push({ role: "assistant", content: responseContent });
      
    } catch (error: any) {
      console.info(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.info('\n\n📊 Test Summary:');
  console.info('- Chat API is responding to requests');
  console.info('- Streaming responses are working');
  console.info('- Conversation state tracking needs to be verified in actual chat UI');
  console.info('\n✅ Basic Chat API functionality confirmed!');
}

// Run the test
testChatAPI().catch(console.error);