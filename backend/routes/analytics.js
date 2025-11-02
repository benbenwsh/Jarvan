import express from 'express';
import {
  getAllCompanyData,
  analyzeConversations,
} from '../services/analyticsService.js';

const router = express.Router();

/**
 * POST /api/analytics/analyze
 * Analyze all customer conversations and generate insights
 * Response: { customerCount: number, insights: { generalInsights: string[], positives: string[], negatives: string[], pivotSuggestions: string[] } }
 */
router.post('/analyze', async (req, res, next) => {
  try {
    // Get all company data
    const companyData = await getAllCompanyData();

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
