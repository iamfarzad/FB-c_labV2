const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found in environment variables');
    return;
  }
  
  console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('🤖 Testing Gemini API...');
    const result = await model.generateContent("Hello, this is a test.");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Test SUCCESS!');
    console.log('📝 Response:', text);
    
  } catch (error) {
    console.log('❌ API Test FAILED!');
    console.log('🔍 Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('💡 This suggests the API key is invalid or has been revoked');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.log('💡 This suggests quota/billing issues');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('💡 This suggests the project is disabled or billing issues');
    }
  }
}

testGeminiAPI();
