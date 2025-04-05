const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
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
const fileManager = new GoogleAIFileManager(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function uploadToGemini(filePath, mimeType) {
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: path.basename(filePath),
  });
  return uploadResult.file;
}

// Clean up uploaded files periodically
function cleanupUploads() {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
      return;
    }
    
    const now = Date.now();
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats for file ${filePath}:`, err);
          return;
        }
        
        // Delete files older than 1 hour
        if (now - stats.mtime.getTime() > 3600000) {
          fs.unlink(filePath, err => {
            if (err) {
              console.error(`Error deleting file ${filePath}:`, err);
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
    const geminiFile = await uploadToGemini(req.file.path, mimeType);

    const session = model.startChat({
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: geminiFile.mimeType,
                fileUri: geminiFile.uri,
              },
            },
            {
              text: "Extract and return the readable comic dialogue text only. Format it as a single paragraph with proper punctuation.",
            },
          ],
        },
      ],
    });

    const result = await session.sendMessage("Extract text from this comic image.");
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
      details: error.message 
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
