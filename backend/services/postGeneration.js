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
 * Generate image for Instagram post using DALL-E
 * @param {string} pitch - The business pitch text
 * @param {number} count - Number of images to generate (default: 1)
 * @returns {Promise<string[]>} Array of image URLs
 */
export async function generateImages(pitch, count = 1) {
  // Generate only 1 image
  const imageCount = 1;
  const openai = getOpenAIClient();

  if (!pitch || typeof pitch !== 'string' || pitch.trim().length === 0) {
    throw new Error(
      'Business pitch is required and must be a non-empty string'
    );
  }

  try {
    // Generate a compelling image prompt based on the pitch
    const promptGenerationResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at creating image generation prompts for Instagram posts. Create a visual prompt that would be compelling for an Instagram post about a startup/product. The image should be eye-catching, modern, and professional.`,
        },
        {
          role: 'user',
          content: `Based on this business pitch, create a detailed image generation prompt for DALL-E that would create an attractive Instagram post image:\n\n${pitch}\n\nReturn only the image prompt, nothing else.`,
        },
      ],
      temperature: 0.7,
    });

    const imagePrompt =
      promptGenerationResponse.choices[0]?.message?.content?.trim();
    if (!imagePrompt) {
      throw new Error('Failed to generate image prompt');
    }

    // Generate multiple images (DALL-E 3 can only generate 1 at a time)
    const imagePromises = [];
    for (let i = 0; i < imageCount; i++) {
      imagePromises.push(
        openai.images.generate({
          model: 'dall-e-3',
          prompt: imagePrompt,
          size: '1024x1024',
          quality: 'standard',
        })
      );
    }

    const imageResults = await Promise.all(imagePromises);
    const imageUrls = imageResults
      .map((result) => result.data[0]?.url)
      .filter(Boolean);

    if (imageUrls.length === 0) {
      throw new Error('Failed to generate any images');
    }

    return imageUrls;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Image generation error: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Generate Instagram post description with link in bio
 * @param {string} pitch - The business pitch text
 * @returns {Promise<string>} Instagram post description
 */
export async function generatePostDescription(pitch) {
  const openai = getOpenAIClient();

  if (!pitch || typeof pitch !== 'string' || pitch.trim().length === 0) {
    throw new Error(
      'Business pitch is required and must be a non-empty string'
    );
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at creating compelling Instagram post descriptions. Create engaging, authentic Instagram post copy that:
- Is compelling and makes people want to click the link
- Mentions "link in bio" to drive traffic
- Is tailored to the business/product described
- Uses appropriate Instagram formatting (hashtags, line breaks, emojis)
- Is authentic and not overly salesy
- Creates curiosity and interest`,
        },
        {
          role: 'user',
          content: `Create an Instagram post description for this business pitch. The post should encourage people to click the link in bio to learn more or participate:

${pitch}

Return only the Instagram post description text, nothing else.`,
        },
      ],
      temperature: 0.8,
    });

    const description = response.choices[0]?.message?.content?.trim();
    if (!description) {
      throw new Error('Failed to generate post description');
    }

    // Ensure "link in bio" is mentioned (case-insensitive check)
    if (
      !description.toLowerCase().includes('link in bio') &&
      !description.toLowerCase().includes('linkinbio') &&
      !description.toLowerCase().includes('link in bio')
    ) {
      // Append if not present
      return `${description}\n\n🔗 Link in bio to learn more!`;
    }

    return description;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Description generation error: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Generate complete Instagram post (image + description)
 * @param {string} pitch - The business pitch text
 * @param {number} imageCount - Number of images to generate (default: 1)
 * @returns {Promise<{imageUrls: string[], description: string}>}
 */
export async function generatePost(pitch, imageCount = 1) {
  try {
    // Generate images and description in parallel for faster response
    const [imageUrls, description] = await Promise.all([
      generateImages(pitch, imageCount),
      generatePostDescription(pitch),
    ]);

    return {
      imageUrls,
      description,
    };
  } catch (error) {
    throw error;
  }
}
