import express from 'express';
import { generateQuestions } from '../services/openai.js';

const router = express.Router();

/**
 * POST /api/pitch/generate-questions
 * Generate interview questions based on business pitch
 * Request body: { pitch: string }
 * Response: { questions: string[] }
 */
router.post('/generate-questions', async (req, res, next) => {
  try {
    const {pitch} = req.body;

    // Validate request
    if (!pitch || typeof pitch !== 'string' || pitch.trim().length === 0) {
      return res.status(400).json({
        error: 'Business pitch is required and must be a non-empty string',
      });
    }

    // Generate questions
    const questions = await generateQuestions(pitch);

    // Return response
    res.json({
      questions: questions,
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    next(error);
  }
});

export default router;
