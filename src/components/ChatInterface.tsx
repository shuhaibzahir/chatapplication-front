import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import Sidebar from './Sidebar';
import ChatContainer from './ChatContainer';
import { initializeStore } from '../store';

const ChatInterface: React.FC = () => {
  const isDarkMode = useStore(state => state.isDarkMode);
 
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Open chat in full screen on mobile
  const handleChatSelect = () => {
 
    if (window.innerWidth < 768) {
      setIsMobileChatOpen(true);
    }
  };

  // Optional: Close chat on resize (e.g., returning to desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileChatOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize store with socket listeners
  useEffect(() => {
    initializeStore();
  }, []);
  
  return (
    <div className={`h-screen flex flex-col md:flex-row ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <div
        className={`w-full md:w-80 md:min-w-80 md:border-r md:border-gray-200 h-full overflow-y-auto
        ${isMobileChatOpen ? 'hidden md:block' : 'block'}`}
      >
        <Sidebar onChatSelect={handleChatSelect} />
      </div>

      {/* Chat Container */}
      <div
        className={`w-full md:flex-1 h-full overflow-y-auto 
        ${isMobileChatOpen || window.innerWidth >= 768 ? 'block' : 'hidden'} md:block`}
      >
        {/* Back button for mobile */}
        {isMobileChatOpen && (
          <div className="md:hidden p-3">
            <button
              onClick={() => setIsMobileChatOpen(false)}
              className="text-indigo-600 text-sm underline"
            >
              ← Back to chats
            </button>
          </div>
        )}
        <ChatContainer/>
      </div>
    </div>
  );
};

export default ChatInterface;