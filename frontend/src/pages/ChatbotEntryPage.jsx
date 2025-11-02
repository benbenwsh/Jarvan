import {useState, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';

export const ChatbotEntryPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/company/list');
        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }
        const data = await response.json();
        setCompanies(data.companies || []);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies. Please refresh the page.');
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCompanyId) {
      setError('Please select a company');
      return;
    }

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
          companyId: selectedCompanyId,
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
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#a4c6d7]/10 relative overflow-hidden'>
      {/* Animated background pattern */}
      <div className='absolute inset-0 opacity-[0.03]'>
        <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,_#a4c6d7_1px,_transparent_1px)] bg-[size:40px_40px]'></div>
      </div>

      {/* Floating orbs */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-[#a4c6d7]/20 rounded-full blur-3xl animate-float-slow'></div>
      <div className='absolute bottom-20 right-10 w-96 h-96 bg-[#a4c6d7]/15 rounded-full blur-3xl animate-float-slower'></div>

      <div className='relative min-h-screen flex items-center justify-center py-12 px-4'>
        <div className='max-w-md w-full'>
          {/* Main card with glass effect */}
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl p-8 animate-fade-in-up'>
            {/* Icon/Logo */}
            <div className='mb-6 flex justify-center'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#a4c6d7] to-[#8fb5c9] rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300'>
                <svg
                  className='w-8 h-8 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
                  />
                </svg>
              </div>
            </div>

            <h1 className='text-3xl font-bold text-gray-900 mb-2 text-center'>
              User Interview
            </h1>
            <p className='text-gray-600 mb-8 text-center'>
              Share your details to begin your personalized interview
            </p>

            {error && (
              <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake'>
                <p className='text-red-800 text-sm font-medium'>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='group'>
                <label
                  htmlFor='company'
                  className='block text-sm font-semibold text-gray-900 mb-2'>
                  Company
                </label>
                <div className='relative'>
                  <select
                    id='company'
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    disabled={loading}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a4c6d7] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 group-hover:border-gray-400 bg-white appearance-none cursor-pointer'
                    required>
                    <option value=''>Select a company</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className='group'>
                <label
                  htmlFor='name'
                  className='block text-sm font-semibold text-gray-900 mb-2'>
                  Name
                </label>
                <div className='relative'>
                  <input
                    id='name'
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    placeholder='Enter your full name'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a4c6d7] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 group-hover:border-gray-400'
                    required
                  />
                  <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className='group'>
                <label
                  htmlFor='email'
                  className='block text-sm font-semibold text-gray-900 mb-2'>
                  Email
                </label>
                <div className='relative'>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder='Enter your email address'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a4c6d7] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 group-hover:border-gray-400'
                    required
                  />
                  <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                type='submit'
                disabled={loading}
                className={`w-full py-3.5 px-6 rounded-lg font-semibold transition-all duration-300 transform ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500 scale-95'
                    : 'bg-[#a4c6d7] hover:bg-[#8fb5c9] text-white hover:scale-[1.02] hover:shadow-lg active:scale-95'
                }`}>
                {loading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                        fill='none'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    Starting...
                  </span>
                ) : (
                  'Start Interview'
                )}
              </button>
            </form>

            <div className='mt-6 text-center'>
              <p className='text-xs text-gray-500'>
                Your information is secure and will only be used for this
                interview
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
