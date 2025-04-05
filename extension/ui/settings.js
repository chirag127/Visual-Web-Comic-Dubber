/**
 * Visual Web Comic Dubber - Advanced Settings Script
 * 
 * This script handles the advanced settings UI and storage
 */

// Default settings
const DEFAULT_SETTINGS = {
  voice: null,
  rate: 1.0,
  pitch: 1.0,
  autoPlay: false,
  characterVoices: {},
  detectionMethod: 'hybrid',
  detectionSensitivity: 5
};

// Initialize when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get UI elements
  const defaultVoice = document.getElementById('default-voice');
  const rateSlider = document.getElementById('rate-slider');
  const rateValue = document.getElementById('rate-value');
  const pitchSlider = document.getElementById('pitch-slider');
  const pitchValue = document.getElementById('pitch-value');
  const autoplayToggle = document.getElementById('autoplay-toggle');
  const characterVoicesContainer = document.getElementById('character-voices');
  const addCharacterBtn = document.getElementById('add-character');
  const detectionMethod = document.getElementById('detection-method');
  const detectionSensitivity = document.getElementById('detection-sensitivity');
  const sensitivityValue = document.getElementById('sensitivity-value');
  const saveSettingsBtn = document.getElementById('save-settings');
  const resetSettingsBtn = document.getElementById('reset-settings');
  const statusElement = document.getElementById('status');
  
  // Load settings
  loadSettings();
  
  // Populate voice dropdown
  populateVoiceDropdown();
  
  // Add event listeners
  rateSlider.addEventListener('input', () => {
    rateValue.textContent = rateSlider.value;
  });
  
  pitchSlider.addEventListener('input', () => {
    pitchValue.textContent = pitchSlider.value;
  });
  
  detectionSensitivity.addEventListener('input', () => {
    sensitivityValue.textContent = detectionSensitivity.value;
  });
  
  addCharacterBtn.addEventListener('click', addCharacterVoice);
  saveSettingsBtn.addEventListener('click', saveSettings);
  resetSettingsBtn.addEventListener('click', resetSettings);
});

/**
 * Load user settings from storage
 */
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    // Update UI with loaded settings
    const defaultVoice = document.getElementById('default-voice');
    const rateSlider = document.getElementById('rate-slider');
    const rateValue = document.getElementById('rate-value');
    const pitchSlider = document.getElementById('pitch-slider');
    const pitchValue = document.getElementById('pitch-value');
    const autoplayToggle = document.getElementById('autoplay-toggle');
    const detectionMethod = document.getElementById('detection-method');
    const detectionSensitivity = document.getElementById('detection-sensitivity');
    const sensitivityValue = document.getElementById('sensitivity-value');
    
    // Set values
    if (settings.voice !== null) {
      defaultVoice.value = settings.voice;
    }
    
    rateSlider.value = settings.rate;
    rateValue.textContent = settings.rate;
    
    pitchSlider.value = settings.pitch;
    pitchValue.textContent = settings.pitch;
    
    autoplayToggle.checked = settings.autoPlay;
    
    detectionMethod.value = settings.detectionMethod;
    
    detectionSensitivity.value = settings.detectionSensitivity;
    sensitivityValue.textContent = settings.detectionSensitivity;
    
    // Load character voices
    loadCharacterVoices(settings.characterVoices);
  });
}

/**
 * Populate the voice dropdown with available voices
 */
function populateVoiceDropdown() {
  const defaultVoice = document.getElementById('default-voice');
  
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
    defaultVoice.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Default Voice';
    defaultVoice.appendChild(defaultOption);
    
    // Add voices to dropdown
    voices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      defaultVoice.appendChild(option);
    });
    
    // Set selected voice if available
    chrome.storage.sync.get({ voice: null }, (items) => {
      if (items.voice !== null) {
        defaultVoice.value = items.voice;
      }
    });
  }
}

/**
 * Load character voices from settings
 */
function loadCharacterVoices(characterVoices) {
  const container = document.getElementById('character-voices');
  container.innerHTML = '';
  
  // If no character voices, add an empty one
  if (Object.keys(characterVoices).length === 0) {
    addCharacterVoice();
    return;
  }
  
  // Add each character voice
  for (const [character, voiceIndex] of Object.entries(characterVoices)) {
    addCharacterVoice(character, voiceIndex);
  }
}

/**
 * Add a character voice input
 */
function addCharacterVoice(character = '', voiceIndex = '') {
  const container = document.getElementById('character-voices');
  
  const characterVoice = document.createElement('div');
  characterVoice.className = 'character-voice';
  
  // Character name input
  const characterInput = document.createElement('input');
  characterInput.type = 'text';
  characterInput.className = 'character-name';
  characterInput.placeholder = 'Character Name/Position';
  characterInput.value = character;
  
  // Voice select
  const voiceSelect = document.createElement('select');
  voiceSelect.className = 'character-voice-select';
  
  // Populate voice select
  populateVoiceSelect(voiceSelect, voiceIndex);
  
  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.className = 'danger';
  removeBtn.addEventListener('click', () => {
    container.removeChild(characterVoice);
  });
  
  // Add elements to container
  characterVoice.appendChild(characterInput);
  characterVoice.appendChild(voiceSelect);
  characterVoice.appendChild(removeBtn);
  container.appendChild(characterVoice);
}

/**
 * Populate a voice select dropdown
 */
function populateVoiceSelect(select, selectedValue = '') {
  // Get available voices
  let voices = speechSynthesis.getVoices();
  
  // If voices aren't loaded yet, wait for them
  if (voices.length === 0) {
    speechSynthesis.addEventListener('voiceschanged', () => {
      voices = speechSynthesis.getVoices();
      populateOptions(voices);
    });
  } else {
    populateOptions(voices);
  }
  
  function populateOptions(voices) {
    // Clear existing options
    select.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Voice';
    select.appendChild(defaultOption);
    
    // Add voices to dropdown
    voices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      select.appendChild(option);
    });
    
    // Set selected voice if available
    if (selectedValue !== '') {
      select.value = selectedValue;
    }
  }
}

/**
 * Save settings
 */
function saveSettings() {
  // Get values from UI
  const defaultVoice = document.getElementById('default-voice');
  const rateSlider = document.getElementById('rate-slider');
  const pitchSlider = document.getElementById('pitch-slider');
  const autoplayToggle = document.getElementById('autoplay-toggle');
  const detectionMethod = document.getElementById('detection-method');
  const detectionSensitivity = document.getElementById('detection-sensitivity');
  
  // Get character voices
  const characterVoices = {};
  const characterElements = document.querySelectorAll('.character-voice');
  
  characterElements.forEach(element => {
    const characterName = element.querySelector('.character-name').value.trim();
    const voiceIndex = element.querySelector('.character-voice-select').value;
    
    if (characterName && voiceIndex) {
      characterVoices[characterName] = voiceIndex;
    }
  });
  
  // Create settings object
  const settings = {
    voice: defaultVoice.value !== '' ? parseInt(defaultVoice.value) : null,
    rate: parseFloat(rateSlider.value),
    pitch: parseFloat(pitchSlider.value),
    autoPlay: autoplayToggle.checked,
    characterVoices: characterVoices,
    detectionMethod: detectionMethod.value,
    detectionSensitivity: parseInt(detectionSensitivity.value)
  };
  
  // Save to storage
  chrome.storage.sync.set(settings, () => {
    showStatus('Settings saved successfully!', 'success');
  });
}

/**
 * Reset settings to defaults
 */
function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    chrome.storage.sync.set(DEFAULT_SETTINGS, () => {
      loadSettings();
      showStatus('Settings reset to defaults.', 'success');
    });
  }
}

/**
 * Show status message
 */
function showStatus(message, type = 'success') {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  
  // Hide after 3 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}
