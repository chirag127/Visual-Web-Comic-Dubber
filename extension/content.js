/**
 * Visual Web Comic Dubber - Content Script
 * 
 * This script runs in the context of the web page and is responsible for:
 * 1. Detecting speech bubbles in comics
 * 2. Capturing screenshots of those bubbles
 * 3. Sending images to the background script for OCR
 * 4. Playing the extracted text using Web Speech API
 * 5. Injecting and managing the UI components
 */

// Global state
const state = {
  isPlaying: false,
  currentBubbleIndex: 0,
  bubbles: [],
  settings: {
    voice: null,
    rate: 1.0,
    pitch: 1.0,
    autoPlay: false,
    characterVoices: {}
  }
};

// Initialize when the page is fully loaded
window.addEventListener('load', () => {
  console.log('Visual Web Comic Dubber initialized');
  
  // Load user settings
  loadSettings();
  
  // Inject UI components
  injectUI();
  
  // Detect speech bubbles
  detectSpeechBubbles();
});

/**
 * Load user settings from storage
 */
function loadSettings() {
  chrome.storage.sync.get({
    // Default settings
    voice: null,
    rate: 1.0,
    pitch: 1.0,
    autoPlay: false,
    characterVoices: {}
  }, (items) => {
    state.settings = items;
    console.log('Settings loaded:', state.settings);
  });
}

/**
 * Inject UI components into the page
 */
function injectUI() {
  // Create floating toolbar
  const toolbar = document.createElement('div');
  toolbar.id = 'vwcd-toolbar';
  toolbar.innerHTML = `
    <button id="vwcd-play-btn" title="Play">▶</button>
    <button id="vwcd-pause-btn" title="Pause">⏸</button>
    <button id="vwcd-stop-btn" title="Stop">⏹</button>
    <button id="vwcd-settings-btn" title="Settings">⚙</button>
  `;
  document.body.appendChild(toolbar);
  
  // Make toolbar draggable
  makeElementDraggable(toolbar);
  
  // Add event listeners
  document.getElementById('vwcd-play-btn').addEventListener('click', playText);
  document.getElementById('vwcd-pause-btn').addEventListener('click', pauseText);
  document.getElementById('vwcd-stop-btn').addEventListener('click', stopText);
  document.getElementById('vwcd-settings-btn').addEventListener('click', toggleSettings);
  
  // Create settings panel (initially hidden)
  const settingsPanel = document.createElement('div');
  settingsPanel.id = 'vwcd-settings-panel';
  settingsPanel.style.display = 'none';
  settingsPanel.innerHTML = `
    <h2>Visual Web Comic Dubber Settings</h2>
    <div class="vwcd-setting-group">
      <label for="vwcd-voice-select">Voice:</label>
      <select id="vwcd-voice-select"></select>
    </div>
    <div class="vwcd-setting-group">
      <label for="vwcd-rate-slider">Speed:</label>
      <input type="range" id="vwcd-rate-slider" min="0.5" max="2" step="0.1" value="1.0">
      <span id="vwcd-rate-value">1.0</span>
    </div>
    <div class="vwcd-setting-group">
      <label for="vwcd-pitch-slider">Pitch:</label>
      <input type="range" id="vwcd-pitch-slider" min="0.5" max="2" step="0.1" value="1.0">
      <span id="vwcd-pitch-value">1.0</span>
    </div>
    <div class="vwcd-setting-group">
      <label for="vwcd-autoplay-toggle">Auto-play:</label>
      <input type="checkbox" id="vwcd-autoplay-toggle">
    </div>
    <div class="vwcd-setting-group">
      <h3>Character Voices</h3>
      <div id="vwcd-character-voices"></div>
    </div>
    <button id="vwcd-save-settings">Save Settings</button>
  `;
  document.body.appendChild(settingsPanel);
  
  // Populate voice dropdown
  populateVoiceDropdown();
  
  // Add event listeners for settings
  document.getElementById('vwcd-rate-slider').addEventListener('input', updateRateValue);
  document.getElementById('vwcd-pitch-slider').addEventListener('input', updatePitchValue);
  document.getElementById('vwcd-save-settings').addEventListener('click', saveSettings);
}

/**
 * Make an element draggable
 */
function makeElementDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  element.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e.preventDefault();
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // Call a function whenever the cursor moves
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }
  
  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/**
 * Populate the voice dropdown with available voices
 */
function populateVoiceDropdown() {
  const voiceSelect = document.getElementById('vwcd-voice-select');
  
  // Get available voices
  let voices = speechSynthesis.getVoices();
  
  // If voices aren't loaded yet, wait for them
  if (voices.length === 0) {
    speechSynthesis.addEventListener('voiceschanged', () => {
      voices = speechSynthesis.getVoices();
      populateVoiceOptions(voices);
    });
  } else {
    populateVoiceOptions(voices);
  }
  
  function populateVoiceOptions(voices) {
    // Clear existing options
    voiceSelect.innerHTML = '';
    
    // Add voices to dropdown
    voices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
    
    // Set selected voice if available
    if (state.settings.voice !== null) {
      voiceSelect.value = state.settings.voice;
    }
  }
}

/**
 * Update rate value display
 */
function updateRateValue() {
  const rateSlider = document.getElementById('vwcd-rate-slider');
  const rateValue = document.getElementById('vwcd-rate-value');
  rateValue.textContent = rateSlider.value;
}

/**
 * Update pitch value display
 */
function updatePitchValue() {
  const pitchSlider = document.getElementById('vwcd-pitch-slider');
  const pitchValue = document.getElementById('vwcd-pitch-value');
  pitchValue.textContent = pitchSlider.value;
}

/**
 * Save user settings
 */
function saveSettings() {
  const voiceSelect = document.getElementById('vwcd-voice-select');
  const rateSlider = document.getElementById('vwcd-rate-slider');
  const pitchSlider = document.getElementById('vwcd-pitch-slider');
  const autoplayToggle = document.getElementById('vwcd-autoplay-toggle');
  
  const settings = {
    voice: voiceSelect.value !== '' ? parseInt(voiceSelect.value) : null,
    rate: parseFloat(rateSlider.value),
    pitch: parseFloat(pitchSlider.value),
    autoPlay: autoplayToggle.checked,
    characterVoices: state.settings.characterVoices // Preserve character voice settings
  };
  
  // Save to storage
  chrome.storage.sync.set(settings, () => {
    console.log('Settings saved:', settings);
    state.settings = settings;
    
    // Hide settings panel
    toggleSettings();
  });
}

/**
 * Toggle settings panel visibility
 */
function toggleSettings() {
  const settingsPanel = document.getElementById('vwcd-settings-panel');
  settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
}

/**
 * Detect speech bubbles in the comic
 */
function detectSpeechBubbles() {
  // TODO: Implement speech bubble detection
  // This will be a complex function that uses DOM analysis and/or image processing
  // For now, we'll use a placeholder that simulates finding bubbles
  
  console.log('Detecting speech bubbles...');
  
  // Placeholder: In a real implementation, this would analyze the page
  // and find actual speech bubbles
  setTimeout(() => {
    // Simulate finding some bubbles
    state.bubbles = [
      { id: 1, element: null, text: 'This is a placeholder for detected text.' },
      { id: 2, element: null, text: 'This would be text from another bubble.' },
      { id: 3, element: null, text: 'And this would be from a third bubble.' }
    ];
    
    console.log(`Found ${state.bubbles.length} speech bubbles`);
    
    // If autoplay is enabled, start playing
    if (state.settings.autoPlay) {
      playText();
    }
  }, 1000);
}

/**
 * Capture a screenshot of a specific element
 */
function captureElementScreenshot(element) {
  // TODO: Implement screenshot capture
  // This will use html2canvas or similar to capture a specific element
  
  // For now, we'll use a placeholder
  return new Promise((resolve) => {
    // In a real implementation, this would capture the actual element
    resolve('data:image/png;base64,placeholder');
  });
}

/**
 * Send an image to the background script for OCR
 */
function sendImageForOCR(imageData) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      action: 'performOCR',
      imageData: imageData
    }, (response) => {
      if (response && response.success) {
        resolve(response.text);
      } else {
        reject(new Error(response ? response.error : 'Unknown error'));
      }
    });
  });
}

/**
 * Play text using Web Speech API
 */
function playText() {
  if (state.bubbles.length === 0) {
    console.log('No speech bubbles detected');
    return;
  }
  
  if (state.isPlaying) {
    // Already playing, do nothing
    return;
  }
  
  state.isPlaying = true;
  
  // Update UI
  document.getElementById('vwcd-play-btn').disabled = true;
  document.getElementById('vwcd-pause-btn').disabled = false;
  document.getElementById('vwcd-stop-btn').disabled = false;
  
  // Start or resume speech
  speakCurrentBubble();
}

/**
 * Speak the current bubble's text
 */
function speakCurrentBubble() {
  if (state.currentBubbleIndex >= state.bubbles.length) {
    // Reached the end, stop playing
    stopText();
    return;
  }
  
  const bubble = state.bubbles[state.currentBubbleIndex];
  const text = bubble.text;
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice if specified
  if (state.settings.voice !== null) {
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices[state.settings.voice];
  }
  
  // Set rate and pitch
  utterance.rate = state.settings.rate;
  utterance.pitch = state.settings.pitch;
  
  // When speech ends, move to next bubble
  utterance.onend = () => {
    state.currentBubbleIndex++;
    
    if (state.currentBubbleIndex < state.bubbles.length && state.isPlaying) {
      // Speak next bubble
      speakCurrentBubble();
    } else {
      // Reached the end or stopped
      stopText();
    }
  };
  
  // Speak the text
  speechSynthesis.speak(utterance);
}

/**
 * Pause text playback
 */
function pauseText() {
  if (!state.isPlaying) {
    return;
  }
  
  state.isPlaying = false;
  
  // Update UI
  document.getElementById('vwcd-play-btn').disabled = false;
  document.getElementById('vwcd-pause-btn').disabled = true;
  document.getElementById('vwcd-stop-btn').disabled = false;
  
  // Pause speech
  speechSynthesis.pause();
}

/**
 * Stop text playback
 */
function stopText() {
  state.isPlaying = false;
  state.currentBubbleIndex = 0;
  
  // Update UI
  document.getElementById('vwcd-play-btn').disabled = false;
  document.getElementById('vwcd-pause-btn').disabled = true;
  document.getElementById('vwcd-stop-btn').disabled = true;
  
  // Stop speech
  speechSynthesis.cancel();
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ocrResult') {
    // Handle OCR result
    console.log('Received OCR result:', message.text);
    
    // Update bubble text
    if (message.bubbleId && state.bubbles.some(b => b.id === message.bubbleId)) {
      const bubble = state.bubbles.find(b => b.id === message.bubbleId);
      bubble.text = message.text;
    }
    
    sendResponse({ success: true });
  }
});
