/**
 * Visual Web Comic Dubber - Popup Script
 * 
 * This script handles the popup UI and communicates with the content script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Get UI elements
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const voiceSelect = document.getElementById('voice-select');
  const rateSlider = document.getElementById('rate-slider');
  const rateValue = document.getElementById('rate-value');
  const pitchSlider = document.getElementById('pitch-slider');
  const pitchValue = document.getElementById('pitch-value');
  const autoplayToggle = document.getElementById('autoplay-toggle');
  const saveSettingsBtn = document.getElementById('save-settings');
  
  // Load settings
  loadSettings();
  
  // Populate voice dropdown
  populateVoiceDropdown();
  
  // Add event listeners
  playBtn.addEventListener('click', () => sendCommand('play'));
  pauseBtn.addEventListener('click', () => sendCommand('pause'));
  stopBtn.addEventListener('click', () => sendCommand('stop'));
  rateSlider.addEventListener('input', updateRateValue);
  pitchSlider.addEventListener('input', updatePitchValue);
  saveSettingsBtn.addEventListener('click', saveSettings);
  
  // Check current playback state
  checkPlaybackState();
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
    autoPlay: false
  }, (items) => {
    // Update UI with loaded settings
    const voiceSelect = document.getElementById('voice-select');
    const rateSlider = document.getElementById('rate-slider');
    const rateValue = document.getElementById('rate-value');
    const pitchSlider = document.getElementById('pitch-slider');
    const pitchValue = document.getElementById('pitch-value');
    const autoplayToggle = document.getElementById('autoplay-toggle');
    
    if (items.voice !== null) {
      voiceSelect.value = items.voice;
    }
    
    rateSlider.value = items.rate;
    rateValue.textContent = items.rate;
    
    pitchSlider.value = items.pitch;
    pitchValue.textContent = items.pitch;
    
    autoplayToggle.checked = items.autoPlay;
  });
}

/**
 * Populate the voice dropdown with available voices
 */
function populateVoiceDropdown() {
  const voiceSelect = document.getElementById('voice-select');
  
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
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Default Voice';
    voiceSelect.appendChild(defaultOption);
    
    // Add voices to dropdown
    voices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
    
    // Set selected voice if available
    chrome.storage.sync.get({ voice: null }, (items) => {
      if (items.voice !== null) {
        voiceSelect.value = items.voice;
      }
    });
  }
}

/**
 * Update rate value display
 */
function updateRateValue() {
  const rateSlider = document.getElementById('rate-slider');
  const rateValue = document.getElementById('rate-value');
  rateValue.textContent = rateSlider.value;
}

/**
 * Update pitch value display
 */
function updatePitchValue() {
  const pitchSlider = document.getElementById('pitch-slider');
  const pitchValue = document.getElementById('pitch-value');
  pitchValue.textContent = pitchSlider.value;
}

/**
 * Save user settings
 */
function saveSettings() {
  const voiceSelect = document.getElementById('voice-select');
  const rateSlider = document.getElementById('rate-slider');
  const pitchSlider = document.getElementById('pitch-slider');
  const autoplayToggle = document.getElementById('autoplay-toggle');
  
  const settings = {
    voice: voiceSelect.value !== '' ? parseInt(voiceSelect.value) : null,
    rate: parseFloat(rateSlider.value),
    pitch: parseFloat(pitchSlider.value),
    autoPlay: autoplayToggle.checked
  };
  
  // Save to storage
  chrome.storage.sync.set(settings, () => {
    // Show saved message
    const saveBtn = document.getElementById('save-settings');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved!';
    saveBtn.disabled = true;
    
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }, 1500);
    
    // Send settings to active tab
    sendCommand('updateSettings', settings);
  });
}

/**
 * Send a command to the content script
 */
function sendCommand(command, data = {}) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error('No active tab found');
      return;
    }
    
    chrome.tabs.sendMessage(tabs[0].id, {
      action: command,
      data: data
    }, (response) => {
      if (command === 'getPlaybackState' && response) {
        updatePlaybackUI(response.isPlaying);
      }
    });
  });
}

/**
 * Check current playback state
 */
function checkPlaybackState() {
  sendCommand('getPlaybackState');
}

/**
 * Update UI based on playback state
 */
function updatePlaybackUI(isPlaying) {
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  
  if (isPlaying) {
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
  } else {
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
  }
}
