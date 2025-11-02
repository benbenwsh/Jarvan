/**
 * Component to display an individual question
 */
export const QuestionCard = ({question, index}) => {
  return (
    <div 
      className='bg-white rounded-lg p-6 mb-4 border border-gray-200 hover:border-[#a4c6d7] hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 group animate-fadeInUp'
      style={{animationDelay: `${index * 100}ms`}}>
      <div className='flex items-start'>
        <div className='flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#a4c6d7] to-[#8fb5c9] rounded-full flex items-center justify-center mr-4 shadow-sm group-hover:scale-110 transition-transform duration-300'>
          <span className='text-white font-bold text-sm'>
            {index + 1}
          </span>
        </div>
        <p className='text-gray-800 text-base leading-relaxed flex-1 group-hover:text-gray-900 transition-colors'>
          {question}
        </p>
      </div>
    </div>
  );
};
