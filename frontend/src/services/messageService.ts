import api from '../lib/api';

export interface Message {
  id: string;
  sender: {
    id: string;
    username: string;
    avatar: string;
  };
  receiver: {
    id: string;
    username: string;
    avatar: string;
  };
  text: string;
  read: boolean;
  timestamp: string;
}

export interface Conversation {
  user: {
    id: string;
    username: string;
    avatar: string;
    bio: string;
  };
  lastMessage: {
    id: string;
    text: string;
    timestamp: string;
    senderId: string;
    read: boolean;
  };
  unreadCount: number;
}

export const messageService = {
  async sendMessage(receiverUsername: string, text: string): Promise<Message> {
    const response = await api.post('/messages', {
      receiverUsername,
      text
    });
    
    const msg = response.data.data;
    return {
      id: msg._id,
      sender: {
        id: msg.sender._id,
        username: msg.sender.username,
        avatar: msg.sender.avatar
      },
      receiver: {
        id: msg.receiver._id,
        username: msg.receiver.username,
        avatar: msg.receiver.avatar
      },
      text: msg.text,
      read: msg.read,
      timestamp: msg.createdAt
    };
  },

  async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/messages/conversations');
    return response.data.data;
  },

  async getMessages(username: string): Promise<Message[]> {
    const response = await api.get(`/messages/${username}`);
    return response.data.data.map((msg: any) => ({
      id: msg._id,
      sender: {
        id: msg.sender._id,
        username: msg.sender.username,
        avatar: msg.sender.avatar
      },
      receiver: {
        id: msg.receiver._id,
        username: msg.receiver.username,
        avatar: msg.receiver.avatar
      },
      text: msg.text,
      read: msg.read,
      timestamp: msg.createdAt
    }));
  },

  async markAsRead(username: string): Promise<void> {
    await api.put(`/messages/${username}/read`);
  },

  async deleteConversation(username: string): Promise<void> {
    await api.delete(`/messages/${username}`);
  }
};
