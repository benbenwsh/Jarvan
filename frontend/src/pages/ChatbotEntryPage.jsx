import {useState} from 'react';
import {useNavigate} from '@tanstack/react-router';

export const ChatbotEntryPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    setLoading(true);
    setError(null);

    try {
      // Create customer
      const response = await fetch('/api/chatbot/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }

      const data = await response.json();

      // Store customer ID and navigate to chatbot
      sessionStorage.setItem('customerId', data.customerId);
      navigate({to: '/chatbot/chat'});
    } catch (err) {
      setError(err.message || 'Failed to start chat. Please try again.');
      console.error('Error creating customer:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-xl shadow-lg p-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            User Interview
          </h1>
          <p className='text-gray-600 mb-8'>
            Please enter your information to start the interview
          </p>

          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-800 text-sm'>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className='mb-6'>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-2'>
                Name
              </label>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder='Enter your full name'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
                required
              />
            </div>

            <div className='mb-6'>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-2'>
                Email
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder='Enter your email address'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
                required
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
              {loading ? 'Starting...' : 'Start Interview'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
