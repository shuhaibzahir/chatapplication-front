import React, { useState } from 'react';
import { Users, UserPlus, Plus, MessageSquare, LogOut, Settings, Search } from 'lucide-react';
import { useStore } from '../store';
import UserAvatar from './UserAvatar';
import socketService from '../utils/socket';
import NewGroupModal from './NewGroupModal';

const Sidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const currentUser = useStore(state => state.currentUser);
  const users = useStore(state => state.users);
  const groups = useStore(state => state.groups);
  const activeChat = useStore(state => state.activeChat);
  const setActiveChat = useStore(state => state.setActiveChat);
  const isDarkMode = useStore(state => state.isDarkMode);
  const toggleDarkMode = useStore(state => state.toggleDarkMode);

  // Filter out current user from the list
  const otherUsers = users.filter(user => user.id !== currentUser?.id);
  
  const handleUserClick = (userId: string) => {
    // Prevent selecting self as chat partner
    if (userId === currentUser?.id) return;
    
    setActiveChat('private', userId);
    socketService.getPrivateMessageHistory(userId);
  };
  
  const handleGroupClick = (groupId: string) => {
    setActiveChat('group', groupId);
    socketService.getGroupMessageHistory(groupId);
  };
  
  const handleLogout = () => {
    socketService.disconnect();
    window.location.reload();
  };
  
  const filteredUsers = otherUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className={`w-full h-full flex flex-col ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
        {/* Sidebar Header */}
        <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-indigo-500 text-white'}`}>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            <h1 className="font-bold text-lg">LAN Chat</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-indigo-400 text-white'}`}
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
            <button 
              onClick={handleLogout}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-indigo-400 text-white'}`}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        
        {/* User Profile */}
        <div className={`p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-indigo-600 text-white'} flex items-center gap-3`}>
          <UserAvatar 
            username={currentUser?.username || ''} 
            size="md" 
            showStatus 
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{currentUser?.username}</p>
            <p className="text-xs opacity-80">Online</p>
          </div>
          <button className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-indigo-500 text-white'}`}>
            <Settings size={18} />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3">
          <div className={`flex items-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md px-3 py-2`}>
            <Search size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
            <input
              type="text"
              placeholder="Search users and groups..."
              className={`bg-transparent border-none w-full focus:outline-none ml-2 ${isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Tabs and Lists */}
        <div className="flex-1 overflow-y-auto">
          {/* Users */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                <h2 className="font-medium">Online Users</h2>
                <span className={`text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full px-2 py-0.5`}>
                  {filteredUsers.length}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      activeChat.type === 'private' && activeChat.id === user.id
                        ? isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'
                        : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <UserAvatar username={user.username} showStatus />
                    <div className="ml-3 flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {user.username}
                      </p>
                      <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Tap to chat
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className={`text-center py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchTerm ? 'No users found' : 'No other users online'}
                </p>
              )}
            </div>
          </div>
          
          {/* Groups */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                <h2 className="font-medium">Groups</h2>
                <span className={`text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full px-2 py-0.5`}>
                  {filteredGroups.length}
                </span>
              </div>
              <button 
                onClick={() => setShowNewGroupModal(true)}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-2">
              {filteredGroups.length > 0 ? (
                filteredGroups.map(group => (
                  <div 
                    key={group.id}
                    onClick={() => handleGroupClick(group.id)}
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      activeChat.type === 'group' && activeChat.id === group.id
                        ? isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'
                        : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: '#6366f1' }}
                    >
                      <UserPlus size={20} />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {group.name}
                      </p>
                      <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {group.members.length} members
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className={`text-center py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchTerm ? 'No groups found' : 'No groups created yet'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showNewGroupModal && (
        <NewGroupModal onClose={() => setShowNewGroupModal(false)} />
      )}
    </>
  );
};

export default Sidebar;