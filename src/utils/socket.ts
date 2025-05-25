import { io, Socket } from 'socket.io-client';
import { Message, User, Group } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private messageListeners: ((message: Message) => void)[] = [];
  private userListeners: ((users: User[]) => void)[] = [];
  private groupListeners: ((groups: Group[]) => void)[] = [];
  private privateHistoryListeners: ((data: { withId: string, messages: Message[] }) => void)[] = [];
  private groupHistoryListeners: ((data: { groupId: string, messages: Message[] }) => void)[] = [];
  private typingListeners: ((data: { from: string, isTyping: boolean }) => void)[] = [];
  private groupTypingListeners: ((data: { groupId: string, from: string, isTyping: boolean }) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private groupMessageListeners: ((message: Message) => void)[] = [];

  async connect(callback) {
    if (this.socket) return;
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    this.socket =   io(socketUrl);
     
    this.socket.on('connect', () => {
      callback?.(this.socket)
      console.log('Connected to server');
      this.connectionListeners.forEach(listener => listener(true));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.connectionListeners.forEach(listener => listener(false));
    });

    this.socket.on('private-message', (message: Message) => {
      this.messageListeners.forEach(listener => listener(message));
    });

    this.socket.on('user-list', (users: User[]) => {
      this.userListeners.forEach(listener => listener(users));
    });

    this.socket.on('group-list', (groups: Group[]) => {
      this.groupListeners.forEach(listener => listener(groups));
    });

    this.socket.on('group-message', (message: Message) => {
      this.groupMessageListeners.forEach(listener => listener(message));
    });

    this.socket.on('private-history', (data: { withId: string, messages: Message[] }) => {
      this.privateHistoryListeners.forEach(listener => listener(data));
    });

    this.socket.on('group-history', (data: { groupId: string, messages: Message[] }) => {
      this.groupHistoryListeners.forEach(listener => listener(data));
    });

    this.socket.on('user-typing', (data: { from: string, isTyping: boolean }) => {
      this.typingListeners.forEach(listener => listener(data));
    });

    this.socket.on('user-group-typing', (data: { groupId: string, from: string, isTyping: boolean }) => {
      this.groupTypingListeners.forEach(listener => listener(data));
    });
  }

  registerUser(username: string) {
    if (!this.socket) return;
    this.socket.emit('register', { username });
  }

  sendPrivateMessage(to: string, content: string) {
    if (!this.socket) return;
    this.socket.emit('private-message', { to, content });
  }

  createGroup(name: string, members: string[]) {
    if (!this.socket) return;
    this.socket.emit('create-group', { name, members });
  }

  sendGroupMessage(groupId: string, content: string) {
    if (!this.socket) return;
    this.socket.emit('group-message', { groupId, content });
  }

  getPrivateMessageHistory(withId: string) {
    if (!this.socket) return;
    this.socket.emit('get-private-history', { with: withId });
  }

  getGroupMessageHistory(groupId: string) {
    if (!this.socket) return;
    this.socket.emit('get-group-history', { groupId });
  }

  sendTypingStatus(to: string, isTyping: boolean) {
    if (!this.socket) return;
    this.socket.emit('typing', { to, isTyping });
  }

  sendGroupTypingStatus(groupId: string, isTyping: boolean) {
    if (!this.socket) return;
    this.socket.emit('group-typing', { groupId, isTyping });
  }

  onPrivateMessage(listener: (message: Message) => void) {
    this.messageListeners.push(listener); 
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  onGroupMessage(listener: (message: Message) => void) {
    this.groupMessageListeners.push(listener);
    return () => {
      this.groupMessageListeners = this.groupMessageListeners.filter(l => l !== listener);
    };
  }

  onUserList(listener: (users: User[]) => void) {
    this.userListeners.push(listener);
    return () => {
      this.userListeners = this.userListeners.filter(l => l !== listener);
    };
  }

  onGroupList(listener: (groups: Group[]) => void) {
    this.groupListeners.push(listener);
    return () => {
      this.groupListeners = this.groupListeners.filter(l => l !== listener);
    };
  }

  onPrivateHistory(listener: (data: { withId: string, messages: Message[] }) => void) {
    this.privateHistoryListeners.push(listener);
    return () => {
      this.privateHistoryListeners = this.privateHistoryListeners.filter(l => l !== listener);
    };
  }

  onGroupHistory(listener: (data: { groupId: string, messages: Message[] }) => void) {
    this.groupHistoryListeners.push(listener);
    return () => {
      this.groupHistoryListeners = this.groupHistoryListeners.filter(l => l !== listener);
    };
  }

  onTypingStatus(listener: (data: { from: string, isTyping: boolean }) => void) {
    this.typingListeners.push(listener);
    return () => {
      this.typingListeners = this.typingListeners.filter(l => l !== listener);
    };
  }

  onGroupTypingStatus(listener: (data: { groupId: string, from: string, isTyping: boolean }) => void) {
    this.groupTypingListeners.push(listener);
    return () => {
      this.groupTypingListeners = this.groupTypingListeners.filter(l => l !== listener);
    };
  }

  onConnectionChange(listener: (connected: boolean) => void) {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
    };
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  getId() {
    return this.socket?.id;
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;