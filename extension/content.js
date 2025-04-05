// Global variables
let isReading = false;
let textQueue = [];
let currentSettings = {
  voiceIndex: 0,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  backendUrl: 'http://localhost:3000'
};
let processedImages = new Set();

// Initialize speech synthesis
const synth = window.speechSynthesis;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startReading') {
    // Update settings
    currentSettings = message.settings;
    
    // Start reading if not already reading
    if (!isReading) {
      isReading = true;
      processedImages.clear();
      textQueue = [];
      
      // Start processing images
      processComicImages()
        .then(() => {
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error processing comic images:', error);
          sendResponse({ error: error.message });
          isReading = false;
        });
    } else {
      sendResponse({ success: true, message: 'Already reading' });
    }
    
    return true; // Keep the message channel open for async response
  } 
  else if (message.action === 'stopReading') {
    stopReading();
    sendResponse({ success: true });
  }
});

// Function to detect and process comic images
async function processComicImages() {
  // Find all images on the page
  const images = Array.from(document.querySelectorAll('img'));
  
  // Filter for likely comic images (larger than 200x200 pixels)
  const comicImages = images.filter(img => {
    return img.complete && 
           img.naturalWidth > 200 && 
           img.naturalHeight > 200 &&
           isVisible(img) &&
           !processedImages.has(img.src);
  });
  
  if (comicImages.length === 0) {
    speak("No comic images found on this page.");
    isReading = false;
    return;
  }
  
  // Process each image one by one
  for (const img of comicImages) {
    if (!isReading) break; // Stop if reading was cancelled
    
    try {
      // Mark image as processed
      processedImages.add(img.src);
      
      // Highlight the current image
      const originalStyle = {
        outline: img.style.outline,
        outlineOffset: img.style.outlineOffset
      };
      
      img.style.outline = '3px solid #4285f4';
      img.style.outlineOffset = '2px';
      
      // Scroll to the image
      img.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Extract text from image
      const text = await extractTextFromImage(img);
      
      // Remove highlight after processing
      img.style.outline = originalStyle.outline;
      img.style.outlineOffset = originalStyle.outlineOffset;
      
      if (text && text.trim()) {
        // Add text to queue and speak
        textQueue.push(text);
        
        // If this is the first text, start speaking
        if (textQueue.length === 1) {
          speakNextInQueue();
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
      // Continue with next image
    }
  }
  
  // If no text was found in any image
  if (textQueue.length === 0) {
    speak("No text could be extracted from the comic images.");
    isReading = false;
  }
}

// Function to extract text from an image using the backend OCR service
async function extractTextFromImage(img) {
  try {
    // Convert image to blob
    const blob = await imageToBlob(img);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', blob, 'comic_image.jpg');
    
    // Send to backend
    const response = await fetch(`${currentSettings.backendUrl}/ocr`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract text');
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    return null;
  }
}

// Convert an image element to a blob
function imageToBlob(img) {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      // Draw image to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Convert to blob
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert image to blob'));
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      reject(error);
    }
  });
}

// Check if an element is visible
function isVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         element.offsetWidth > 0 && 
         element.offsetHeight > 0;
}

// Speak text using Web Speech API
function speak(text) {
  if (!text || !isReading) return;
  
  // Cancel any ongoing speech
  if (synth.speaking) {
    synth.cancel();
  }
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice
  const voices = synth.getVoices();
  if (voices.length > 0) {
    utterance.voice = voices[currentSettings.voiceIndex] || voices[0];
  }
  
  // Set other properties
  utterance.rate = currentSettings.rate;
  utterance.pitch = currentSettings.pitch;
  utterance.volume = currentSettings.volume;
  
  // Handle end of speech
  utterance.onend = () => {
    if (isReading) {
      // Remove the spoken text from the queue
      textQueue.shift();
      
      // Speak next text in queue
      if (textQueue.length > 0) {
        setTimeout(() => {
          speakNextInQueue();
        }, 500); // Small pause between texts
      } else {
        // If queue is empty, look for more images
        processComicImages();
      }
    }
  };
  
  // Handle errors
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event.error);
    textQueue.shift(); // Remove problematic text
    
    if (textQueue.length > 0) {
      speakNextInQueue();
    }
  };
  
  // Speak the text
  synth.speak(utterance);
}

// Speak the next text in the queue
function speakNextInQueue() {
  if (textQueue.length > 0 && isReading) {
    speak(textQueue[0]);
  }
}

// Stop reading
function stopReading() {
  isReading = false;
  textQueue = [];
  
  // Cancel any ongoing speech
  if (synth.speaking) {
    synth.cancel();
  }
  
  // Remove any highlights
  document.querySelectorAll('img').forEach(img => {
    if (img.style.outline.includes('solid #4285f4')) {
      img.style.outline = '';
      img.style.outlineOffset = '';
    }
  });
}
