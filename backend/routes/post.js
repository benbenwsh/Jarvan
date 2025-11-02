import express from 'express';
import {generatePost} from '../services/postGeneration.js';

const router = express.Router();

/**
 * POST /api/pitch/generate-post
 * Generate Instagram post images and description based on business pitch
 * Request body: { pitch: string, imageCount?: number }
 * Response: { imageUrls: string[], description: string }
 */
router.post('/generate-post', async (req, res, next) => {
  try {
    const {pitch, imageCount} = req.body;

    // Validate request
    if (!pitch || typeof pitch !== 'string' || pitch.trim().length === 0) {
      return res.status(400).json({
        error: 'Business pitch is required and must be a non-empty string',
      });
    }

    // Generate post (images and description)
    const postData = await generatePost(pitch, imageCount || 3);

    // Return response
    res.json({
      imageUrls: postData.imageUrls,
      description: postData.description,
    });
  } catch (error) {
    console.error('Error generating post:', error);
    next(error);
  }
});

export default router;
