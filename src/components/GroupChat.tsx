import React, { useState, useRef, useEffect } from 'react';
import { Send, Users } from 'lucide-react';
import { useStore } from '../store';
import UserAvatar from './UserAvatar';
import socketService from '../utils/socket';

interface GroupChatProps {
  groupId: string;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentUser = useStore(state => state.currentUser);
  const users = useStore(state => state.users);
  const groups = useStore(state => state.groups);
  const groupMessages = useStore(state => state.groupMessages);
  const groupTypingUsers = useStore(state => state.groupTypingUsers);
  const isDarkMode = useStore(state => state.isDarkMode);
  
  const group = groups.find(g => g.id === groupId);
  const messages = groupMessages[groupId] || [];
  
  // Get typing users in this group
  const typingUsersInGroup = groupTypingUsers[groupId] || {};
  const typingUsersList = Object.entries(typingUsersInGroup)
    .filter(([id, isTyping]) => id !== currentUser?.id && isTyping)
    .map(([id]) => id);
  
  const sendMessage = () => {
    if (!message.trim() || !currentUser) return;
    
    socketService.sendGroupMessage(groupId, message.trim());
    setMessage('');
    
    // Focus the input field after sending
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Handle typing indicator
  const handleTypingStatus = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.sendGroupTypingStatus(groupId, true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.sendGroupTypingStatus(groupId, false);
    }, 2000);
  };
  
  // Get group members info
  const getGroupMembersInfo = () => {
    if (!group) return [];
    
    return group.members
      .map(memberId => users.find(u => u.id === memberId))
      .filter(Boolean);
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Load chat history when component mounts
  useEffect(() => {
    socketService.getGroupMessageHistory(groupId);
    
    // Focus the input field
    messageInputRef.current?.focus();
    
    // Cleanup typing timeout
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socketService.sendGroupTypingStatus(groupId, false);
      }
    };
  }, [groupId]);
  
  return (
    <div className="flex-1 flex flex-col relative">
      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => {
              const isSentByMe = msg.from === currentUser?.id;
              const sender = users.find(u => u.id === msg.from);
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[75%] ${isSentByMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isSentByMe && (
                      <div className="flex-shrink-0 mr-2">
                        <UserAvatar username={sender?.username || ''} size="sm" />
                      </div>
                    )}
                    <div>
                      {!isSentByMe && (
                        <div className={`text-xs ml-1 mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {sender?.username}
                        </div>
                      )}
                      <div 
                        className={`px-4 py-2 rounded-2xl ${
                          isSentByMe 
                            ? isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white' 
                            : isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div 
                        className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${
                          isSentByMe ? 'text-right mr-1' : 'text-left ml-1'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {typingUsersList.length > 0 && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-2">
                  <UserAvatar 
                    username={
                      users.find(u => u.id === typingUsersList[0])?.username || ''
                    } 
                    size="sm" 
                  />
                </div>
                <div>
                  <div className={`text-xs ml-1 mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {typingUsersList.length === 1 
                      ? users.find(u => u.id === typingUsersList[0])?.username 
                      : `${typingUsersList.length} people`} typing...
                  </div>
                  <div className={`px-4 py-2 rounded-2xl inline-flex items-center ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  }`}>
                    <span className="typing-indicator">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Members panel (conditionally shown) */}
      {showMembers && (
        <div 
          className={`absolute top-0 right-0 h-full w-64 shadow-lg z-10 ${
            isDarkMode ? 'bg-gray-800 border-l border-gray-700' : 'bg-white border-l border-gray-200'
          }`}
        >
          <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Group Members</h3>
              <button 
                onClick={() => setShowMembers(false)}
                className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-2 overflow-y-auto max-h-full">
            {getGroupMembersInfo().map(member => (
              <div 
                key={member?.id} 
                className={`flex items-center p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <UserAvatar 
                  username={member?.username || ''} 
                  size="sm" 
                  showStatus 
                />
                <div className="ml-2 overflow-hidden">
                  <p className="truncate">{member?.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Message Input */}
      <div className={`p-3 ${isDarkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'}`}>
        <div className="flex items-center">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`p-2 rounded-full mr-2 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="View members"
          >
            <Users size={20} />
          </button>
          <input
            ref={messageInputRef}
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTypingStatus();
            }}
            onKeyDown={handleKeyDown}
            className={`flex-1 px-4 py-2 rounded-full ${
              isDarkMode 
                ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-300'
            } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className={`ml-2 p-2 rounded-full ${
              message.trim() 
                ? 'bg-indigo-500 text-white' 
                : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
      
      {/* CSS for typing indicator */}
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default GroupChat;