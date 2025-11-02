import {useState} from 'react';

export const AnalyticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalytics(null);

    try {
      const response = await fetch('/api/analytics/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze data');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze. Please try again.');
      console.error('Error analyzing:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-xl shadow-lg p-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Interview Analytics
          </h1>
          <p className='text-gray-600 mb-8'>
            Analyze customer interviews to get insights about your business idea
          </p>

          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-800 text-sm'>{error}</p>
            </div>
          )}

          {!analytics && (
            <div className='text-center'>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}>
                {loading ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block'
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
                    Analyzing...
                  </>
                ) : (
                  'Start Analysis'
                )}
              </button>
            </div>
          )}

          {analytics && (
            <div className='mt-8 space-y-8'>
              {/* Customer Count */}
              <div>
                <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                  Summary
                </h2>
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <p className='text-blue-800'>
                    <span className='font-semibold'>
                      {analytics.customerCount}
                    </span>{' '}
                    {analytics.customerCount === 1
                      ? 'customer has'
                      : 'customers have'}{' '}
                    been interviewed
                  </p>
                </div>
              </div>

              {/* General Insights */}
              {analytics.insights.generalInsights &&
                analytics.insights.generalInsights.length > 0 && (
                  <div>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                      General Insights
                    </h2>
                    <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
                      <ul className='list-disc list-inside space-y-2'>
                        {analytics.insights.generalInsights.map(
                          (insight, idx) => (
                            <li key={idx} className='text-gray-700'>
                              {insight}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}

              {/* Positive Feedback */}
              {analytics.insights.positives &&
                analytics.insights.positives.length > 0 && (
                  <div>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                      Positive Feedback
                    </h2>
                    <div className='bg-green-50 border border-green-200 rounded-lg p-6'>
                      <ul className='list-disc list-inside space-y-2'>
                        {analytics.insights.positives.map((positive, idx) => (
                          <li key={idx} className='text-gray-700'>
                            {positive}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              {/* Negative Feedback */}
              {analytics.insights.negatives &&
                analytics.insights.negatives.length > 0 && (
                  <div>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                      Negative Feedback & Concerns
                    </h2>
                    <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
                      <ul className='list-disc list-inside space-y-2'>
                        {analytics.insights.negatives.map((negative, idx) => (
                          <li key={idx} className='text-gray-700'>
                            {negative}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              {/* Pivot Suggestions */}
              {analytics.insights.pivotSuggestions &&
                analytics.insights.pivotSuggestions.length > 0 && (
                  <div>
                    <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
                      Pivot Suggestions
                    </h2>
                    <div className='bg-purple-50 border border-purple-200 rounded-lg p-6'>
                      <ul className='list-disc list-inside space-y-2'>
                        {analytics.insights.pivotSuggestions.map(
                          (suggestion, idx) => (
                            <li key={idx} className='text-gray-700'>
                              {suggestion}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}

              {/* Re-analyze button */}
              <div className='pt-4 border-t border-gray-200'>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}>
                  {loading ? 'Re-analyzing...' : 'Re-analyze'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
