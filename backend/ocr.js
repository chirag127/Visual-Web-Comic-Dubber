const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("node:fs");
const mime = require("mime-types");
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
const upload = multer({ dest: "uploads/" });

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-04-17",
});

// Function to convert file to base64
async function fileToGenerativePart(filePath, mimeType) {
    const fileData = await fs.promises.readFile(filePath);
    return {
        inlineData: {
            data: fileData.toString("base64"),
            mimeType,
        },
    };
}

// Clean up uploaded files periodically
function cleanupUploads() {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error("Error reading uploads directory:", err);
            return;
        }

        const now = Date.now();
        files.forEach((file) => {
            const filePath = path.join(uploadsDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(
                        `Error getting stats for file ${filePath}:`,
                        err
                    );
                    return;
                }

                // Delete files older than 1 hour
                if (now - stats.mtime.getTime() > 3600000) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(
                                `Error deleting file ${filePath}:`,
                                err
                            );
                        }
                    });
                }
            });
        });
    });
}

// Run cleanup every hour
setInterval(cleanupUploads, 3600000);

// Handle single image OCR
app.post("/ocr", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        const mimeType = mime.lookup(req.file.originalname) || "image/jpeg";

        // Convert image file to base64
        const imagePart = await fileToGenerativePart(req.file.path, mimeType);

        // Generate content with the image
        const result = await model.generateContent(
            [
                imagePart,
                "You are an OCR system for comic images. Extract ALL text visible in this comic image, including dialogue in speech bubbles, captions, sound effects, and any other text. Return ONLY the extracted text, formatted as a single paragraph with proper punctuation. If no text is found, respond with 'No text detected in this image.'",
            ],
            {
                generationConfig: {
                    temperature: 0.1,
                    topP: 0.95,
                    maxOutputTokens: 4096,
                },
            }
        );

        const extractedText = result.response.text();

        // Clean up the uploaded file
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            }
        });

        res.json({ text: extractedText });
    } catch (error) {
        console.error("OCR Error:", error);
        res.status(500).json({
            error: "Failed to extract text.",
            details: error.message,
        });
    }
});

// Handle multiple images OCR
app.post("/ocr-batch", upload.array("images", 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No image files provided" });
        }

        console.log(`Processing batch of ${req.files.length} images`);

        // Convert all image files to base64
        const imageParts = [];
        for (const file of req.files) {
            const mimeType = mime.lookup(file.originalname) || "image/jpeg";
            const imagePart = await fileToGenerativePart(file.path, mimeType);
            imageParts.push(imagePart);
        }

        // Create chat session with all images
        const chatSession = model.startChat({
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
            history: [
                {
                    role: "user",
                    parts: [...imageParts],
                },
            ],
        });

        // Send message to extract text from all images
        const result = await chatSession.sendMessage(
            "You are an OCR system for comic images. Extract ALL text visible in these comic images, including dialogue in speech bubbles, captions, sound effects, and any other text. For each image, start with 'IMAGE X:' (where X is the image number) and then provide the extracted text. If no text is found in an image, respond with 'No text detected in this image.'"
        );

        const extractedText = result.response.text();

        // Clean up the uploaded files
        for (const file of req.files) {
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error(`Error deleting file ${file.path}:`, err);
                }
            });
        }

        res.json({ text: extractedText });
    } catch (error) {
        console.error("OCR Error:", error);
        res.status(500).json({
            error: "Failed to extract text.",
            details: error.message,
        });
    }
});

// Health check endpoint
app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

module.exports = app;
