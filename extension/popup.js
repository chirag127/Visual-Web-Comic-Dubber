document.addEventListener("DOMContentLoaded", function () {
    // UI Elements
    const startButton = document.getElementById("startReading");
    const stopButton = document.getElementById("stopReading");
    const debugButton = document.getElementById("debugButton");
    const voiceSelect = document.getElementById("voice");
    const rateInput = document.getElementById("rate");
    const pitchInput = document.getElementById("pitch");
    const volumeInput = document.getElementById("volume");
    const batchSizeInput = document.getElementById("batchSize");
    const rateValue = document.getElementById("rateValue");
    const pitchValue = document.getElementById("pitchValue");
    const volumeValue = document.getElementById("volumeValue");
    const batchSizeValue = document.getElementById("batchSizeValue");
    const statusElement = document.getElementById("status");
    const backendUrlInput = document.getElementById("backendUrl");

    // Initialize TTS voices
    function loadVoices() {
        const voices = speechSynthesis.getVoices();
        voiceSelect.innerHTML = "";

        voices.forEach((voice, index) => {
            const option = document.createElement("option");
            option.textContent = `${voice.name} (${voice.lang})`;
            option.value = index;

            // Set default voice (prefer English)
            if (voice.default || voice.lang.includes("en-")) {
                option.selected = true;
            }

            voiceSelect.appendChild(option);
        });

        // If no voices are available yet, try again
        if (voices.length === 0) {
            setTimeout(loadVoices, 100);
        }
    }

    // Load voices when available
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    // Load saved settings
    function loadSettings() {
        chrome.storage.sync.get(
            {
                voiceIndex: 0,
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                batchSize: 5,
                backendUrl: "https://visual-web-comic-dubber.onrender.com",
            },
            function (items) {
                // Set values after voices are loaded
                setTimeout(() => {
                    if (voiceSelect.options.length > 0) {
                        voiceSelect.value =
                            items.voiceIndex < voiceSelect.options.length
                                ? items.voiceIndex
                                : 0;
                    }
                }, 100);

                rateInput.value = items.rate;
                pitchInput.value = items.pitch;
                volumeInput.value = items.volume;
                batchSizeInput.value = items.batchSize;
                backendUrlInput.value = items.backendUrl;

                // Update displayed values
                rateValue.textContent = items.rate.toFixed(1);
                pitchValue.textContent = items.pitch.toFixed(1);
                volumeValue.textContent = items.volume.toFixed(1);
                batchSizeValue.textContent = items.batchSize;
            }
        );
    }

    // Save settings
    function saveSettings() {
        chrome.storage.sync.set({
            voiceIndex: parseInt(voiceSelect.value, 10),
            rate: parseFloat(rateInput.value),
            pitch: parseFloat(pitchInput.value),
            volume: parseFloat(volumeInput.value),
            batchSize: parseInt(batchSizeInput.value, 10),
            backendUrl: backendUrlInput.value,
        });
    }

    // Update displayed values when sliders change
    rateInput.addEventListener("input", function () {
        rateValue.textContent = parseFloat(this.value).toFixed(1);
        saveSettings();
    });

    pitchInput.addEventListener("input", function () {
        pitchValue.textContent = parseFloat(this.value).toFixed(1);
        saveSettings();
    });

    volumeInput.addEventListener("input", function () {
        volumeValue.textContent = parseFloat(this.value).toFixed(1);
        saveSettings();
    });

    batchSizeInput.addEventListener("input", function () {
        batchSizeValue.textContent = parseInt(this.value, 10);
        saveSettings();
    });

    // Save settings when voice or backend URL changes
    voiceSelect.addEventListener("change", saveSettings);
    backendUrlInput.addEventListener("change", saveSettings);

    // Start reading comics
    startButton.addEventListener("click", function () {
        // Update status
        statusElement.textContent = "Starting comic reader...";
        statusElement.className = "status";

        // Get current settings
        const settings = {
            voiceIndex: parseInt(voiceSelect.value, 10),
            rate: parseFloat(rateInput.value),
            pitch: parseFloat(pitchInput.value),
            volume: parseFloat(volumeInput.value),
            batchSize: parseInt(batchSizeInput.value, 10),
            backendUrl: backendUrlInput.value,
        };

        // Check backend URL
        if (!settings.backendUrl) {
            statusElement.textContent = "Error: Backend URL is required";
            statusElement.className = "status error";
            return;
        }

        // Send message to content script
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        action: "startReading",
                        settings: settings,
                    },
                    function (response) {
                        if (chrome.runtime.lastError) {
                            statusElement.textContent =
                                "Error: " + chrome.runtime.lastError.message;
                            statusElement.className = "status error";
                            return;
                        }

                        if (response && response.success) {
                            statusElement.textContent =
                                "Reading comic images...";
                            statusElement.className = "status success";
                        } else if (response && response.error) {
                            statusElement.textContent =
                                "Error: " + response.error;
                            statusElement.className = "status error";
                        }
                    }
                );
            }
        );
    });

    // Stop reading
    stopButton.addEventListener("click", function () {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {
                        action: "stopReading",
                    },
                    function (_) {
                        statusElement.textContent = "Reading stopped.";
                        statusElement.className = "status";
                    }
                );
            }
        );

        // Also stop any speech synthesis in the popup
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
    });

    // Debug button to open console
    debugButton.addEventListener("click", function () {
        chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
                chrome.tabs.executeScript(tabs[0].id, {
                    code: 'console.log("Debug mode activated"); console.log("Current settings:", currentSettings);',
                });

                // Open DevTools
                chrome.tabs.executeScript(tabs[0].id, {
                    code: "setTimeout(() => { debugger; }, 500);",
                });

                statusElement.textContent =
                    "Debug mode activated. Press F12 to see console.";
            }
        );
    });

    // Load settings when popup opens
    loadSettings();
});
