import React from 'react';
import { generateAvatar } from '../utils/avatar';

interface UserAvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  isOnline?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  username, 
  size = 'md', 
  showStatus = false,
  isOnline = true
}) => {
  const { color, initials } = generateAvatar(username);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base'
  };
  
  return (
    <div className="relative inline-flex flex-shrink-0">
      <div 
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full text-white font-medium`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      
      {showStatus && (
        <span className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
          style={{
            width: size === 'lg' ? '14px' : size === 'md' ? '10px' : '8px',
            height: size === 'lg' ? '14px' : size === 'md' ? '10px' : '8px'
          }}
        />
      )}
    </div>
  );
};

export default UserAvatar;