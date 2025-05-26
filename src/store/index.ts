import { create } from 'zustand';
import { AppStore, Message } from '../types';
import socketService from '../utils/socket';

// Helper to get conversation ID between two users
const getConversationId = (id1: string, id2: string): string => {
  return [id1, id2].sort().join('-');
};

export const useStore = create<AppStore>((set, get) => ({
  currentUser: null,
  isConnected: false,
  isDarkMode: localStorage.getItem('darkMode') === 'true',
  activeChat: {
    type: null,
    id: null
  },
  users: [],
  groups: [],
  privateMessages: {},
  groupMessages: {},
  typingUsers: {},
  groupTypingUsers: {},

  setCurrentUser: (user) => set({ currentUser: user }),
  
  setUsers: (users) => set({ users }),
  
  setGroups: (groups) => set({ groups }),
  
  setActiveChat: (type, id) => set({ 
    activeChat: { type, id } 
  }),
  
  addPrivateMessage: (message) => { 
    const { currentUser, privateMessages } = get();
    if (!currentUser) return;
    
    const otherUserId = message.from === currentUser.id ? message.to! : message.from;
    const conversationId = getConversationId(currentUser.id, otherUserId);
    
    set({
      privateMessages: {
        ...privateMessages,
        [conversationId]: [...(privateMessages[conversationId] || []), message]
      }
    });
  },
  
  setPrivateMessageHistory: (withId, messages) => {
    const { currentUser, privateMessages } = get();
    if (!currentUser) return;
    
    const conversationId = getConversationId(currentUser.id, withId);
    
    set({
      privateMessages: {
        ...privateMessages,
        [conversationId]: messages
      }
    });
  },
  
  addGroupMessage: (message) => {
    const { groupMessages } = get();
    const groupId = message.groupId!;
    
    set({
      groupMessages: {
        ...groupMessages,
        [groupId]: [...(groupMessages[groupId] || []), message]
      }
    });
  },
  
  setGroupMessageHistory: (groupId, messages) => {
    const { groupMessages } = get();
    
    set({
      groupMessages: {
        ...groupMessages,
        [groupId]: messages
      }
    });
  },
  
  setTypingStatus: (userId, isTyping) => {
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping
      }
    }));
  },
  
  setGroupTypingStatus: (groupId, userId, isTyping) => {
    set(state => ({
      groupTypingUsers: {
        ...state.groupTypingUsers,
        [groupId]: {
          ...(state.groupTypingUsers[groupId] || {}),
          [userId]: isTyping
        }
      }
    }));
  },
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  toggleDarkMode: () => {
    const newDarkMode = !get().isDarkMode;
    localStorage.setItem('darkMode', String(newDarkMode));
    set({ isDarkMode: newDarkMode });
  }
}));

let isInitialized = false;

export const initializeStore = () => {
  if (isInitialized) return;
  isInitialized = true;

  const store = useStore.getState();

  socketService.onConnectionChange((connected) => {
    store.setConnected(connected);
  });

  socketService.onUserList((users) => {
    store.setUsers(users);
  });

  socketService.onGroupList((groups) => {
    store.setGroups(groups);
  });

  socketService.onPrivateMessage((message) => {
    store.addPrivateMessage(message);
  });

  socketService.onGroupMessage((message) => {
    store.addGroupMessage(message);
  });

  socketService.onPrivateHistory(({ withId, messages }) => {
    store.setPrivateMessageHistory(withId, messages);
  });

  socketService.onGroupHistory(({ groupId, messages }) => {
    store.setGroupMessageHistory(groupId, messages);
  });

  socketService.onTypingStatus(({ from, isTyping }) => {
    store.setTypingStatus(from, isTyping);
  });

  socketService.onGroupTypingStatus(({ groupId, from, isTyping }) => {
    store.setGroupTypingStatus(groupId, from, isTyping);
  });
};
