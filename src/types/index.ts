export interface User {
  id: string;
  username: string;
  joinedAt: Date;
}

export interface Message {
  id: string;
  from: string;
  to?: string;
  groupId?: string;
  content: string;
  timestamp: Date;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  members: string[];
  messages: Message[];
}

export interface ChatState {
  activeChat: {
    type: 'private' | 'group' | null;
    id: string | null;
  };
  users: User[];
  groups: Group[];
  privateMessages: Record<string, Message[]>;
  groupMessages: Record<string, Message[]>;
  typingUsers: Record<string, boolean>;
  groupTypingUsers: Record<string, Record<string, boolean>>;
}

export interface AppStore extends ChatState {
  currentUser: User | null;
  isConnected: boolean;
  isDarkMode: boolean;
  setCurrentUser: (user: User) => void;
  setUsers: (users: User[]) => void;
  setGroups: (groups: Group[]) => void;
  setActiveChat: (type: 'private' | 'group' | null, id: string | null) => void;
  addPrivateMessage: (message: Message) => void;
  setPrivateMessageHistory: (withId: string, messages: Message[]) => void;
  addGroupMessage: (message: Message) => void;
  setGroupMessageHistory: (groupId: string, messages: Message[]) => void;
  setTypingStatus: (userId: string, isTyping: boolean) => void;
  setGroupTypingStatus: (groupId: string, userId: string, isTyping: boolean) => void;
  setConnected: (connected: boolean) => void;
  toggleDarkMode: () => void;
}