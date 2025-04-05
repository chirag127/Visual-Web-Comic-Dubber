/**
 * Gemini OCR Service
 * 
 * Provides OCR functionality using Google Gemini 2.0 Flash API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract text from an image using Gemini 2.0 Flash API
 * 
 * @param {string} base64Image - Base64 encoded image data
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromImage(base64Image) {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Create prompt with the image
    const prompt = 'Extract all text from this comic speech bubble. Return only the text content, with no additional commentary.';
    
    // Create image part
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/png'
      }
    };
    
    // Generate content
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error(`OCR failed: ${error.message}`);
  }
}

module.exports = {
  extractTextFromImage
};
