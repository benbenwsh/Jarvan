import OpenAI from 'openai';
import {generateQuestionPrompt} from '../utils/questionPrompt.js';

/**
 * Get OpenAI client instance
 * Creates the client lazily to ensure environment variables are loaded
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
 * Generates interview questions based on a business pitch
 * @param {string} pitch - The business pitch text
 * @returns {Promise<string[]>} Array of 7 questions
 */
export async function generateQuestions(pitch) {
  if (!pitch || typeof pitch !== 'string' || pitch.trim().length === 0) {
    throw new Error(
      'Business pitch is required and must be a non-empty string'
    );
  }

  // Get OpenAI client (will throw error if API key not set)
  const openai = getOpenAIClient();

  try {
    const messages = generateQuestionPrompt(pitch);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      response_format: {type: 'json_object'},
    });

    // Parse the response
    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (parseError) {
      // If it's not JSON, try to extract JSON array from the text
      const jsonMatch = responseContent.match(/\[.*\]/s);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse OpenAI response as JSON');
      }
    }

    // Extract questions array
    let questions;
    if (Array.isArray(parsedResponse)) {
      // Direct array response (fallback)
      questions = parsedResponse;
    } else if (
      parsedResponse.questions &&
      Array.isArray(parsedResponse.questions)
    ) {
      questions = parsedResponse.questions;
    } else {
      // Fallback: look for any array in the response
      const keys = Object.keys(parsedResponse);
      const arrayKey = keys.find((key) => Array.isArray(parsedResponse[key]));
      if (arrayKey) {
        questions = parsedResponse[arrayKey];
      } else {
        throw new Error('Could not find questions array in OpenAI response');
      }
    }

    // Validate we have exactly 7 questions
    if (!Array.isArray(questions) || questions.length !== 7) {
      throw new Error(
        `Expected exactly 7 questions, but got ${
          Array.isArray(questions) ? questions.length : 'non-array'
        }`
      );
    }

    // Clean and validate each question
    const cleanedQuestions = questions
      .map((q, index) => {
        if (typeof q !== 'string') {
          throw new Error(`Question ${index + 1} is not a string: ${typeof q}`);
        }
        return q.trim();
      })
      .filter((q) => q.length > 0);

    if (cleanedQuestions.length !== 7) {
      throw new Error(
        `Expected exactly 7 valid questions, but got ${cleanedQuestions.length} after cleaning`
      );
    }

    return cleanedQuestions;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
  }
}
