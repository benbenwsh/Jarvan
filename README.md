# Jarvan - Startup Idea Validation Platform

A full-stack application for validating startup ideas through AI-generated user interview questions and social media post generation.

## Project Structure

```
jarvan/
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API server
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   - Copy `.env.example` to `.env` (already created)
   - Add your OpenAI API key to `backend/.env`:
     ```
     OPENAI_API_KEY=your_actual_api_key_here
     ```

4. Start the backend server:

   ```bash
   npm start
   ```

   Or for development with auto-reload:

   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## API Endpoints

### POST `/api/pitch/generate-questions`

Generates 7 structured interview questions based on a business pitch.

**Request:**

```json
{
  "pitch": "Your business pitch text here..."
}
```

**Response:**

```json
{
  "questions": [
    "Question 1: Initial Interest & Purchase Intent (1-10 scale)",
    "Question 2: Price Sensitivity",
    "Question 3: Broader insight question",
    "Question 4: Broader insight question",
    "Question 5: Broader insight question",
    "Question 6: Broader insight question",
    "Question 7: Broader insight question"
  ]
}
```

**Question Structure:**

1. **Question 1**: Initial Interest & Purchase Intent - 1-10 scale question tailored to the business
2. **Question 2**: Price Sensitivity - Multiple choice or numeric input tailored to the business
3. **Questions 3-7**: Broader insights about product features, preferences, concerns, etc.

## Technologies

- **Frontend**: React, Vite, TanStack Router, Tailwind CSS
- **Backend**: Node.js, Express, OpenAI API (GPT-4o-mini)
- **AI**: OpenAI GPT-4o-mini for question generation

## Development

The frontend Vite dev server is configured to proxy API requests to the backend server running on port 3000. Make sure both servers are running for full functionality.
