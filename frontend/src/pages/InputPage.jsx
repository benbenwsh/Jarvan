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

  const handleConfirmQuestions = async () => {
    // Save company and questions to Supabase, then generate Instagram post
    setIsGeneratingPost(true);
    setError(null);

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
    <div className='min-h-screen bg-white py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Jarvan</h1>
        </div>

        <ProgressBar progress={50} />

        <div className='bg-white border border-gray-200 rounded-lg p-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>
            Startup Idea Validation
          </h2>
          <p className='text-gray-600 mb-8'>
            Enter your business pitch to generate interview questions
          </p>

          {hasCompany && (
            <div className='mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded'>
              <p className='text-yellow-800 font-medium'>
                A company has already been registered. Input is disabled.
              </p>
            </div>
          )}

          <div className='mb-6'>
            <label
              htmlFor='name'
              className='block text-sm font-semibold text-gray-900 mb-2'>
              Name
            </label>
            <input
              id='name'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isDisabled}
              placeholder='Enter your full name'
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a4c6d7] focus:border-transparent ${
                isDisabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white'
              }`}
            />
          </div>

          <div className='mb-6'>
            <label
              htmlFor='email'
              className='block text-sm font-semibold text-gray-900 mb-2'>
              Email
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isDisabled}
              placeholder='Enter your email address'
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a4c6d7] focus:border-transparent ${
                isDisabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white'
              }`}
            />
          </div>

          <div className='mb-6'>
            <label
              htmlFor='pitch'
              className='block text-sm font-semibold text-gray-900 mb-2'>
              Business Pitch
            </label>
            <textarea
              id='pitch'
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              disabled={isDisabled}
              placeholder='Describe your startup idea, target market, and value proposition...'
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a4c6d7] focus:border-transparent resize-none ${
                isDisabled ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white'
              }`}
              rows={8}
            />
          </div>

          {error && (
            <div className='mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded'>
              <p className='text-red-800 text-sm font-medium'>{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmitPitch}
            disabled={isDisabled || isGenerating}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              isDisabled || isGenerating
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-[#a4c6d7] hover:bg-[#8fb5c9] text-white'
            }`}>
            {isGenerating
              ? 'Generating Questions...'
              : 'Confirm & Generate Questions'}
          </button>

          {isGenerating && <LoadingSpinner />}

          {showQuestions && questions.length > 0 && (
            <div className='mt-8 pt-8 border-t border-gray-200'>
              <h3 className='text-2xl font-bold text-gray-900 mb-6'>
                Generated Interview Questions
              </h3>
              <div className='space-y-4'>
                {questions.map((question, index) => (
                  <QuestionCard key={index} question={question} index={index} />
                ))}
              </div>
              <button
                onClick={handleConfirmQuestions}
                disabled={isGeneratingPost}
                className={`mt-6 w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  isGeneratingPost
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-[#a4c6d7] hover:bg-[#8fb5c9] text-white'
                }`}>
                {isGeneratingPost ? (
                  <>
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
                  </>
                ) : (
                  'Confirm Questions & Continue'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
