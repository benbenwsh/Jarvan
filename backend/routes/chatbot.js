import express from 'express';
import {
  createCustomer,
  getCompanyData,
  getCustomerCompanyId,
  saveMessage,
  getCustomerMessages,
  getNextMessageOrder,
} from '../services/customerService.js';
import {generateChatbotResponse} from '../services/chatbotService.js';

const router = express.Router();

/**
 * POST /api/chatbot/create-customer
 * Create a new customer
 * Request body: { name: string, email: string, companyId: string }
 * Response: { customerId: string }
 */
router.post('/create-customer', async (req, res, next) => {
  try {
    const {name, email, companyId} = req.body;

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

    if (!companyId || typeof companyId !== 'string') {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        error: 'Please enter a valid email address',
      });
    }

    const result = await createCustomer(name.trim(), email.trim(), companyId);

    res.json({
      customerId: result.customerId,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    next(error);
  }
});

/**
 * GET /api/chatbot/company-data
 * Get company pitch and questions
 * Query params: companyId (optional) or customerId (optional)
 * Response: { pitch: string, questions: Array<{id: number, question: string}> }
 */
router.get('/company-data', async (req, res, next) => {
  try {
    const {companyId, customerId} = req.query;

    let targetCompanyId = companyId;

    // If companyId not provided, try to get from customerId
    if (!targetCompanyId && customerId) {
      targetCompanyId = await getCustomerCompanyId(customerId);
    }

    if (!targetCompanyId) {
      return res.status(400).json({
        error: 'Company ID or Customer ID is required',
      });
    }

    const companyData = await getCompanyData(targetCompanyId);
    res.json(companyData);
  } catch (error) {
    console.error('Error getting company data:', error);
    next(error);
  }
});

/**
 * GET /api/chatbot/messages/:customerId
 * Get all messages for a customer
 * Response: { messages: Array<{order: number, message: string}> }
 */
router.get('/messages/:customerId', async (req, res, next) => {
  try {
    const {customerId} = req.params;

    if (!customerId) {
      return res.status(400).json({
        error: 'Customer ID is required',
      });
    }

    const messages = await getCustomerMessages(customerId);
    res.json({messages});
  } catch (error) {
    console.error('Error getting messages:', error);
    next(error);
  }
});

/**
 * POST /api/chatbot/message
 * Send a message and get chatbot response
 * Request body: { customerId: string, message: string }
 * Response: { botResponse: string, userMessageOrder: number, botMessageOrder: number }
 */
router.post('/message', async (req, res, next) => {
  try {
    const {customerId, message} = req.body;

    if (!customerId || typeof customerId !== 'string') {
      return res.status(400).json({
        error: 'Customer ID is required',
      });
    }

    if (
      !message ||
      typeof message !== 'string' ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string',
      });
    }

    // Get customer's company_id
    const companyId = await getCustomerCompanyId(customerId);

    // Get company data
    const companyData = await getCompanyData(companyId);

    // Get existing messages for context
    const existingMessages = await getCustomerMessages(customerId);

    // Save user message
    const userMessageOrder = await getNextMessageOrder(customerId);
    await saveMessage(customerId, userMessageOrder, message);

    // Add user message to context for chatbot
    const messagesWithUser = [
      ...existingMessages,
      {order: userMessageOrder, message: message.trim()},
    ];

    // Generate chatbot response
    const botResponse = await generateChatbotResponse(
      messagesWithUser,
      companyData.pitch,
      companyData.questions
    );

    // Save bot message
    const botMessageOrder = await getNextMessageOrder(customerId);
    await saveMessage(customerId, botMessageOrder, botResponse);

    res.json({
      botResponse,
      userMessageOrder,
      botMessageOrder,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    next(error);
  }
});

/**
 * POST /api/chatbot/initiate
 * Initialize chat - get company data and load existing messages, start conversation if needed
 * Request body: { customerId: string }
 * Response: { pitch: string, questions: Array, messages: Array, initialMessage?: string }
 */
router.post('/initiate', async (req, res, next) => {
  try {
    const {customerId} = req.body;

    if (!customerId || typeof customerId !== 'string') {
      return res.status(400).json({
        error: 'Customer ID is required',
      });
    }

    // Get customer's company_id
    const companyId = await getCustomerCompanyId(customerId);

    // Get company data
    const companyData = await getCompanyData(companyId);

    // Get existing messages
    const messages = await getCustomerMessages(customerId);

    let initialMessage = null;

    // If no messages exist, generate initial greeting/question
    if (messages.length === 0) {
      const botResponse = await generateChatbotResponse(
        [],
        companyData.pitch,
        companyData.questions
      );

      // Save initial message
      const messageOrder = await getNextMessageOrder(customerId);
      await saveMessage(customerId, messageOrder, botResponse);
      initialMessage = botResponse;
      messages.push({order: messageOrder, message: botResponse});
    }

    res.json({
      pitch: companyData.pitch,
      questions: companyData.questions,
      messages,
      initialMessage,
    });
  } catch (error) {
    console.error('Error initiating chat:', error);
    next(error);
  }
});

export default router;
