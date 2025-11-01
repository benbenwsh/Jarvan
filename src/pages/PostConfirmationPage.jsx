import {useState, useEffect} from 'react';
import {ProgressBar} from '../components/ProgressBar';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {getPostData, updatePostDescription} from '../services/api';

export const PostConfirmationPage = () => {
  const [postData, setPostData] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPostData();
        setPostData(data);
        setDescription(data.description || '');
      } catch (err) {
        setError('Failed to load post data. Please try again.');
        console.error('Error fetching post data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, []);

  const handleSave = async () => {
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updatePostDescription(description);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save description. Please try again.');
      console.error('Error updating description:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4'>
      <div className='max-w-4xl mx-auto'>
        <ProgressBar progress={100} />

        <div className='bg-white rounded-xl shadow-lg p-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Social Media Post Confirmation
          </h1>
          <p className='text-gray-600 mb-8'>
            Review and edit your Instagram post
          </p>

          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-800 text-sm'>{error}</p>
            </div>
          )}

          {success && (
            <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
              <p className='text-green-800 text-sm'>
                Description saved successfully!
              </p>
            </div>
          )}

          {postData?.imageUrl && (
            <div className='mb-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Generated Image
              </label>
              <div className='border border-gray-300 rounded-lg overflow-hidden bg-gray-100'>
                <img
                  src={postData.imageUrl}
                  alt='Social media post'
                  className='w-full h-auto object-contain'
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className='hidden w-full h-64 items-center justify-center text-gray-500'>
                  Failed to load image
                </div>
              </div>
              <p className='text-xs text-gray-500 mt-2'>
                Image cannot be edited
              </p>
            </div>
          )}

          <div className='mb-6'>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700 mb-2'>
              Instagram Post Description
            </label>
            <textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Enter your Instagram post description...'
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white'
              rows={8}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
              saving
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}>
            {saving ? 'Saving...' : 'Save Description'}
          </button>
        </div>
      </div>
    </div>
  );
};
