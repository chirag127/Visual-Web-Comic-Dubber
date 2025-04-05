// Background script for Visual Web Comic Dubber

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on install
    chrome.storage.sync.set({
      voiceIndex: 0,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      backendUrl: 'http://localhost:3000'
    });
    
    // Open options page on install
    chrome.tabs.create({
      url: 'popup.html'
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle any background tasks here
  if (message.action === 'checkBackendStatus') {
    checkBackendStatus(message.backendUrl)
      .then(status => {
        sendResponse({ status });
      })
      .catch(error => {
        sendResponse({ error: error.message });
      });
    
    return true; // Keep the message channel open for async response
  }
});

// Function to check if backend is running
async function checkBackendStatus(backendUrl) {
  try {
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return 'online';
    } else {
      return 'error';
    }
  } catch (error) {
    console.error('Backend check error:', error);
    return 'offline';
  }
}
