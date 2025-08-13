#!/usr/bin/env tsx

/**
 * Comprehensive test for the full conversation flow with real API calls
 */

const API_BASE = 'http://localhost:3001';

interface TestStep {
  userMessage: string;
  expectedStage?: string;
  expectedLeadData?: {
    name?: string;
    email?: string;
    company?: string;
  };
  description: string;
}

async function testFullConversation() {
  console.info('🧪 Testing Full Conversation Flow with Lead Generation\n');
  
  const sessionId = `test-full-${Date.now()}`;
  const messages: any[] = [];
  
  const testSteps: TestStep[] = [
    {
      userMessage: "Hello",
      expectedStage: "name_collection",
      description: "Initial greeting should trigger name collection"
    },
    {
      userMessage: "My name is John Smith",
      expectedStage: "email_capture",
      expectedLeadData: { name: "John Smith" },
      description: "Providing name should move to email capture"
    },
    {
      userMessage: "john.smith@techcorp.com",
      expectedStage: "background_research",
      expectedLeadData: { name: "John Smith", email: "john.smith@techcorp.com" },
      description: "Providing email should trigger background research"
    },
    {
      userMessage: "We're struggling with manual data entry and customer response times",
      expectedStage: "problem_discovery",
      description: "Describing problems should be in problem discovery stage"
    },
    {
      userMessage: "That sounds great, what are the next steps?",
      expectedStage: "call_to_action",
      description: "Showing interest should trigger call to action"
    }
  ];
  
  for (const step of testSteps) {
    console.info(`\n📍 ${step.description}`);
    console.info(`   User: "${step.userMessage}"`);
    
    // Add user message to conversation history
    messages.push({ role: "user", content: step.userMessage });
    
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          data: {
            sessionId,
            conversationSessionId: sessionId,
            enableLeadGeneration: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let conversationStage = null;
      let leadData = null;
      
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
                  leadData = data.leadData;
                }
                
                if (data.content) {
                  assistantMessage += data.content;
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
      
      // Add assistant message to conversation history
      messages.push({ role: "assistant", content: assistantMessage });
      
      // Display results
      console.info(`   Assistant: "${assistantMessage.substring(0, 100)}..."`);
      console.info(`   Stage: ${conversationStage || 'Not provided'}`);
      console.info(`   Lead Data: ${JSON.stringify(leadData || {})}`);
      
      // Validate expectations
      if (step.expectedStage && conversationStage !== step.expectedStage) {
        console.info(`   ❌ Expected stage: ${step.expectedStage}, got: ${conversationStage}`);
      } else if (step.expectedStage) {
        console.info(`   ✅ Stage transition correct`);
      }
      
      if (step.expectedLeadData) {
        const dataMatches = Object.entries(step.expectedLeadData).every(([key, value]) => 
          leadData && leadData[key] === value
        );
        if (dataMatches) {
          console.info(`   ✅ Lead data correct`);
        } else {
          console.info(`   ❌ Lead data mismatch`);
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error}`);
    }
  }
  
  console.info('\n✅ Test completed!');
}

// Run the test
testFullConversation().catch(console.error);