import express from 'express';
import {saveCompanyAndQuestions} from '../services/companyService.js';

const router = express.Router();

/**
 * POST /api/company/save
 * Save company and questions to Supabase
 * Request body: { name: string, email: string, pitch: string, questions: string[] }
 * Response: { companyId: string, success: boolean }
 */
router.post('/save', async (req, res, next) => {
  try {
    const {name, email, pitch, questions} = req.body;

    // Validate request
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Name is required and must be a non-empty string',
      });
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        error: 'Email is required and must be a non-empty string',
      });
    }

    if (!pitch || typeof pitch !== 'string' || pitch.trim().length === 0) {
      return res.status(400).json({
        error: 'Business pitch is required and must be a non-empty string',
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        error:
          'Questions array is required and must contain at least one question',
      });
    }

    // Save to database
    const result = await saveCompanyAndQuestions(
      {
        name: name.trim(),
        email: email.trim(),
        pitch: pitch.trim(),
      },
      questions.map((q) => (typeof q === 'string' ? q.trim() : String(q)))
    );

    res.json({
      companyId: result.companyId,
      success: result.success,
    });
  } catch (error) {
    console.error('Error saving company data:', error);
    next(error);
  }
});

export default router;
