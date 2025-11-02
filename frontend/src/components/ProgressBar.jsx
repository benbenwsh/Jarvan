/**
 * Progress bar component showing progress through the flow
 * Shows 50% on first page, 100% on second page
 */
export const ProgressBar = ({progress = 50}) => {
  return (
    <div className='w-full bg-gray-200 rounded-full h-2.5 mb-6'>
      <div
        className='bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out'
        style={{width: `${progress}%`}}
      />
    </div>
  );
};
