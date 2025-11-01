import {useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {ProgressBar} from '../components/ProgressBar';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {QuestionCard} from '../components/QuestionCard';
import {useCompanyStatus} from '../hooks/useCompanyStatus';
import {generateQuestions} from '../services/api';

export const InputPage = () => {
  const navigate = useNavigate();
  const {hasCompany, loading: statusLoading} = useCompanyStatus();
  const [pitch, setPitch] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);

  const handleSubmitPitch = async () => {
    if (!pitch.trim()) {
      setError('Please enter your business pitch');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setShowQuestions(false);

    try {
      const data = await generateQuestions(pitch);
      setQuestions(data.questions || []);
      setShowQuestions(true);
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error('Error generating questions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmQuestions = () => {
    navigate({to: '/post-confirmation'});
  };

  const isDisabled = hasCompany || statusLoading;

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        <ProgressBar progress={50} />

        <div className='bg-white rounded-xl shadow-lg p-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Startup Idea Validation
          </h1>
          <p className='text-gray-600 mb-8'>
            Enter your business pitch to generate interview questions
          </p>

          {hasCompany && (
            <div className='mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <p className='text-yellow-800'>
                A company has already been registered. Input is disabled.
              </p>
            </div>
          )}

          <div className='mb-6'>
            <label
              htmlFor='pitch'
              className='block text-sm font-medium text-gray-700 mb-2'>
              Business Pitch
            </label>
            <textarea
              id='pitch'
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              disabled={isDisabled}
              placeholder='Describe your startup idea, target market, and value proposition...'
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
              rows={8}
            />
          </div>

          {error && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-800 text-sm'>{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmitPitch}
            disabled={isDisabled || isGenerating}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              isDisabled || isGenerating
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}>
            {isGenerating
              ? 'Generating Questions...'
              : 'Confirm & Generate Questions'}
          </button>

          {isGenerating && <LoadingSpinner />}

          {showQuestions && questions.length > 0 && (
            <div className='mt-8 pt-8 border-t border-gray-200'>
              <h2 className='text-2xl font-semibold text-gray-800 mb-6'>
                Generated Interview Questions
              </h2>
              <div className='space-y-4'>
                {questions.map((question, index) => (
                  <QuestionCard key={index} question={question} index={index} />
                ))}
              </div>
              <button
                onClick={handleConfirmQuestions}
                className='mt-6 w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors'>
                Confirm Questions & Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
