/**
 * OCR Routes
 * 
 * Handles OCR requests using Google Gemini 2.0 Flash API
 */

const express = require('express');
const router = express.Router();
const geminiOCR = require('../services/geminiOCR');

/**
 * POST /api/ocr
 * 
 * Performs OCR on an image using Google Gemini 2.0 Flash API
 * 
 * Request body:
 * - image: Base64 encoded image data
 * - bubbleId: (optional) ID of the bubble being processed
 * 
 * Response:
 * - success: Boolean indicating success
 * - text: Extracted text
 * - bubbleId: (if provided in request) ID of the bubble
 */
router.post('/ocr', async (req, res, next) => {
  try {
    const { image, bubbleId } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }
    
    // Remove data:image/png;base64, prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
    
    // Perform OCR
    const text = await geminiOCR.extractTextFromImage(base64Image);
    
    // Return result
    res.json({
      success: true,
      text,
      bubbleId
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
