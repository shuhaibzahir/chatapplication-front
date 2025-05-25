import React, { useEffect } from 'react';
import { useStore } from '../store';
import Sidebar from './Sidebar';
import ChatContainer from './ChatContainer';
import { initializeStore } from '../store';

const ChatInterface: React.FC = () => {
  const isDarkMode = useStore(state => state.isDarkMode);
  
  // Initialize store with socket listeners
  useEffect(() => {
    initializeStore();
  }, []);
  
  return (
    <div className={`h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="w-full h-full md:w-80 md:min-w-80 md:border-r md:border-gray-200">
        <Sidebar />
      </div>
      <div className="hidden md:block md:flex-1">
        <ChatContainer />
      </div>
    </div>
  );
};

export default ChatInterface;