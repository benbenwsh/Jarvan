/**
 * Generates a structured prompt for OpenAI to create interview questions
 * @param {string} businessPitch - The business pitch text
 * @returns {Array} Array of messages for OpenAI API
 */
export function generateQuestionPrompt(businessPitch) {
  const systemMessage = {
    role: 'system',
    content: `You are an expert at creating user interview questions for startup validation. Your task is to generate exactly 7 questions based on a business pitch.

CRITICAL REQUIREMENTS:
1. Question 1 MUST be about "Initial Interest & Purchase Intent" - ask about likelihood to purchase/use the product on a 1-10 scale. Tailor the question specifically to the business described.
2. Question 2 MUST be about "Price Sensitivity" - ask what price they would expect or be willing to pay. Format as multiple choice options or ask for a specific numeric value. Tailor it to the specific product/service.
3. Questions 3-7 should collect broader insights about:
   - Product features and attributes
   - Target audience preferences
   - Concerns or hesitations
   - What stands out about the product
   - Related preferences and behaviors
   
   These can be open-ended or multiple choice questions.

OUTPUT FORMAT: Return a JSON object with a "questions" key containing an array of exactly 7 question strings. Example format:
{"questions": ["Question 1 text", "Question 2 text", "Question 3 text", "Question 4 text", "Question 5 text", "Question 6 text", "Question 7 text"]}

Make sure each question is:
- Clear and specific
- Tailored to the business described
- Appropriate for a user interview context
- Designed to validate demand and learn about user preferences`,
  };

  const userMessage = {
    role: 'user',
    content: `Generate 7 interview questions for this business pitch:

${businessPitch}

Return only a JSON object with a "questions" array containing exactly 7 questions, formatted as specified.`,
  };

  return [systemMessage, userMessage];
}
