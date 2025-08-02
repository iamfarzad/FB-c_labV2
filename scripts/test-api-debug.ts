#!/usr/bin/env tsx

/**
 * Debug test for the API to see what's happening
 */

const API_BASE = 'http://localhost:3001';

async function testAPIDebug() {
  console.log('🔍 Testing API with debug output\n');
  
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Hello" }],
      sessionId: "debug-session",
      conversationSessionId: "debug-session",
      enableLeadGeneration: true
    })
  });
  
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const text = await response.text();
    console.log('Error response:', text);
    return;
  }
  
  // Read the stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  if (reader) {
    let eventCount = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          eventCount++;
          console.log(`Event ${eventCount}:`, line);
          
          try {
            const data = JSON.parse(line.slice(6));
            if (data.conversationStage || data.leadData) {
              console.log('🎯 Found conversation data:', data);
            }
          } catch (e) {
            // Ignore
          }
        }
      }
    }
    
    console.log(`\nTotal events received: ${eventCount}`);
  }
}

testAPIDebug().catch(console.error);