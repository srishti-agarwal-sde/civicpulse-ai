const { GoogleGenAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
let useGemini = false;
let genAI = null;

if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
  try {
    // Note: In @google/generative-ai, standard initialization is new GoogleGenAI({ apiKey }) or standard import.
    // Let's verify standard SDK usage:
    // const { GoogleGenAI } = require('@google/generative-ai');
    // or: const { GoogleGenerativeAI } = require('@google/generative-ai');
    // Let's support both in code defensively.
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(apiKey);
    useGemini = true;
    console.log('Gemini AI Service initialized successfully.');
  } catch (error) {
    console.error('Error initializing Gemini SDK:', error.message);
  }
} else {
  console.log('GEMINI_API_KEY environment variable missing or set to placeholder. Using mock AI services.');
}

module.exports = {
  genAI,
  useGemini
};
