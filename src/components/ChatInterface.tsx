import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import Sidebar from './Sidebar';
import ChatContainer from './ChatContainer';
import { initializeStore } from '../store';

const ChatInterface: React.FC = () => {
  const isDarkMode = useStore(state => state.isDarkMode);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Initialize store with socket listeners
  useEffect(() => {
    initializeStore();
  }, []);
  
  return (
    <div className={`h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Mobile sidebar with slide-over */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${
          showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setShowSidebar(false)}
      />
      
      <div 
        className={`fixed md:relative w-80 h-full z-50 transform transition-transform md:transform-none ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onCloseMobile={() => setShowSidebar(false)} />
      </div>
      
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center p-4 bg-indigo-600 text-white">
          <button
            onClick={() => setShowSidebar(true)}
            className="p-2 hover:bg-indigo-700 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-4 text-lg font-semibold">LAN Chat</h1>
        </div>
        
        <div className="flex-1">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;