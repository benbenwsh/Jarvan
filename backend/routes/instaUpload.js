import express from 'express';
import FormData from 'form-data';
import fetch from 'node-fetch';

const router = express.Router();

const N8N_WEBHOOK_URL = process.env.INSTA_POST_URL;

/**
 * POST /api/instagramUpload
 * Upload image and caption to Instagram via n8n webhook
 * Request body (JSON): { imageUrl: string, caption: string }
 * Response: { success: boolean, message: string }
 */
router.post('/', async (req, res, next) => {
  try {
    const { imageUrl, caption } = req.body;

    // Validate request
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      return res.status(400).json({
        error: 'Image URL is required',
      });
    }

    if (!caption || typeof caption !== 'string' || caption.trim().length === 0) {
      return res.status(400).json({
        error: 'Caption is required and must be a non-empty string',
      });
    }

    console.log('Instagram upload requested:');
    console.log('- Image URL:', imageUrl);
    console.log('- Caption:', caption);

    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from URL');
    }
    const imageBuffer = await imageResponse.buffer();

    // Create FormData for n8n webhook
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'instagram-post.jpg',
      contentType: imageResponse.headers.get('content-type') || 'image/jpeg',
    });
    formData.append('caption', caption);

    // Send to n8n webhook
    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('n8n webhook error:', errorText);
      throw new Error(`Webhook request failed: ${webhookResponse.statusText}`);
    }

    const webhookData = await webhookResponse.json();
    console.log('n8n webhook response:', webhookData);

    res.json({
      success: true,
      message: 'Post uploaded to Instagram successfully',
      data: webhookData,
    });
  } catch (error) {
    console.error('Error uploading to Instagram:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload to Instagram',
    });
  }
});

export default router;