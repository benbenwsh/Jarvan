const API_BASE_URL = '/api';

/**
 * Check if a company already exists in the database
 * @returns {Promise<{hasCompany: boolean}>}
 */
export const checkCompanyStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/company/status`);
  if (!response.ok) {
    throw new Error('Failed to check company status');
  }
  return response.json();
};

/**
 * Generate interview questions based on business pitch
 * @param {string} pitch - The business pitch text
 * @returns {Promise<{questions: string[]}>}
 */
export const generateQuestions = async (pitch) => {
  const response = await fetch(`${API_BASE_URL}/pitch/generate-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({pitch}),
  });
  if (!response.ok) {
    throw new Error('Failed to generate questions');
  }
  return response.json();
};

/**
 * Get social media post data (image and description)
 * @returns {Promise<{imageUrl: string, description: string}>}
 */
export const getPostData = async () => {
  const response = await fetch(`${API_BASE_URL}/post`);
  if (!response.ok) {
    throw new Error('Failed to get post data');
  }
  return response.json();
};

/**
 * Update the social media post description
 * @param {string} description - The updated description
 * @returns {Promise<void>}
 */
export const updatePostDescription = async (description) => {
  const response = await fetch(`${API_BASE_URL}/post`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({description}),
  });
  if (!response.ok) {
    throw new Error('Failed to update post description');
  }
  return response.json();
};

/**
 * Upload image and caption to Instagram
 * @param {string} imageUrl - The URL of the image to upload
 * @param {string} caption - The caption for the Instagram post
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const uploadToInstagram = async (imageUrl, caption) => {
  const response = await fetch(`${API_BASE_URL}/instagramUpload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageUrl, caption }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload to Instagram');
  }
  
  return response.json();
};
