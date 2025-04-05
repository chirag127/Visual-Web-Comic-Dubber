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

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

app.post("/ocr", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        const mimeType = mime.lookup(req.file.originalname) || "image/jpeg";

        // Convert image file to base64
        const imagePart = await fileToGenerativePart(req.file.path, mimeType);

        // Generate content with the image
        const result = await model.generateContent([
            imagePart,
            "Extract and return the readable comic dialogue text only. Format it as a single paragraph with proper punctuation.",
        ]);

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

// Health check endpoint
app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

module.exports = app;
