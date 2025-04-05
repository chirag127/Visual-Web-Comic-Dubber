// Global variables
let isReading = false;
let textQueue = [];
let imageQueue = [];
let currentSettings = {
    voiceIndex: 0,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    backendUrl: "http://localhost:3001",
};
let processedImages = new Set();
let currentHighlightedImage = null;
let isProcessingNextImage = false;
let currentImageIndex = -1;

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
    // Reset state
    textQueue = [];
    imageQueue = [];
    currentImageIndex = -1;
    isProcessingNextImage = false;

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

    console.log(`Found ${comicImages.length} comic images`);

    // Sort images by their vertical position (top to bottom)
    imageQueue = comicImages.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return rectA.top - rectB.top;
    });

    console.log(`Sorted ${imageQueue.length} comic images by position`);

    // Start processing the first image
    await processNextImage();
}

// Process the next image in the queue
async function processNextImage() {
    if (!isReading || imageQueue.length === 0) {
        // If we've processed all images and no text was found
        if (textQueue.length === 0) {
            speak("No text could be extracted from the comic images.");
            isReading = false;
        }
        return;
    }

    currentImageIndex++;
    if (currentImageIndex >= imageQueue.length) {
        console.log("Reached the end of the image queue");
        return;
    }

    const img = imageQueue[currentImageIndex];
    console.log(
        `Processing image ${currentImageIndex + 1}/${imageQueue.length}: ${
            img.src
        }`
    );

    try {
        // Mark image as processed
        processedImages.add(img.src);

        // Highlight the current image
        highlightImage(img);

        // Scroll to the image
        img.scrollIntoView({ behavior: "smooth", block: "center" });

        // Extract text from image
        const text = await extractTextFromImage(img);

        if (text && text.trim()) {
            console.log(
                `Text extracted from image ${
                    currentImageIndex + 1
                }: ${text.substring(0, 50)}...`
            );
            // Add text to queue
            textQueue.push({
                text: text,
                image: img,
            });

            // If this is the first text, start speaking
            if (textQueue.length === 1) {
                speakNextInQueue();
            }
        } else {
            console.log(`No text found in image ${currentImageIndex + 1}`);
            // If no text was found, remove highlight and process next image
            removeHighlight();
            await processNextImage();
        }
    } catch (error) {
        console.error(
            `Error processing image ${currentImageIndex + 1}:`,
            error
        );
        // Continue with next image
        removeHighlight();
        await processNextImage();
    }

    // Pre-process the next image if we're not already doing so
    if (!isProcessingNextImage && currentImageIndex + 1 < imageQueue.length) {
        preProcessNextImage();
    }
}

// Pre-process the next image while speaking the current one
async function preProcessNextImage() {
    if (currentImageIndex + 1 >= imageQueue.length || isProcessingNextImage) {
        return;
    }

    isProcessingNextImage = true;
    const nextImg = imageQueue[currentImageIndex + 1];
    console.log(`Pre-processing next image: ${nextImg.src}`);

    try {
        // Prepare the next image by extracting text in advance
        const text = await extractTextFromImage(nextImg);
        if (text && text.trim()) {
            console.log(
                `Pre-processed text for next image: ${text.substring(0, 50)}...`
            );
            // Store the pre-processed text for later use
            nextImg.dataset.preProcessedText = text;
        } else {
            console.log(`No text found in pre-processed image`);
        }
    } catch (error) {
        console.error("Error pre-processing next image:", error);
    } finally {
        isProcessingNextImage = false;
    }
}

// Highlight the current image being processed
function highlightImage(img) {
    // Remove any existing highlight
    removeHighlight();

    // Store the original style
    currentHighlightedImage = {
        element: img,
        originalOutline: img.style.outline,
        originalOutlineOffset: img.style.outlineOffset,
        originalBoxShadow: img.style.boxShadow,
        originalBorder: img.style.border,
    };

    // Apply highlight
    img.style.outline = "4px solid #4285f4";
    img.style.outlineOffset = "3px";
    img.style.boxShadow = "0 0 20px rgba(66, 133, 244, 0.8)";
    img.style.border = "2px solid #4285f4";

    console.log(`Highlighted image: ${img.src}`);
}

// Remove highlight from the current image
function removeHighlight() {
    if (currentHighlightedImage) {
        const img = currentHighlightedImage.element;
        img.style.outline = currentHighlightedImage.originalOutline;
        img.style.outlineOffset = currentHighlightedImage.originalOutlineOffset;
        img.style.boxShadow = currentHighlightedImage.originalBoxShadow;
        img.style.border = currentHighlightedImage.originalBorder;

        console.log(`Removed highlight from image: ${img.src}`);
        currentHighlightedImage = null;
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
            // If we're speaking from the queue, process the next item
            if (textQueue.length > 0) {
                // Remove the spoken text from the queue
                textQueue.shift();

                // Speak next text in queue or process next image
                if (textQueue.length > 0) {
                    setTimeout(() => {
                        speakNextInQueue();
                    }, 500); // Small pause between texts
                } else {
                    // If text queue is empty, process the next image
                    setTimeout(() => {
                        removeHighlight();
                        processNextImage();
                    }, 500);
                }
            }
        }
    };

    // Handle errors
    utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);

        if (textQueue.length > 0) {
            textQueue.shift(); // Remove problematic text
            if (textQueue.length > 0) {
                speakNextInQueue();
            } else {
                removeHighlight();
                processNextImage();
            }
        }
    };

    // Speak the text
    console.log(`Speaking: ${text.substring(0, 50)}...`);
    synth.speak(utterance);
}

// Speak the next text in the queue
function speakNextInQueue() {
    if (textQueue.length > 0 && isReading) {
        const item = textQueue[0];
        // Highlight the image associated with the text
        if (item.image) {
            highlightImage(item.image);
        }
        speak(item.text);
    }
}

// Stop reading
function stopReading() {
    isReading = false;
    textQueue = [];
    imageQueue = [];
    currentImageIndex = -1;
    isProcessingNextImage = false;

    // Cancel any ongoing speech
    if (synth.speaking) {
        synth.cancel();
    }

    // Remove any highlights
    removeHighlight();

    console.log("Reading stopped");
}
