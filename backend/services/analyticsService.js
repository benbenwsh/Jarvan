import {getSupabaseClient} from './supabase.js';
import OpenAI from 'openai';

const COMPANY_ID = 'e9d1ef02-8582-4173-9d2d-29a7f0661353';

/**
 * Get OpenAI client instance
 */
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
    throw new Error(
      'OPENAI_API_KEY is not set in environment variables. Please add your API key to backend/.env file'
    );
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Get all company data including pitch, customers, and messages
 * @returns {Promise<{pitch: string, customers: Array, messagesByCustomer: Object}>}
 */
export async function getAllCompanyData() {
  const supabase = getSupabaseClient();

  try {
    // Get company pitch
    const {data: company, error: companyError} = await supabase
      .from('companies')
      .select('business_pitch')
      .eq('id', COMPANY_ID)
      .single();

    if (companyError) {
      throw new Error(`Failed to get company: ${companyError.message}`);
    }

    if (!company) {
      throw new Error('Company not found');
    }

    // Get all customers
    const {data: customers, error: customersError} = await supabase
      .from('customers')
      .select('id, name, email')
      .eq('company_id', COMPANY_ID);

    if (customersError) {
      throw new Error(`Failed to get customers: ${customersError.message}`);
    }

    // Get all messages for all customers
    const customerIds = customers?.map((c) => c.id) || [];
    let allMessages = [];

    if (customerIds.length > 0) {
      const {data: messages, error: messagesError} = await supabase
        .from('messages')
        .select('customer_id, order, message')
        .in('customer_id', customerIds)
        .order('customer_id', {ascending: true})
        .order('order', {ascending: true});

      if (messagesError) {
        throw new Error(`Failed to get messages: ${messagesError.message}`);
      }

      allMessages = messages || [];
    }

    // Group messages by customer
    const messagesByCustomer = {};
    allMessages.forEach((msg) => {
      if (!messagesByCustomer[msg.customer_id]) {
        messagesByCustomer[msg.customer_id] = [];
      }
      messagesByCustomer[msg.customer_id].push({
        order: msg.order,
        message: msg.message,
      });
    });

    // Format conversations for analysis
    const conversations =
      customers?.map((customer) => {
        const customerMessages = messagesByCustomer[customer.id] || [];
        return {
          customerName: customer.name,
          customerEmail: customer.email,
          messages: customerMessages.map((m) => m.message).join('\n'),
        };
      }) || [];

    return {
      pitch: company.business_pitch,
      customers: customers || [],
      conversations: conversations,
      messagesByCustomer,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Database error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Analyze all conversations and generate insights
 * @param {string} businessPitch - The business pitch
 * @param {Array} customers - Array of customers
 * @param {Array} conversations - Array of conversation objects with customer info and messages
 * @returns {Promise<{customerCount: number, insights: Object}>}
 */
export async function analyzeConversations(
  businessPitch,
  customers,
  conversations
) {
  const openai = getOpenAIClient();

  const customerCount = customers.length;

  // If no conversations, return empty insights
  if (conversations.length === 0) {
    return {
      customerCount: 0,
      insights: {
        generalInsights: ['No customer interviews have been conducted yet.'],
        positives: [],
        negatives: [],
        pivotSuggestions: [],
      },
    };
  }

  // Format conversations text for analysis
  const conversationsText = conversations
    .map(
      (conv, idx) =>
        `Conversation ${idx + 1} (Customer: ${conv.customerName}):\n${
          conv.messages
        }\n`
    )
    .join('\n---\n\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert business analyst specializing in analyzing user interview data to provide actionable insights for startups.

Your task is to analyze customer interview conversations and provide structured insights in JSON format.

Business Pitch Context:
${businessPitch}

Analyze the following customer conversations holistically and provide insights about:
1. General insights about what people think about this business idea
2. Positive feedback - good things people said about the idea/product
3. Negative feedback - concerns, criticisms, or bad things people said
4. Pivot suggestions - actionable recommendations for how the business could pivot based on the feedback

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just JSON):
{
  "generalInsights": ["insight 1", "insight 2", ...],
  "positives": ["positive point 1", "positive point 2", ...],
  "negatives": ["negative point 1", "negative point 2", ...],
  "pivotSuggestions": ["suggestion 1", "suggestion 2", ...]
}

Make sure each array contains 3-8 bullet points. Be specific and actionable.`,
        },
        {
          role: 'user',
          content: `Analyze these customer interview conversations and provide insights:

${conversationsText}

Return the analysis as JSON with the specified structure.`,
        },
      ],
      temperature: 0.7,
      response_format: {type: 'json_object'},
    });

    const analysisText = response.choices[0]?.message?.content?.trim();
    if (!analysisText) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      throw new Error('Could not parse OpenAI response as JSON');
    }

    // Validate structure
    const insights = {
      generalInsights: Array.isArray(analysis.generalInsights)
        ? analysis.generalInsights
        : [],
      positives: Array.isArray(analysis.positives) ? analysis.positives : [],
      negatives: Array.isArray(analysis.negatives) ? analysis.negatives : [],
      pivotSuggestions: Array.isArray(analysis.pivotSuggestions)
        ? analysis.pivotSuggestions
        : [],
    };

    return {
      customerCount,
      insights,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
  }
}
