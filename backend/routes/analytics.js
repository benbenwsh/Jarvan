import express from 'express';
import {
  getAllCompanyData,
  analyzeConversations,
} from '../services/analyticsService.js';

const router = express.Router();

/**
 * POST /api/analytics/analyze
 * Analyze all customer conversations and generate insights
 * Request body: { companyId: string }
 * Response: { customerCount: number, insights: { generalInsights: string[], positives: string[], negatives: string[], pivotSuggestions: string[] } }
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const {companyId} = req.body;

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    // Get all company data
    const companyData = await getAllCompanyData(companyId);

    // Analyze conversations
    const analysis = await analyzeConversations(
      companyData.pitch,
      companyData.customers,
      companyData.conversations
    );

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing conversations:', error);
    next(error);
  }
});

export default router;
