// Test script to debug Gemini API issues
require('dotenv').config();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

async function testGeminiAPI() {
  try {
    console.log('API Key loaded:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: "Hello, please respond with 'API is working'"
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    console.log('Request URL:', `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY?.slice(0, 10)}...`);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Request failed with status:', response.status);
    } else {
      console.log('Success! Generated text:', data.candidates?.[0]?.content?.parts?.[0]?.text);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testGeminiAPI();
