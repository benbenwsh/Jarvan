import {getSupabaseClient} from './supabase.js';
import {randomUUID} from 'crypto';

const COMPANY_ID = 'e9d1ef02-8582-4173-9d2d-29a7f0661353';

/**
 * Create a new customer
 * @param {string} name - Customer name
 * @param {string} email - Customer email
 * @returns {Promise<{customerId: string}>}
 */
export async function createCustomer(name, email) {
  const supabase = getSupabaseClient();

  if (!name || !email) {
    throw new Error('Name and email are required');
  }

  const customerId = randomUUID();

  try {
    const {error} = await supabase.from('customers').insert({
      id: customerId,
      name: name.trim(),
      email: email.trim(),
      company_id: COMPANY_ID,
    });

    if (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return {customerId};
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Database error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get company data (pitch and questions)
 * @returns {Promise<{pitch: string, questions: Array<{id: number, question: string}>}>}
 */
export async function getCompanyData() {
  const supabase = getSupabaseClient();

  try {
    // Get company
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

    // Get questions ordered by id
    const {data: questions, error: questionsError} = await supabase
      .from('questions')
      .select('id, question')
      .eq('company_id', COMPANY_ID)
      .order('id', {ascending: true});

    if (questionsError) {
      throw new Error(`Failed to get questions: ${questionsError.message}`);
    }

    return {
      pitch: company.business_pitch,
      questions: questions || [],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Database error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Save a message to the database
 * @param {string} customerId - Customer ID
 * @param {number} order - Message order number
 * @param {string} message - Message text
 * @returns {Promise<void>}
 */
export async function saveMessage(customerId, order, message) {
  const supabase = getSupabaseClient();

  if (!customerId || !order || !message) {
    throw new Error('Customer ID, order, and message are required');
  }

  try {
    const {error} = await supabase.from('messages').insert({
      customer_id: customerId,
      order: order,
      message: message.trim(),
    });

    if (error) {
      throw new Error(`Failed to save message: ${error.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Database error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get all messages for a customer, ordered by order
 * @param {string} customerId - Customer ID
 * @returns {Promise<Array<{order: number, message: string}>>}
 */
export async function getCustomerMessages(customerId) {
  const supabase = getSupabaseClient();

  if (!customerId) {
    throw new Error('Customer ID is required');
  }

  try {
    const {data, error} = await supabase
      .from('messages')
      .select('order, message')
      .eq('customer_id', customerId)
      .order('order', {ascending: true});

    if (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Database error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get the next message order number for a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise<number>} Next order number (1 if no messages exist)
 */
export async function getNextMessageOrder(customerId) {
  const supabase = getSupabaseClient();

  if (!customerId) {
    throw new Error('Customer ID is required');
  }

  try {
    const {data, error} = await supabase
      .from('messages')
      .select('order')
      .eq('customer_id', customerId)
      .order('order', {ascending: false})
      .limit(1);

    if (error) {
      throw new Error(`Failed to get message order: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return 1;
    }

    return data[0].order + 1;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Database error: ${error.message || 'Unknown error'}`);
  }
}
