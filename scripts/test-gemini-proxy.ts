async function testGeminiProxy() {
  try {
    // Test generateImage action
    console.log('Testing generateImage action...');
    const generateImageResponse = await fetch('http://localhost:3000/api/gemini-proxy?action=generateImage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A beautiful sunset over mountains',
      }),
    });

    console.log('Generate Image Status:', generateImageResponse.status);
    const generateImageData = await generateImageResponse.json();
    console.log('Generate Image Response:', generateImageData);

    // Test generateText action
    console.log('\nTesting generateText action...');
    const generateTextResponse = await fetch('http://localhost:3000/api/gemini-proxy?action=generateText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Tell me a short joke',
      }),
    });

    console.log('Generate Text Status:', generateTextResponse.status);
    const generateTextData = await generateTextResponse.json();
    console.log('Generate Text Response:', generateTextData);

    // Test summarizeChat action
    console.log('\nTesting summarizeChat action...');
    const summarizeChatResponse = await fetch('http://localhost:3000/api/gemini-proxy?action=summarizeChat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: 'Hi there!' },
          { role: 'assistant', content: 'Hello! How can I help you today?' },
          { role: 'user', content: 'I need help with my project' },
        ],
      }),
    });

    console.log('Summarize Chat Status:', summarizeChatResponse.status);
    const summarizeChatData = await summarizeChatResponse.json();
    console.log('Summarize Chat Response:', summarizeChatData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
testGeminiProxy().catch(console.error);
