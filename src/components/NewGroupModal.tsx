import React, { useState } from 'react';
import { X, Check, UserPlus } from 'lucide-react';
import { useStore } from '../store';
import UserAvatar from './UserAvatar';
import socketService from '../utils/socket';

interface NewGroupModalProps {
  onClose: () => void;
}

const NewGroupModal: React.FC<NewGroupModalProps> = ({ onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [error, setError] = useState('');
  const currentUser = useStore(state => state.currentUser);
  const users = useStore(state => state.users);
  const isDarkMode = useStore(state => state.isDarkMode);
  
  // Filter out current user
  const otherUsers = users.filter(user => user.id !== currentUser?.id);
  
  const handleUserSelect = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }
    
    socketService.createGroup(groupName, selectedUsers);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className={`w-full max-w-md rounded-lg shadow-xl overflow-hidden ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between ${isDarkMode ? 'bg-gray-900' : 'bg-indigo-500 text-white'}`}>
          <div className="flex items-center gap-2">
            <UserPlus size={20} />
            <h2 className="font-bold">Create New Group</h2>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-indigo-400 hover:bg-indigo-600'}`}
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <label 
              htmlFor="groupName" 
              className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className={`block w-full px-3 py-2 rounded-md border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              placeholder="Enter group name"
            />
          </div>
          
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Members
            </label>
            <div className={`max-h-60 overflow-y-auto rounded-md border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
              {otherUsers.length > 0 ? (
                otherUsers.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => handleUserSelect(user.id)}
                    className={`flex items-center p-3 border-b last:border-b-0 cursor-pointer ${
                      isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <UserAvatar username={user.username} showStatus />
                    <span className="ml-3 flex-1">{user.username}</span>
                    <div 
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        selectedUsers.includes(user.id)
                          ? 'bg-green-500 text-white'
                          : isDarkMode ? 'border border-gray-500' : 'border border-gray-400'
                      }`}
                    >
                      {selectedUsers.includes(user.id) && <Check size={14} />}
                    </div>
                  </div>
                ))
              ) : (
                <p className={`p-3 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No other users online
                </p>
              )}
            </div>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDarkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={otherUsers.length === 0}
            >
              Create Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;