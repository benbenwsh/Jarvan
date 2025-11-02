/**
 * Loading spinner component with animation
 */
export const LoadingSpinner = () => {
  return (
    <div className='flex justify-center items-center py-8'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#a4c6d7]'></div>
    </div>
  );
};
