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
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-4xl mx-auto px-4 py-4'>
          <h1 className='text-2xl font-bold text-gray-800'>User Interview</h1>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className='flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full'>
        <div className='space-y-4'>
          {messages.map((msg, index) => {
            // Determine if message is from user (even indices) or bot (odd indices)
            // This assumes conversation starts with bot, then alternates
            const isUser = index % 2 === 1 || msg.isUser === true;

            return (
              <div
                key={`${msg.order}-${index}`}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-3xl rounded-lg px-4 py-3 ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                  }`}>
                  <p className='text-sm whitespace-pre-wrap'>{msg.message}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className='bg-white border-t border-gray-200 shadow-lg'>
        <div className='max-w-4xl mx-auto px-4 py-4'>
          {error && (
            <div className='mb-3 p-3 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-800 text-sm'>{error}</p>
            </div>
          )}

          <form onSubmit={handleSendMessage} className='flex gap-2'>
            <input
              type='text'
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sending}
              placeholder='Type your response...'
              className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
            />
            <button
              type='submit'
              disabled={sending || !inputMessage.trim()}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                sending || !inputMessage.trim()
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>

          <button
            onClick={handleEndChat}
            className='mt-4 w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
            End Chat
          </button>
        </div>
      </div>
    </div>
  );
};
