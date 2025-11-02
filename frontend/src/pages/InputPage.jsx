import {useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {ProgressBar} from '../components/ProgressBar';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {QuestionCard} from '../components/QuestionCard';
import {useCompanyStatus} from '../hooks/useCompanyStatus';

export const InputPage = () => {
  const navigate = useNavigate();
  const {hasCompany, loading: statusLoading} = useCompanyStatus();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pitch, setPitch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [error, setError] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);

  const handleSubmitPitch = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (!pitch.trim()) {
      setError('Please enter your business pitch');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setShowQuestions(false);

    try {
      // POST request to get questions
      console.log('hi');
      const response = await fetch(
        '/api/pitch/generate-questions',
        // 'https://mbnz.app.n8n.cloud/webhook-test/da149b04-f739-4f04-bd2e-c5686f8b577b',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({pitch}),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();

      // setQuestions(data.map((item) => item.output.questions).flat() || []);
      setQuestions(data.questions || []);
      setShowQuestions(true);
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error('Error generating questions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveQuestion = (indexToRemove) => {
    setQuestions(questions.filter((_, index) => index !== indexToRemove));
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  const handleConfirmQuestions = async () => {
    // Save company and questions to Supabase, then generate Instagram post
    setIsGeneratingPost(true);
    setError(null);

    console.log('Questions being sent:', questions);

    try {
      // Step 1: Save company and questions to Supabase
      const saveResponse = await fetch('/api/company/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          pitch,
          questions,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save company data');
      }

      const saveData = await saveResponse.json();
      console.log('Company saved with ID:', saveData.companyId);

      // Step 2: Generate Instagram post
      const postResponse = await fetch('/api/pitch/generate-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({pitch, imageCount: 1}),
      });

      if (!postResponse.ok) {
        throw new Error('Failed to generate post');
      }

      const postData = await postResponse.json();

      // Store post data in sessionStorage for navigation
      // Use first image if imageUrls array, or single imageUrl
      const imageUrl =
        postData.imageUrl ||
        (postData.imageUrls && postData.imageUrls[0]) ||
        '';
      sessionStorage.setItem(
        'postData',
        JSON.stringify({
          imageUrl: imageUrl,
          description: postData.description,
        })
      );

      // Navigate to post confirmation page
      navigate({to: '/post-confirmation'});
    } catch (err) {
      setError(
        err.message || 'Failed to save data or generate post. Please try again.'
      );
      console.error('Error:', err);
      setIsGeneratingPost(false);
    }
  };

  const isDisabled = hasCompany || statusLoading;

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header with animation */}
        <div className='mb-8 animate-fadeInUp'>
          <h1 className='text-3xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-[#a4c6d7] to-[#8fb5c9] bg-clip-text text-transparent'>
            Jarvan
          </h1>
          <p className='text-sm text-gray-500'>AI-Powered Social Media Content</p>
        </div>

        <ProgressBar progress={50} />

        <div className='bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 animate-scaleIn'>
          <div className='flex items-center mb-6'>
            <div className='w-12 h-12 bg-gradient-to-br from-[#a4c6d7] to-[#8fb5c9] rounded-lg flex items-center justify-center mr-4 shadow-md animate-float'>
              <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
              </svg>
            </div>
            <div>
              <h2 className='text-3xl font-bold text-gray-900'>
                Startup Idea Validation
              </h2>
              <p className='text-gray-600 mt-1'>
                Enter your business pitch to generate interview questions
              </p>
            </div>
          </div>

          {hasCompany && (
            <div className='mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg animate-slideInRight'>
              <div className='flex items-center'>
                <svg className='w-5 h-5 text-yellow-600 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                </svg>
                <p className='text-yellow-800 font-medium'>
                  A company has already been registered. Input is disabled.
                </p>
              </div>
            </div>
          )}

          <div className='space-y-6'>
            <div className='transform transition-all duration-200 hover:scale-[1.01]'>
              <label
                htmlFor='name'
                className='block text-sm font-semibold text-gray-900 mb-2'>
                Name <span className='text-red-500'>*</span>
              </label>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isDisabled}
                placeholder='Enter your full name'
                className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#a4c6d7] focus:border-[#a4c6d7] ${
                  isDisabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white hover:border-gray-300'
                }`}
              />
            </div>

            <div className='transform transition-all duration-200 hover:scale-[1.01]'>
              <label
                htmlFor='email'
                className='block text-sm font-semibold text-gray-900 mb-2'>
                Email <span className='text-red-500'>*</span>
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isDisabled}
                placeholder='Enter your email address'
                className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#a4c6d7] focus:border-[#a4c6d7] ${
                  isDisabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white hover:border-gray-300'
                }`}
              />
            </div>

            <div className='transform transition-all duration-200 hover:scale-[1.01]'>
              <label
                htmlFor='pitch'
                className='block text-sm font-semibold text-gray-900 mb-2'>
                Business Pitch <span className='text-red-500'>*</span>
              </label>
              <textarea
                id='pitch'
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                disabled={isDisabled}
                placeholder='Describe your startup idea, target market, and value proposition...'
                className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#a4c6d7] focus:border-[#a4c6d7] resize-none ${
                  isDisabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white hover:border-gray-300'
                }`}
                rows={8}
              />
              <p className='text-xs text-gray-500 mt-2'>{pitch.length} characters</p>
            </div>
          </div>

          {error && (
            <div className='mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideInRight'>
              <div className='flex items-center'>
                <svg className='w-5 h-5 text-red-600 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
                <p className='text-red-800 text-sm font-medium'>{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmitPitch}
            disabled={isDisabled || isGenerating}
            className={`mt-8 w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md ${
              isDisabled || isGenerating
                ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                : 'bg-gradient-to-r from-[#a4c6d7] to-[#8fb5c9] hover:from-[#8fb5c9] hover:to-[#7aa4b8] text-white shadow-lg hover:shadow-xl'
            }`}>
            {isGenerating ? (
              <span className='flex items-center justify-center'>
                <svg className='animate-spin -ml-1 mr-3 h-5 w-5' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Generating Questions...
              </span>
            ) : (
              'Confirm & Generate Questions'
            )}
          </button>

          {isGenerating && <LoadingSpinner />}

          {showQuestions && questions.length > 0 && (
            <div className='mt-8 pt-8 border-t-2 border-gray-100'>
              <div className='flex items-center mb-6 animate-fadeInUp'>
                <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
                <h3 className='text-2xl font-bold text-gray-900 px-4'>
                  Generated Questions
                </h3>
                <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent'></div>
              </div>
              <div className='space-y-4'>
                {questions.map((question, index) => (
                  <div key={index} className='relative group'>
                    <QuestionCard question={question} index={index} />
                    <button
                      onClick={() => handleRemoveQuestion(index)}
                      className='absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md'
                      title='Remove question'>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new question input */}
              <div className='mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                <label className='block text-sm font-semibold text-gray-900 mb-2'>
                  Add Custom Question
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                    placeholder='Enter a custom question...'
                    className='flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#a4c6d7] focus:border-[#a4c6d7] bg-white'
                  />
                  <button
                    onClick={handleAddQuestion}
                    disabled={!newQuestion.trim()}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      newQuestion.trim()
                        ? 'bg-gradient-to-r from-[#a4c6d7] to-[#8fb5c9] hover:from-[#8fb5c9] hover:to-[#7aa4b8] text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-300 cursor-not-allowed text-gray-500'
                    }`}>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={handleConfirmQuestions}
                disabled={isGeneratingPost}
                className={`mt-8 w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md animate-fadeInUp ${
                  isGeneratingPost
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                    : 'bg-gradient-to-r from-[#a4c6d7] to-[#8fb5c9] hover:from-[#8fb5c9] hover:to-[#7aa4b8] text-white shadow-lg hover:shadow-xl'
                }`}>
                {isGeneratingPost ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Generating post...
                  </span>
                ) : (
                  <span className='flex items-center justify-center'>
                    <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                    </svg>
                    Confirm Questions & Continue
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};