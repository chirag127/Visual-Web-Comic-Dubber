// Global variables
let isReading = false;
let textQueue = [];
let currentSettings = {
    voiceIndex: 0,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    backendUrl: "http://localhost:3001",
};
let processedImages = new Set();

// Initialize speech synthesis
const synth = window.speechSynthesis;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.action === "startReading") {
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
                .catch((error) => {
                    console.error("Error processing comic images:", error);
                    sendResponse({ error: error.message });
                    isReading = false;
                });
        } else {
            sendResponse({ success: true, message: "Already reading" });
        }

        return true; // Keep the message channel open for async response
    } else if (message.action === "stopReading") {
        stopReading();
        sendResponse({ success: true });
    }
});

// Function to detect and process comic images
async function processComicImages() {
    // Find all images on the page
    const images = Array.from(document.querySelectorAll("img"));

    // Log the number of images found
    console.log(`Found ${images.length} images on the page`);

    // Filter for likely comic images (larger than 200x200 pixels)
    const comicImages = images.filter((img) => {
        const isValid =
            img.complete &&
            img.naturalWidth > 200 &&
            img.naturalHeight > 200 &&
            isVisible(img) &&
            !processedImages.has(img.src);

        if (isValid) {
            console.log(
                `Found valid comic image: ${img.src} (${img.naturalWidth}x${img.naturalHeight})`
            );
        }

        return isValid;
    });

    if (comicImages.length === 0) {
        console.log("No comic images found on this page");
        speak(
            "No comic images found on this page. Try scrolling down to load more images."
        );
        isReading = false;
        return;
    }

    console.log(`Processing ${comicImages.length} comic images`);

    // Sort images by their vertical position (top to bottom)
    comicImages.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return rectA.top - rectB.top;
    });

    // Process each image one by one
    for (const img of comicImages) {
        if (!isReading) break; // Stop if reading was cancelled

        try {
            // Mark image as processed
            processedImages.add(img.src);

            // Highlight the current image
            const originalStyle = {
                outline: img.style.outline,
                outlineOffset: img.style.outlineOffset,
            };

            img.style.outline = "3px solid #4285f4";
            img.style.outlineOffset = "2px";

            // Scroll to the image
            img.scrollIntoView({ behavior: "smooth", block: "center" });

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
            console.error("Error processing image:", error);
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
        console.log(`Extracting text from image: ${img.src}`);

        // Convert image to blob
        const blob = await imageToBlob(img);
        console.log(
            `Image blob created: ${blob.size} bytes, type: ${blob.type}`
        );

        // Create form data
        const formData = new FormData();
        formData.append("image", blob, "comic_image.jpg");

        // Send to backend
        console.log(
            `Sending image to OCR service at ${currentSettings.backendUrl}/ocr`
        );
        const response = await fetch(`${currentSettings.backendUrl}/ocr`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = `Server returned ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
                if (errorData.details) {
                    errorMessage += `: ${errorData.details}`;
                }
            } catch (e) {
                // If we can't parse the error as JSON, use the status text
                console.error("Failed to parse error response as JSON:", e);
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(
            `OCR result received: ${
                data.text ? data.text.substring(0, 50) + "..." : "No text"
            }`
        );

        if (
            !data.text ||
            data.text.trim() === "" ||
            data.text === "No text detected in this image."
        ) {
            console.log("No text detected in the image");
            return null;
        }

        return data.text;
    } catch (error) {
        console.error("OCR Error:", error);
        return null;
    }
}

// Convert an image element to a blob
function imageToBlob(img) {
    return new Promise((resolve, reject) => {
        try {
            console.log(
                `Converting image to blob: ${img.src} (${img.naturalWidth}x${img.naturalHeight})`
            );

            // Handle cross-origin images
            if (isCrossOrigin(img.src)) {
                console.log(
                    "Cross-origin image detected, using fetch to get blob"
                );
                return fetchImageAsBlob(img.src).then(resolve).catch(reject);
            }

            // Create canvas
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Draw image to canvas
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        console.log(
                            `Successfully converted image to blob: ${blob.size} bytes`
                        );
                        resolve(blob);
                    } else {
                        console.error("Failed to convert image to blob");
                        reject(new Error("Failed to convert image to blob"));
                    }
                },
                "image/jpeg",
                0.95
            );
        } catch (error) {
            console.error("Error converting image to blob:", error);
            reject(error);
        }
    });
}

// Check if URL is cross-origin
function isCrossOrigin(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.origin !== window.location.origin;
    } catch (e) {
        return false;
    }
}

// Fetch image as blob for cross-origin images
async function fetchImageAsBlob(url) {
    try {
        const response = await fetch(url, { mode: "cors" });
        if (!response.ok) {
            throw new Error(
                `Failed to fetch image: ${response.status} ${response.statusText}`
            );
        }
        return await response.blob();
    } catch (error) {
        console.error("Error fetching image as blob:", error);
        throw error;
    }
}

// Check if an element is visible
function isVisible(element) {
    const style = window.getComputedStyle(element);
    return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
    );
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
        console.error("Speech synthesis error:", event.error);
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
    document.querySelectorAll("img").forEach((img) => {
        if (img.style.outline.includes("solid #4285f4")) {
            img.style.outline = "";
            img.style.outlineOffset = "";
        }
    });
}
