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
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white py-12 px-4'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>Jarvan</h1>
        </div>

        <ProgressBar progress={100} />

        <div className='bg-white border border-gray-200 rounded-lg p-8'>
          <h2 className='text-3xl font-bold text-gray-900 mb-2'>
            Review Your Post
          </h2>
          <p className='text-gray-600 mb-8'>
            Preview and edit your Instagram post before publishing
          </p>

          {error && (
            <div className='mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded'>
              <p className='text-red-800 text-sm font-medium'>{error}</p>
            </div>
          )}

          {success && (
            <div className='mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded'>
              <p className='text-green-800 text-sm font-medium'>
                Post uploaded to Instagram successfully!
              </p>
            </div>
          )}

          <div className='grid md:grid-cols-2 gap-8'>
            {/* Image Preview */}
            {imageUrl && (
              <div>
                <label className='block text-sm font-semibold text-gray-900 mb-3'>
                  Generated Image
                </label>
                <div className='border border-gray-200 rounded-lg overflow-hidden bg-gray-50'>
                  <img
                    src={imageUrl}
                    alt='Social media post'
                    className='w-full h-auto object-contain'
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const nextSibling = e.target.nextElementSibling;
                      if (nextSibling) {
                        nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div className='hidden w-full h-64 items-center justify-center text-gray-500'>
                    Failed to load image
                  </div>
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  Preview only - image cannot be edited
                </p>
              </div>
            )}

            {/* Description Editor */}
            <div>
              <label
                htmlFor='description'
                className='block text-sm font-semibold text-gray-900 mb-3'>
                Post Caption
              </label>
              <textarea
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Enter your Instagram post caption...'
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a4c6d7] focus:border-transparent resize-none bg-white'
                rows={12}
              />
              <p className='text-xs text-gray-500 mt-2'>
                {description.length} characters
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='mt-8 flex flex-col sm:flex-row gap-4'>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                saving
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-[#a4c6d7] hover:bg-[#8fb5c9] text-white'
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
                  Uploading...
                </span>
              ) : (
                'Publish to Instagram'
              )}
            </button>
            <button
              onClick={() => window.history.back()}
              disabled={saving}
              className='px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
