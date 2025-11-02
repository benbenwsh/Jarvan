/**
 * Component to display an individual question
 */
export const QuestionCard = ({question, index}) => {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200'>
      <div className='flex items-start'>
        <div className='flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4'>
          <span className='text-blue-600 font-semibold text-sm'>
            {index + 1}
          </span>
        </div>
        <p className='text-gray-800 text-lg leading-relaxed flex-1'>
          {question}
        </p>
      </div>
    </div>
  );
};
