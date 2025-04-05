/**
 * Visual Web Comic Dubber - Background Script
 * 
 * This script runs in the background and is responsible for:
 * 1. Communicating with the backend server for OCR
 * 2. Managing extension state
 * 3. Handling messages from the content script
 */

// Backend server URL
const BACKEND_URL = 'http://localhost:3000';

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'performOCR') {
    performOCR(message.imageData, message.bubbleId)
      .then(result => {
        sendResponse({ success: true, text: result });
        
        // Also send the result back to the content script
        chrome.tabs.sendMessage(sender.tab.id, {
          action: 'ocrResult',
          bubbleId: message.bubbleId,
          text: result
        });
      })
      .catch(error => {
        console.error('OCR error:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
});

/**
 * Perform OCR on an image using the backend server
 * 
 * @param {string} imageData - Base64 encoded image data
 * @param {number} bubbleId - ID of the bubble being processed
 * @returns {Promise<string>} - Extracted text
 */
async function performOCR(imageData, bubbleId) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageData,
        bubbleId: bubbleId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Unknown error');
    }
    
    return data.text;
  } catch (error) {
    console.error('Error performing OCR:', error);
    throw error;
  }
}
