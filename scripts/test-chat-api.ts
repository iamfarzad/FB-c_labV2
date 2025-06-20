async function testChatAPI() {
  try {
    // Test with a simple text message
    const testPayload = {
      messages: [
        {
          role: 'user',
          parts: [{ text: 'Hello, how are you?' }]
        }
      ]
    };

    console.log('Sending test request to chat API...');
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      return;
    }

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Handle streaming response
    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      let responseText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        responseText += chunk;
        console.log('Received chunk:', chunk);
      }

      console.log('\nFull response:', responseText);
    } else {
      const responseText = await response.text();
      console.log('Response body:', responseText);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testChatAPI().catch(console.error);
