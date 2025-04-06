// Global variables
let isReading = false;
let textQueue = [];
let imageQueue = [];
let currentSettings = {
    voiceIndex: 0,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    batchSize: 5,
    backendUrl: "https://visual-web-comic-dubber.onrender.com",
};
let processedImages = new Set();
let currentHighlightedImage = null;
let isProcessingNextImage = false;
let currentImageIndex = -1;
let currentBatchIndex = 0;
let batchSize = 5; // Default batch size, will be updated from settings
let batchResults = {}; // Store OCR results for each batch

// Initialize speech synthesis
const synth = window.speechSynthesis;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.action === "startReading") {
        // Update settings
        currentSettings = {
            voiceIndex: parseInt(message.settings.voiceIndex, 10),
            rate: parseFloat(message.settings.rate),
            pitch: parseFloat(message.settings.pitch),
            volume: parseFloat(message.settings.volume),
            batchSize: parseInt(message.settings.batchSize, 10),
            backendUrl: message.settings.backendUrl,
        };

        // Update batch size from settings
        batchSize = currentSettings.batchSize;

        console.log("Received settings:", currentSettings);
        console.log(`Batch size set to ${batchSize} images`);

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

// Function to directly extract image URLs from the specific website structure
function extractImagesFromSpecificWebsite() {
    console.log(
        "Attempting to directly extract images from the specific website structure..."
    );
    const images = [];

    try {
        // Look for the specific structure in the example
        const readBoxes = document.querySelectorAll(".read-box");
        console.log(`Found ${readBoxes.length} read-box elements`);

        if (readBoxes.length > 0) {
            // Extract image URLs directly from the DOM structure
            readBoxes.forEach((box) => {
                const imgElement = box.querySelector(".el-image__inner");
                if (imgElement && imgElement.src) {
                    console.log(`Found image in read-box: ${imgElement.src}`);
                    images.push(imgElement);
                } else {
                    // Try to find the image URL in the style background
                    const imgContainer = box.querySelector(".el-image");
                    if (imgContainer) {
                        const style = window.getComputedStyle(imgContainer);
                        const bgImage = style.backgroundImage;
                        if (bgImage && bgImage !== "none") {
                            const url = bgImage.replace(
                                /url\(['"]?(.*?)['"]?\)/i,
                                "$1"
                            );
                            console.log(`Found background image: ${url}`);

                            // Create a virtual image element
                            const virtualImg = document.createElement("img");
                            virtualImg.src = url;
                            virtualImg.dataset.virtualElement = "true";
                            virtualImg.dataset.originalElement = "background";
                            virtualImg.dataset.dataIndex =
                                box.getAttribute("data-index") || "";
                            images.push(virtualImg);
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error("Error extracting images from specific website:", error);
    }

    return images;
}

// Function to force load lazy-loaded images
async function forceLazyLoad() {
    console.log("Forcing lazy load of images...");

    // Scroll through the page to trigger lazy loading - faster version
    const initialPosition = window.scrollY;
    const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
    );

    // Use a larger scroll step for faster scrolling
    const scrollStep = Math.floor(window.innerHeight * 0.8); // 80% of viewport height
    const waitTime = 100; // Reduced wait time between scrolls (was 300ms)

    console.log(`Document height: ${documentHeight}px - Using fast scrolling`);

    // First, quickly scroll to the bottom to trigger initial loading
    window.scrollTo(0, documentHeight);
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Then scroll back up in larger steps
    for (
        let position = documentHeight;
        position >= 0;
        position -= scrollStep * 2
    ) {
        window.scrollTo(0, position);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Then quickly scroll down again to catch any missed images
    const positions = [
        0,
        documentHeight / 4,
        documentHeight / 2,
        (documentHeight * 3) / 4,
        documentHeight,
    ];
    for (const position of positions) {
        window.scrollTo(0, position);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Scroll back to original position
    window.scrollTo(0, initialPosition);
    console.log("Fast scrolling complete - returned to original position");

    // Try to trigger lazy loading by clicking on "Next" buttons
    try {
        const nextButtons = document.querySelectorAll(
            '.j-next, .cp-next, a:contains("Next"), button:contains("Next"), [aria-label="Next"]'
        );
        console.log(`Found ${nextButtons.length} potential 'Next' buttons`);

        for (const button of nextButtons) {
            console.log(
                `Clicking on Next button: ${button.outerHTML.substring(
                    0,
                    100
                )}...`
            );
            button.click();
            // Reduced wait time after clicking (was 500ms)
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    } catch (error) {
        console.error("Error clicking Next buttons:", error);
    }

    // Find all lazy-loaded images and try to load them
    const lazyImages = document.querySelectorAll(
        "[data-src], [data-original], [data-lazy], [data-original-src], .lazy, .lazyload, .el-image__inner, .read-box img, .read-box-block img"
    );
    console.log(`Found ${lazyImages.length} potentially lazy-loaded images`);

    // Try to load all lazy images
    for (const img of lazyImages) {
        try {
            // For any element, try to set src from data attributes
            if (img.dataset.src) {
                console.log(`Setting src from data-src: ${img.dataset.src}`);
                img.src = img.dataset.src;
            } else if (img.dataset.original) {
                console.log(
                    `Setting src from data-original: ${img.dataset.original}`
                );
                img.src = img.dataset.original;
            } else if (img.dataset.lazy) {
                console.log(`Setting src from data-lazy: ${img.dataset.lazy}`);
                img.src = img.dataset.lazy;
            } else if (img.dataset.originalSrc) {
                console.log(
                    `Setting src from data-original-src: ${img.dataset.originalSrc}`
                );
                img.src = img.dataset.originalSrc;
            }

            // For the specific website structure, try to force load
            if (img.classList.contains("el-image__inner") && !img.src) {
                // Try to find the src in parent elements
                const parent =
                    img.closest(".el-image") ||
                    img.closest(".read-box-block") ||
                    img.closest(".read-box");
                if (parent) {
                    const dataIndex = parent.getAttribute("data-index");
                    console.log(`Found parent with data-index: ${dataIndex}`);

                    // Try to trigger loading by simulating user interaction
                    parent.click();
                    parent.dispatchEvent(new Event("mouseover"));
                    img.dispatchEvent(new Event("load"));
                }
            }
        } catch (error) {
            console.error(`Error loading lazy image:`, error);
        }
    }

    // Try to execute any lazy loading scripts on the page
    try {
        console.log("Trying to execute lazy loading scripts...");
        // Look for common lazy loading function names
        const lazyFunctions = [
            "lazyload",
            "loadImages",
            "loadLazyImages",
            "initLazyLoad",
            "loadImagesLazy",
            "triggerLazyLoad",
            "loadAllImages",
        ];

        for (const funcName of lazyFunctions) {
            if (typeof window[funcName] === "function") {
                console.log(`Executing lazy loading function: ${funcName}`);
                try {
                    window[funcName]();
                } catch (e) {
                    console.error(`Error executing ${funcName}:`, e);
                }
            }
        }

        // Execute any custom lazy loading script for the specific website
        const customScript = `
            // Try to trigger image loading for the specific website
            document.querySelectorAll('.read-box').forEach(box => {
                box.click();
                box.dispatchEvent(new Event('mouseover'));
                box.dispatchEvent(new Event('mouseenter'));
            });
        `;

        console.log("Executing custom lazy loading script");
        new Function(customScript)();
    } catch (error) {
        console.error("Error executing lazy loading scripts:", error);
    }

    // Wait a bit more for images to load (reduced from 1000ms)
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Lazy load forcing complete - using faster timing");
}

// Function to detect and process comic images
async function processComicImages() {
    // Reset state
    textQueue = [];
    imageQueue = [];
    currentImageIndex = -1;
    currentBatchIndex = 0;
    batchResults = {};
    isProcessingNextImage = false;

    // Try to force lazy-loaded images to load
    await forceLazyLoad();

    // Find all images on the page using multiple approaches
    let images = [];

    // APPROACH 1: Direct targeting of the specific structure you provided
    try {
        console.log(
            "Trying to find images using the exact structure provided..."
        );
        // Look for the specific structure in your example
        const readBoxes = document.querySelectorAll(".read-box");
        console.log(`Found ${readBoxes.length} read-box elements`);

        if (readBoxes.length > 0) {
            // This is likely the site structure you provided
            readBoxes.forEach((box) => {
                const imgElement = box.querySelector(".el-image__inner");
                if (imgElement) {
                    console.log(
                        `Found image in read-box: ${
                            imgElement.src || imgElement.dataset.src
                        }`
                    );
                    images.push(imgElement);
                }
            });
        }

        // Also try with data-v attribute
        const dataVElements = document.querySelectorAll("[data-v-6cb544df]");
        console.log(
            `Found ${dataVElements.length} elements with data-v-6cb544df attribute`
        );

        if (dataVElements.length > 0) {
            // Look for images within these elements
            dataVElements.forEach((el) => {
                const imgElements = el.querySelectorAll(
                    "img, .el-image__inner"
                );
                imgElements.forEach((img) => {
                    console.log(
                        `Found image in data-v element: ${
                            img.src || img.dataset.src
                        }`
                    );
                    images.push(img);
                });
            });
        }
    } catch (error) {
        console.error("Error finding images with specific structure:", error);
    }

    // APPROACH 2: If the above didn't find anything, try more general selectors
    if (images.length === 0) {
        console.log(
            "No images found with specific structure, trying general selectors..."
        );

        // Standard image selector
        const standardImages = Array.from(document.querySelectorAll("img"));
        images = images.concat(standardImages);

        // Common comic reader structures
        const comicReaderImages = Array.from(
            document.querySelectorAll(
                ".read-box img, .comic-container img, .manga-reader img, .chapter-container img, .page-container img, .comic-page img, .manga-page img, .read-box-block img, .el-image__inner, .read-container img, .pager-read img"
            )
        );
        images = images.concat(comicReaderImages);
    }

    // APPROACH 3: Look for any element with an image-like src attribute
    console.log("Looking for elements with image-like src attributes...");
    document.querySelectorAll("*").forEach((el) => {
        // Check for various image source attributes
        const src =
            el.src ||
            el.dataset.src ||
            el.dataset.original ||
            el.dataset.lazy ||
            el.getAttribute("src");
        if (
            src &&
            typeof src === "string" &&
            (src.match(/\.(jpg|jpeg|png|gif|webp)/i) ||
                src.includes("imgg.mangaina.com"))
        ) {
            console.log(`Found element with image src: ${src}`);
            // Create a virtual image element if this isn't already an img
            if (el.tagName !== "IMG") {
                const virtualImg = document.createElement("img");
                virtualImg.src = src;
                virtualImg.dataset.virtualElement = "true";
                virtualImg.dataset.originalElement = el.tagName;
                images.push(virtualImg);
            } else {
                images.push(el);
            }
        }
    });

    // Remove duplicates by src
    const uniqueSrcs = new Set();
    images = images.filter((img) => {
        const src = img.src || img.dataset.src || "";
        if (!src || uniqueSrcs.has(src)) return false;
        uniqueSrcs.add(src);
        return true;
    });

    // Log the number of images found
    console.log(`Found ${images.length} unique images on the page`);
    images.forEach((img, index) => {
        const src = img.src || img.dataset.src || "unknown";
        console.log(
            `Image ${index + 1}: ${src.substring(0, 100)}${
                src.length > 100 ? "..." : ""
            }`
        );
    });

    // For the specific website structure you provided, use direct extraction
    // This is a special case for the website that's not working
    if (
        document.querySelectorAll(".read-box").length > 0 ||
        document.querySelectorAll("[data-v-6cb544df]").length > 0
    ) {
        console.log(
            "Detected specific website structure - using direct extraction"
        );

        // First try direct extraction
        let directImages = extractImagesFromSpecificWebsite();

        // If direct extraction didn't find anything, fall back to the general approach
        if (directImages.length === 0) {
            console.log(
                "Direct extraction found no images, falling back to general approach"
            );

            // Process all images without filtering
            directImages = images
                .map((img) => {
                    // Get the actual image source (handle lazy-loaded images)
                    const imgSrc =
                        img.src ||
                        img.dataset.src ||
                        img.dataset.original ||
                        img.dataset.lazy ||
                        img.dataset.originalSrc ||
                        "";

                    // Store the actual source for later reference
                    if (imgSrc) {
                        img.dataset.actualSrc = imgSrc;
                        console.log(`Using image: ${imgSrc}`);
                    }

                    return img;
                })
                .filter((img) => {
                    // Only filter out images we've already processed or that have no source
                    const imgSrc =
                        img.dataset.actualSrc ||
                        img.src ||
                        img.dataset.src ||
                        "";
                    return imgSrc && !processedImages.has(imgSrc);
                });
        }

        // Sort images by their data-index attribute if available (common in comic readers)
        const comicImages = directImages.sort((a, b) => {
            const aIndex =
                a.getAttribute("data-index") ||
                a.dataset.dataIndex ||
                a.closest("[data-index]")?.getAttribute("data-index") ||
                0;
            const bIndex =
                b.getAttribute("data-index") ||
                b.dataset.dataIndex ||
                b.closest("[data-index]")?.getAttribute("data-index") ||
                0;
            return parseInt(aIndex) - parseInt(bIndex);
        });

        if (comicImages.length === 0) {
            console.log("No comic images found on this page");
            speak(
                "No comic images found on this page. Try scrolling down to load more images."
            );
            isReading = false;
            return;
        }

        console.log(
            `Found ${comicImages.length} comic images on the specific website`
        );

        // Log all the images we found
        comicImages.forEach((img, index) => {
            const src =
                img.src ||
                img.dataset.src ||
                img.dataset.actualSrc ||
                "unknown";
            console.log(`Comic image ${index + 1}: ${src}`);
        });

        return comicImages;
    }

    // For other websites, use the normal filtering logic
    const comicImages = images.filter((img) => {
        // Get the actual image source (handle lazy-loaded images)
        const imgSrc =
            img.src ||
            img.dataset.src ||
            img.dataset.original ||
            img.dataset.lazy ||
            img.dataset.originalSrc ||
            "";

        // Skip if we've already processed this image
        if (processedImages.has(imgSrc) || !imgSrc) {
            return false;
        }

        // For images that aren't fully loaded yet, we'll check their style dimensions or attributes
        const width =
            img.naturalWidth ||
            parseInt(img.getAttribute("width")) ||
            parseInt(img.style.width) ||
            0;
        const height =
            img.naturalHeight ||
            parseInt(img.getAttribute("height")) ||
            parseInt(img.style.height) ||
            0;

        // Check if image is in a comic reader container
        const inComicContainer =
            img.closest(".read-box") ||
            img.closest(".comic-container") ||
            img.closest(".manga-reader") ||
            img.closest(".chapter-container") ||
            img.closest(".page-container") ||
            img.closest(".comic-page") ||
            img.closest(".manga-page") ||
            img.closest(".pager-read") ||
            img.closest(".el-image");

        // Images in comic containers are more likely to be comic panels
        const sizeThreshold = inComicContainer ? 50 : 150;

        // Be more lenient with validation
        const isValid =
            // Either the image has a source or it's in a comic container
            (imgSrc || inComicContainer) &&
            // Either the image is large enough or it's in a comic container
            ((width > sizeThreshold && height > sizeThreshold) ||
                inComicContainer ||
                img.classList.contains("el-image__inner"));

        if (isValid) {
            // Store the actual source for later reference
            img.dataset.actualSrc = imgSrc;
            console.log(
                `Found valid comic image: ${imgSrc} (${width}x${height})`
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

    // Process images in batches
    await processBatch();

    // Start processing the first image
    await processNextImage();
}

// Process a batch of images
async function processBatch() {
    if (!isReading || currentBatchIndex >= imageQueue.length) {
        return;
    }

    const batchEnd = Math.min(currentBatchIndex + batchSize, imageQueue.length);
    const currentBatch = imageQueue.slice(currentBatchIndex, batchEnd);

    console.log(
        `Processing batch of ${currentBatch.length} images (${
            currentBatchIndex + 1
        }-${batchEnd} of ${imageQueue.length})`
    );

    try {
        // Convert all images in the batch to blobs
        const batchBlobs = await Promise.all(
            currentBatch.map(async (img) => {
                return {
                    blob: await imageToBlob(img),
                    index: imageQueue.indexOf(img),
                };
            })
        );

        // Send the batch to the OCR service
        const batchText = await extractTextFromBatch(
            batchBlobs.map((item) => item.blob)
        );

        // Parse the batch results
        const textParts = parseBatchText(batchText);

        // Store the results for each image
        for (
            let i = 0;
            i < Math.min(textParts.length, currentBatch.length);
            i++
        ) {
            const imgIndex = batchBlobs[i].index;
            batchResults[imgIndex] = textParts[i];
        }

        // Update the batch index
        currentBatchIndex = batchEnd;

        // Process the next batch if there are more images
        if (currentBatchIndex < imageQueue.length) {
            await processBatch();
        }
    } catch (error) {
        console.error("Error processing batch:", error);
        // Continue with the next batch
        currentBatchIndex = Math.min(
            currentBatchIndex + batchSize,
            imageQueue.length
        );
        if (currentBatchIndex < imageQueue.length) {
            await processBatch();
        }
    }
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
    // Get the actual image source (handle lazy-loaded images)
    const imgSrc =
        img.dataset.actualSrc ||
        img.src ||
        img.dataset.src ||
        img.dataset.original ||
        img.dataset.lazy ||
        img.dataset.originalSrc ||
        "";

    console.log(
        `Processing image ${currentImageIndex + 1}/${
            imageQueue.length
        }: ${imgSrc}`
    );

    try {
        // Mark image as processed
        processedImages.add(imgSrc);

        // Highlight the current image
        highlightImage(img);

        // Scroll to the image
        img.scrollIntoView({ behavior: "smooth", block: "center" });

        // Get text from batch results or extract it if not available
        let text;
        if (batchResults[currentImageIndex]) {
            text = batchResults[currentImageIndex];
            console.log(
                `Using pre-processed text from batch for image ${
                    currentImageIndex + 1
                }`
            );
        } else {
            text = await extractTextFromImage(img);
        }

        if (text && text.trim()) {
            console.log(
                `Text for image ${currentImageIndex + 1}: ${text.substring(
                    0,
                    50
                )}...`
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
}

// Extract text from a batch of images
async function extractTextFromBatch(blobs) {
    try {
        console.log(`Sending batch of ${blobs.length} images to OCR service`);

        // Create form data with multiple images
        const formData = new FormData();
        blobs.forEach((blob, index) => {
            formData.append("images", blob, `comic_image_${index}.jpg`);
        });

        // Send to backend
        console.log(
            `Sending batch to OCR service at ${currentSettings.backendUrl}/ocr-batch`
        );
        const response = await fetch(
            `${currentSettings.backendUrl}/ocr-batch`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            let errorMessage = `Server returned ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
                if (errorData.details) {
                    errorMessage += `: ${errorData.details}`;
                }
            } catch (e) {
                console.error("Failed to parse error response as JSON:", e);
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(
            `Batch OCR result received: ${
                data.text ? data.text.substring(0, 100) + "..." : "No text"
            }`
        );

        return data.text;
    } catch (error) {
        console.error("Batch OCR Error:", error);
        throw error;
    }
}

// Parse the batch text result into individual image texts
function parseBatchText(batchText) {
    if (!batchText) return [];

    // Split by IMAGE X: pattern
    const regex = /IMAGE \d+:\s*(.*?)(?=IMAGE \d+:|$)/gs;
    const matches = [];
    let match;

    while ((match = regex.exec(batchText)) !== null) {
        if (match[1]) {
            matches.push(match[1].trim());
        }
    }

    // If no matches found, try to use the whole text
    if (matches.length === 0 && batchText.trim()) {
        matches.push(batchText.trim());
    }

    console.log(`Parsed ${matches.length} text segments from batch result`);
    return matches;
}

// Pre-process the next image while speaking the current one
async function preProcessNextImage() {
    // We don't need this anymore since we're using batch processing
    return;
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

    // Get the actual image source (handle lazy-loaded images)
    const imgSrc =
        img.dataset.actualSrc ||
        img.src ||
        img.dataset.src ||
        img.dataset.original ||
        "";
    console.log(`Highlighted image: ${imgSrc}`);
}

// Remove highlight from the current image
function removeHighlight() {
    if (currentHighlightedImage) {
        const img = currentHighlightedImage.element;
        img.style.outline = currentHighlightedImage.originalOutline;
        img.style.outlineOffset = currentHighlightedImage.originalOutlineOffset;
        img.style.boxShadow = currentHighlightedImage.originalBoxShadow;
        img.style.border = currentHighlightedImage.originalBorder;

        // Get the actual image source (handle lazy-loaded images)
        const imgSrc =
            img.dataset.actualSrc ||
            img.src ||
            img.dataset.src ||
            img.dataset.original ||
            "";
        console.log(`Removed highlight from image: ${imgSrc}`);
        currentHighlightedImage = null;
    }
}

// Function to extract text from an image using the backend OCR service
async function extractTextFromImage(img) {
    try {
        // Get the actual image source (handle lazy-loaded images)
        const imgSrc =
            img.dataset.actualSrc ||
            img.src ||
            img.dataset.src ||
            img.dataset.original ||
            "";
        console.log(`Extracting text from image: ${imgSrc}`);

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
            // Get the actual image source (handle lazy-loaded images)
            const imgSrc =
                img.dataset.actualSrc ||
                img.src ||
                img.dataset.src ||
                img.dataset.original ||
                img.dataset.lazy ||
                img.dataset.originalSrc ||
                "";

            console.log(`Converting image to blob: ${imgSrc}`);

            // If the image is not fully loaded or doesn't have dimensions yet
            if (
                !img.complete ||
                img.naturalWidth === 0 ||
                img.naturalHeight === 0
            ) {
                console.log(
                    "Image not fully loaded, attempting to load it first"
                );

                // Try to load the image first
                const tempImg = new Image();
                tempImg.crossOrigin = "anonymous"; // Try to avoid CORS issues

                tempImg.onload = () => {
                    console.log(
                        `Image loaded: ${imgSrc} (${tempImg.naturalWidth}x${tempImg.naturalHeight})`
                    );
                    convertImageToBlob(tempImg, imgSrc, resolve, reject);
                };

                tempImg.onerror = (error) => {
                    console.error(`Failed to load image: ${imgSrc}`, error);
                    // Try direct fetch as fallback
                    fetchImageAsBlob(imgSrc).then(resolve).catch(reject);
                };

                // Set the source to trigger loading
                tempImg.src = imgSrc;
            } else {
                // Image is already loaded, convert it directly
                convertImageToBlob(img, imgSrc, resolve, reject);
            }
        } catch (error) {
            console.error("Error in imageToBlob:", error);
            // Try direct fetch as last resort
            try {
                const imgSrc =
                    img.dataset.actualSrc || img.src || img.dataset.src || "";
                if (imgSrc) {
                    fetchImageAsBlob(imgSrc).then(resolve).catch(reject);
                } else {
                    reject(new Error("No valid image source found"));
                }
            } catch (fetchError) {
                reject(fetchError);
            }
        }
    });
}

// Helper function to convert an image to blob using canvas
function convertImageToBlob(img, imgSrc, resolve, reject) {
    try {
        // Handle cross-origin images
        if (isCrossOrigin(imgSrc)) {
            console.log("Cross-origin image detected, using fetch to get blob");
            return fetchImageAsBlob(imgSrc).then(resolve).catch(reject);
        }

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 800; // Default width if not available
        canvas.height = img.naturalHeight || 1200; // Default height if not available

        // Draw image to canvas
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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
                    // Try direct fetch as fallback
                    fetchImageAsBlob(imgSrc)
                        .then(resolve)
                        .catch(() => {
                            reject(
                                new Error("Failed to convert image to blob")
                            );
                        });
                }
            },
            "image/jpeg",
            0.95
        );
    } catch (error) {
        console.error("Error converting image to blob:", error);
        // Try direct fetch as fallback
        fetchImageAsBlob(imgSrc).then(resolve).catch(reject);
    }
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
    utterance.rate = parseFloat(currentSettings.rate);
    utterance.pitch = parseFloat(currentSettings.pitch);
    utterance.volume = parseFloat(currentSettings.volume);

    // Log speech settings for debugging
    console.log("Speech settings:", {
        voice: utterance.voice ? utterance.voice.name : "default",
        rate: utterance.rate,
        pitch: utterance.pitch,
        volume: utterance.volume,
    });

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
