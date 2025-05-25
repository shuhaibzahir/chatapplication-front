import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useStore } from '../store';
import socketService from '../utils/socket';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const setCurrentUser = useStore(state => state.setCurrentUser);
  const isDarkMode = useStore(state => state.isDarkMode);
  const toggleDarkMode = useStore(state => state.toggleDarkMode);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    setIsJoining(true);
    setError('');
    
    try {
      // Connect to socket server
      socketService.connect((socket)=>{ 
              // Register user
      socketService.registerUser(username); 
      // Set current user in store
      setCurrentUser({
        id: socket.id,
        username,
        joinedAt: new Date()
      });
      });
      

    } catch (err) {
      console.error('Failed to connect:', err);
      setError('Failed to connect to chat server. Please try again.');
      setIsJoining(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl overflow-hidden`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-indigo-500" />
              <h1 className="text-2xl font-bold">LAN Chat</h1>
            </div>
            
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
          </div>
          
          <p className={`mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Connect with people on your local network. No accounts, no persistence - just chat!
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Choose a username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`block w-full px-4 py-3 rounded-md border ${isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                placeholder="Enter your username"
                autoComplete="off"
                disabled={isJoining}
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            
            <button
              type="submit"
              disabled={isJoining}
              className={`w-full py-3 px-4 rounded-md font-medium text-white ${
                isJoining 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              } transition-colors`}
            >
              {isJoining ? 'Joining...' : 'Join Chat'}
            </button>
          </form>
        </div>
        
        <div className={`px-6 py-4 ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-600'} text-sm`}>
          <p>All users must be on the same local network to connect.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;