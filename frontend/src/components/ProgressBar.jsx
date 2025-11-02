/**
 * Progress bar component showing progress through the flow
 * Shows 50% on first page, 100% on second page
 */
export const ProgressBar = ({progress = 50}) => {
  return (
    <div className='w-full mb-8'>
      <div className='flex justify-between items-center mb-2'>
        <span className='text-sm font-medium text-gray-700'>Progress</span>
        <span className='text-sm font-medium text-gray-700'>{progress}%</span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className='bg-[#a4c6d7] h-2 rounded-full transition-all duration-500 ease-out'
          style={{width: `${progress}%`}}
        />
      </div>
    </div>
  );
};
