/**
 * Loading spinner component with animation
 */
export const LoadingSpinner = () => {
  return (
    <div className='flex flex-col justify-center items-center py-12'>
      <div className='relative'>
        {/* Outer ring */}
        <div className='animate-spin rounded-full h-16 w-16 border-4 border-gray-200'></div>
        {/* Animated arc */}
        <div className='absolute top-0 left-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-[#a4c6d7] border-r-[#a4c6d7]'></div>
        {/* Inner pulse */}
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#a4c6d7] rounded-full animate-pulse opacity-20'></div>
      </div>
      <p className='mt-4 text-sm text-gray-500 animate-pulse'>Loading...</p>
    </div>
  );
};
