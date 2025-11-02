import {getSupabaseClient} from './supabase.js';
import {randomUUID} from 'crypto';

/**
 * Save company and questions to Supabase
 * @param {Object} companyData - Company information
 * @param {string} companyData.name - Company name
 * @param {string} companyData.email - Company email
 * @param {string} companyData.pitch - Business pitch
 * @param {string[]} questions - Array of question strings
 * @returns {Promise<{companyId: string, success: boolean}>}
 */
export async function saveCompanyAndQuestions(companyData, questions) {
  const supabase = getSupabaseClient();

  // Validate inputs
  if (!companyData.name || !companyData.email || !companyData.pitch) {
    throw new Error(
      'Missing required company data: name, email, and pitch are required'
    );
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new Error('At least one question is required');
  }

  // Generate UUID for company
  const companyId = randomUUID();

  try {
    // Insert company
    const {error: companyError} = await supabase.from('companies').insert({
      id: companyId,
      name: companyData.name,
      email: companyData.email,
      business_pitch: companyData.pitch,
    });

    if (companyError) {
      throw new Error(`Failed to insert company: ${companyError.message}`);
    }

    // Prepare questions for insert (with sequential ids starting at 1)
    const questionsToInsert = questions.map((question, index) => ({
      company_id: companyId,
      id: index + 1, // Starts at 1
      question: question,
    }));

    // Insert questions
    const {error: questionsError} = await supabase
      .from('questions')
      .insert(questionsToInsert);

    if (questionsError) {
      // If questions insert fails, try to delete the company (cleanup)
      await supabase.from('companies').delete().eq('id', companyId);
      throw new Error(`Failed to insert questions: ${questionsError.message}`);
    }

    return {
      companyId: companyId,
      success: true,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Database error: ${error.message || 'Unknown error'}`);
  }
}
