import OpenAI from 'openai';

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
 * Generate chatbot response based on conversation history
 * @param {Array<{order: number, message: string}>} messages - All previous messages
 * @param {string} businessPitch - The business pitch
 * @param {Array<{id: number, question: string}>} questions - Predefined questions
 * @returns {Promise<string>} Chatbot response
 */
export async function generateChatbotResponse(
  messages,
  businessPitch,
  questions
) {
  const openai = getOpenAIClient();

  // Determine which questions have been asked and what should come next
  const conversationText = messages.map((m) => m.message).join('\n');

  // Find the highest question ID that has been referenced in conversation
  let lastQuestionIndex = -1;
  for (let i = questions.length - 1; i >= 0; i--) {
    const questionLower = questions[i].question.toLowerCase();
    if (
      conversationText.toLowerCase().includes(questionLower.substring(0, 20))
    ) {
      lastQuestionIndex = i;
      break;
    }
  }

  const nextQuestionIndex = lastQuestionIndex + 1;
  const hasMoreQuestions = nextQuestionIndex < questions.length;
  const nextQuestion = hasMoreQuestions ? questions[nextQuestionIndex] : null;

  // Build system prompt
  const systemPrompt = `You are a friendly and conversational interviewer conducting a user interview to validate a startup idea. Your goal is to:

1. Ask the predefined questions naturally and conversationally (not reading them verbatim)
2. Ask follow-up "why" questions when responses are interesting, detailed, or show strong opinions
3. Show genuine interest and engage naturally with the user's responses
4. Progress through the predefined questions while maintaining natural conversation flow
5. Use the business pitch context to understand what you're interviewing about

Business Pitch Context:
${businessPitch}

Predefined Questions to Ask (in order):
${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}

Current Status:
${
  hasMoreQuestions
    ? `You should ask question ${nextQuestionIndex + 1}: "${
        nextQuestion.question
      }"`
    : 'You have asked all predefined questions. Continue the conversation naturally and ask follow-up questions about interesting points.'
}

Conversation Guidelines:
- Be conversational and friendly, not robotic
- Ask one question at a time
- If the user's response is interesting, ask "why" or "can you tell me more about that?"
- If asking a predefined question, make it sound natural and conversational
- Don't repeat questions you've already asked
- Keep responses concise (1-2 sentences for questions, brief acknowledgments)`;

  // Build conversation history for context
  const conversationHistory =
    messages.length > 0
      ? messages
          .map((m, idx) => {
            // Determine if message is from user or bot (alternating pattern)
            const isUser = idx % 2 === 0;
            return `${isUser ? 'User' : 'Interviewer'}: ${m.message}`;
          })
          .join('\n')
      : '';

  const userPrompt = conversationHistory
    ? `${conversationHistory}\n\nBased on the conversation above, what should you say next?`
    : `Start the conversation by introducing yourself briefly and asking the first question naturally: "${questions[0].question}". Make it sound conversational and friendly.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {role: 'system', content: systemPrompt},
        {role: 'user', content: userPrompt},
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const chatbotMessage = response.choices[0]?.message?.content?.trim();

    if (!chatbotMessage) {
      throw new Error('No response from OpenAI');
    }

    return chatbotMessage;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
  }
}
