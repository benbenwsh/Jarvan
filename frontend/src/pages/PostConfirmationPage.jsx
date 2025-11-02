import {useState, useEffect} from 'react';
import {ProgressBar} from '../components/ProgressBar';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {uploadToInstagram} from '../services/api';

export const PostConfirmationPage = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get data from sessionStorage
    try {
      const storedData = sessionStorage.getItem('postData');
      if (storedData) {
        const postData = JSON.parse(storedData);
        // Handle both old format (imageUrls array) and new format (single imageUrl)
        const image =
          postData.imageUrl ||
          (postData.imageUrls && postData.imageUrls[0]) ||
          '';
        if (image && postData.description) {
          setImageUrl(image);
          setDescription(postData.description);
          setLoading(false);
        } else {
          setError('Invalid post data. Please go back and try again.');
          setLoading(false);
        }
      } else {
        setError('No post data available. Please go back and try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load post data. Please go back and try again.');
      setLoading(false);
      console.error('Error loading post data:', err);
    }
  }, []);

  const handleSave = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!imageUrl) {
      setError('No image available to upload');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await uploadToInstagram(imageUrl, description);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.message || 'Failed to upload to Instagram');
      }
    } catch (err) {
      setError('Failed to upload to Instagram. Please try again.');
      console.error('Error uploading to Instagram:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header with animation */}
        <div className='mb-8 animate-fadeInUp'>
          <h1 className='text-3xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-[#a4c6d7] to-[#8fb5c9] bg-clip-text text-transparent'>
            Jarvan
          </h1>
          <p className='text-sm text-gray-500'>AI-Powered Social Media Content</p>
        </div>

        <ProgressBar progress={100} />

        <div className='bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 animate-scaleIn'>
          <div className='flex items-center mb-6'>
            <div className='w-12 h-12 bg-gradient-to-br from-[#a4c6d7] to-[#8fb5c9] rounded-lg flex items-center justify-center mr-4 shadow-md animate-float'>
              <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div>
              <h2 className='text-3xl font-bold text-gray-900'>
                Review Your Post
              </h2>
              <p className='text-gray-600 mt-1'>
                Preview and edit your Instagram post before publishing
              </p>
            </div>
          </div>

          {error && (
            <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-slideInRight'>
              <div className='flex items-center'>
                <svg className='w-5 h-5 text-red-600 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                </svg>
                <p className='text-red-800 text-sm font-medium'>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className='mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-slideInRight'>
              <div className='flex items-center'>
                <svg className='w-5 h-5 text-green-600 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
                <p className='text-green-800 text-sm font-medium'>
                  Post uploaded to Instagram successfully!
                </p>
              </div>
            </div>
          )}

          <div className='grid lg:grid-cols-2 gap-8'>
            {/* Image Preview */}
            {imageUrl && (
              <div className='animate-fadeInUp'>
                <label className='flex items-center text-sm font-semibold text-gray-900 mb-3'>
                  <svg className='w-4 h-4 mr-2 text-[#a4c6d7]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                  </svg>
                  Generated Image
                </label>
                <div className='relative border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-md hover:shadow-xl transition-all duration-300 group'>
                  <img
                    src={imageUrl}
                    alt='Social media post'
                    className='w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-300'
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const nextSibling = e.target.nextElementSibling;
                      if (nextSibling) {
                        nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div className='hidden w-full h-64 items-center justify-center text-gray-500'>
                    <div className='text-center'>
                      <svg className='w-12 h-12 mx-auto mb-2 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                      <p>Failed to load image</p>
                    </div>
                  </div>
                  {/* Overlay badge */}
                  <div className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm'>
                    AI Generated
                  </div>
                </div>
                <p className='text-xs text-gray-500 mt-2 flex items-center'>
                  <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                  </svg>
                  Preview only - image cannot be edited
                </p>
              </div>
            )}

            {/* Description Editor */}
            <div className='animate-fadeInUp' style={{animationDelay: '100ms'}}>
              <label
                htmlFor='description'
                className='flex items-center justify-between text-sm font-semibold text-gray-900 mb-3'>
                <span className='flex items-center'>
                  <svg className='w-4 h-4 mr-2 text-[#a4c6d7]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                  </svg>
                  Post Caption
                </span>
                <span className='text-xs font-normal text-gray-500 tabular-nums'>
                  {description.length} chars
                </span>
              </label>
              <div className='relative'>
                <textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Enter your Instagram post caption...'
                  className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#a4c6d7] focus:border-[#a4c6d7] resize-none bg-white hover:border-gray-300 transition-all duration-200 shadow-sm'
                  rows={14}
                />
                {/* Character count indicator */}
                <div className='absolute bottom-3 right-3 flex gap-1'>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        description.length > i * 100 ? 'bg-[#a4c6d7]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className='mt-2 flex items-center justify-between text-xs text-gray-500'>
                <p className='flex items-center'>
                  <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                  </svg>
                  Edit caption as needed
                </p>
                <p className={`font-medium ${description.length > 2200 ? 'text-orange-500' : 'text-gray-500'}`}>
                  {description.length > 2200 ? 'Getting long!' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='mt-8 flex flex-col sm:flex-row gap-4 animate-fadeInUp' style={{animationDelay: '200ms'}}>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md ${
                saving
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                  : 'bg-gradient-to-r from-[#a4c6d7] to-[#8fb5c9] hover:from-[#8fb5c9] hover:to-[#7aa4b8] text-white shadow-lg hover:shadow-xl'
              }`}>
              {saving ? (
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
                  Uploading to Instagram...
                </span>
              ) : (
                <span className='flex items-center justify-center'>
                  <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' />
                  </svg>
                  Publish to Instagram
                </span>
              )}
            </button>
            <button
              onClick={() => window.history.back()}
              disabled={saving}
              className='sm:w-auto px-6 py-4 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-[#a4c6d7] hover:text-[#a4c6d7] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md'>
              <span className='flex items-center justify-center'>
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
                </svg>
                Go Back
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
