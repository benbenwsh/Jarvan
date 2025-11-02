/**
 * Progress bar component showing progress through the flow
 * Shows 50% on first page, 100% on second page
 */
export const ProgressBar = ({progress = 50}) => {
  return (
    <div className='w-full mb-8'>
      <div className='flex justify-between items-center mb-3'>
        <span className='text-sm font-semibold text-gray-700'>Progress</span>
        <span className='text-sm font-bold text-[#a4c6d7] tabular-nums'>{progress}%</span>
      </div>
      <div className='w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner'>
        <div
          className='bg-gradient-to-r from-[#a4c6d7] to-[#8fb5c9] h-2.5 rounded-full transition-all duration-700 ease-out relative overflow-hidden'
          style={{width: `${progress}%`}}>
          {/* Animated shimmer effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer'></div>
        </div>
      </div>
    </div>
  );
};
