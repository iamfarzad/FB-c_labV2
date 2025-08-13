#!/usr/bin/env tsx

/**
 * Debug test for the API to see what's happening
 */

const API_BASE = 'http://localhost:3001';

async function testAPIDebug() {
  console.info('🔍 Testing API with debug output\n');
  
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
  
  console.info('Response status:', response.status);
  console.info('Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const text = await response.text();
    console.info('Error response:', text);
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
          console.info(`Event ${eventCount}:`, line);
          
          try {
            const data = JSON.parse(line.slice(6));
            if (data.conversationStage || data.leadData) {
              console.info('🎯 Found conversation data:', data);
            }
          } catch (e) {
            // Ignore
          }
        }
      }
    }
    
    console.info(`\nTotal events received: ${eventCount}`);
  }
}

testAPIDebug().catch(console.error);