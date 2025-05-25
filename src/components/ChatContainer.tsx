import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useStore } from '../store';
import PrivateChat from './PrivateChat';
import GroupChat from './GroupChat';

const ChatContainer: React.FC = () => {
  const activeChat = useStore(state => state.activeChat);
  const users = useStore(state => state.users);
  const groups = useStore(state => state.groups);
  const isDarkMode = useStore(state => state.isDarkMode);
  
  const getChatTitle = () => {
    if (!activeChat.id) return '';
    
    if (activeChat.type === 'private') {
      const user = users.find(u => u.id === activeChat.id);
      return user ? user.username : '';
    } else if (activeChat.type === 'group') {
      const group = groups.find(g => g.id === activeChat.id);
      return group ? group.name : '';
    }
    
    return '';
  };
  
  return (
    <div className={`w-full h-full flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {!activeChat.id ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className={`w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center justify-center mb-4`}>
            <MessageSquare size={32} className="text-indigo-500" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Select a chat to start messaging
          </h2>
          <p className={`text-center max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Choose a user from the sidebar to start a private conversation or select a group to chat with multiple users.
          </p>
        </div>
      ) : (
        <>
          <div className={`px-4 py-3 flex items-center border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h2 className="font-bold text-lg">{getChatTitle()}</h2>
          </div>
          
          {activeChat.type === 'private' && activeChat.id && (
            <PrivateChat userId={activeChat.id} />
          )}
          
          {activeChat.type === 'group' && activeChat.id && (
            <GroupChat groupId={activeChat.id} />
          )}
        </>
      )}
    </div>
  );
};

export default ChatContainer;