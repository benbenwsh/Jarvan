import {useState, useEffect, useRef} from 'react';
import {useNavigate} from '@tanstack/react-router';

export const ChatbotPage = () => {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Get customer ID from sessionStorage
    const storedCustomerId = sessionStorage.getItem('customerId');
    if (!storedCustomerId) {
      navigate({to: '/chatbot'});
      return;
    }

    setCustomerId(storedCustomerId);
    initializeChat(storedCustomerId);
  }, [navigate]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  const initializeChat = async (customerId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/chatbot/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({customerId}),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize chat');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError('Failed to load chat. Please try again.');
      console.error('Error initializing chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || sending) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setSending(true);
    setError(null);

    // Optimistically add user message to UI
    const tempUserOrder =
      messages.length > 0 ? messages[messages.length - 1].order + 1 : 1;
    const tempUserMessage = {
      order: tempUserOrder,
      message: userMessage,
      isUser: true,
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      // Remove temp message and add real messages
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.order !== tempUserOrder);
        return [
          ...filtered,
          {order: data.userMessageOrder, message: userMessage},
          {order: data.botMessageOrder, message: data.botResponse},
        ];
      });
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
      console.error('Error sending message:', err);

      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.order !== tempUserOrder));
    } finally {
      setSending(false);
    }
  };

  const handleEndChat = () => {
    if (window.confirm('Are you sure you want to end the interview?')) {
      sessionStorage.removeItem('customerId');
      navigate({to: '/chatbot'});
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#a4c6d7]/10 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#a4c6d7]'></div>
          <p className='text-gray-600 font-medium'>Initializing interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#a4c6d7]/10 flex flex-col relative overflow-hidden'>
      {/* Background pattern */}
      <div className='absolute inset-0 opacity-[0.03]'>
        <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,_#a4c6d7_1px,_transparent_1px)] bg-[size:40px_40px]'></div>
      </div>

      {/* Floating orbs */}
      <div className='absolute top-10 right-10 w-64 h-64 bg-[#a4c6d7]/15 rounded-full blur-3xl animate-float-slow'></div>
      <div className='absolute bottom-10 left-10 w-80 h-80 bg-[#a4c6d7]/10 rounded-full blur-3xl animate-float-slower'></div>

      {/* Header */}
      <div className='relative bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm z-10'>
        <div className='max-w-4xl mx-auto px-4 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-gradient-to-br from-[#a4c6d7] to-[#8fb5c9] rounded-xl flex items-center justify-center shadow-md'>
              <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' />
              </svg>
            </div>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>User Interview</h1>
              <p className='text-xs text-gray-500'>AI Assistant</p>
            </div>
          </div>
          <button
            onClick={handleEndChat}
            className='px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105'>
            End Chat
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className='relative flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full'>
        <div className='space-y-4'>
          {messages.map((msg, index) => {
            const isUser = index % 2 === 1 || msg.isUser === true;

            return (
              <div
                key={`${msg.order}-${index}`}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-in-up`}
                style={{animationDelay: `${index * 0.05}s`}}>
                <div className={`flex items-end gap-2 max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isUser 
                      ? 'bg-gradient-to-br from-[#a4c6d7] to-[#8fb5c9]' 
                      : 'bg-gray-200'
                  }`}>
                    {isUser ? (
                      <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                      </svg>
                    ) : (
                      <svg className='w-4 h-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                      </svg>
                    )}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`group relative rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                      isUser
                        ? 'bg-gradient-to-br from-[#a4c6d7] to-[#8fb5c9] text-white'
                        : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200/50'
                    }`}>
                    <p className='text-sm whitespace-pre-wrap leading-relaxed'>{msg.message}</p>
                    
                    {/* Timestamp on hover */}
                    <div className={`absolute -bottom-5 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isUser ? 'right-0' : 'left-0'
                    }`}>
                      Just now
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator when sending */}
          {sending && (
            <div className='flex justify-start animate-slide-in-up'>
              <div className='flex items-end gap-2 max-w-3xl'>
                <div className='flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200'>
                  <svg className='w-4 h-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                  </svg>
                </div>
                <div className='bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-200/50'>
                  <div className='flex gap-1'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '0ms'}}></div>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '150ms'}}></div>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className='relative bg-white/80 backdrop-blur-md border-t border-gray-200/50 shadow-lg z-10'>
        <div className='max-w-4xl mx-auto px-4 py-4'>
          {error && (
            <div className='mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake'>
              <p className='text-red-800 text-sm font-medium'>{error}</p>
            </div>
          )}

          <form onSubmit={handleSendMessage} className='flex gap-2'>
            <div className='flex-1 relative'>
              <input
                type='text'
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={sending}
                placeholder='Type your response...'
                className='w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#a4c6d7] focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200'
              />
              <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
                <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                </svg>
              </div>
            </div>
            <button
              type='submit'
              disabled={sending || !inputMessage.trim()}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform flex items-center gap-2 ${
                sending || !inputMessage.trim()
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-gradient-to-r from-[#a4c6d7] to-[#8fb5c9] hover:from-[#8fb5c9] hover:to-[#7ba4b8] text-white hover:scale-105 hover:shadow-lg active:scale-95'
              }`}>
              {sending ? (
                <>
                  <svg className='animate-spin h-5 w-5' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                  </svg>
                  Sending
                </>
              ) : (
                <>
                  Send
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
