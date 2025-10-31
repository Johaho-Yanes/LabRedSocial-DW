import api from '../lib/api';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

export interface FollowingUser {
  id: string;
  username: string;
  avatar: string;
  bio: string;
}

export const userService = {
  async getAllUsers(): Promise<FollowingUser[]> {
    const response = await api.get('/users');
    return response.data.data.map((user: any) => ({
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio
    }));
  },

  async getUserByUsername(username: string): Promise<UserProfile> {
    const response = await api.get(`/users/${username}`);
    const user = response.data.data;
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      followers: user.followers || [],
      following: user.following || [],
      createdAt: user.createdAt
    };
  },

  async updateProfile(data: { bio?: string; avatar?: string }): Promise<UserProfile> {
    const response = await api.put('/users/profile', data);
    const user = response.data.data;
    
    // Actualizar localStorage con los nuevos datos
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      followers: user.followers || [],
      following: user.following || [],
      createdAt: user.createdAt
    };
  },

  async followUser(username: string): Promise<void> {
    await api.post(`/users/${username}/follow`);
  },

  async unfollowUser(username: string): Promise<void> {
    await api.delete(`/users/${username}/follow`);
  },

  async getFollowing(): Promise<FollowingUser[]> {
    const response = await api.get('/users/following');
    return response.data.data.map((user: any) => ({
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio
    }));
  },

  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Actualizar localStorage con el nuevo avatar
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, avatar: response.data.data.avatar };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return response.data.data.avatar;
  },

  async toggleFavorite(imageId: string): Promise<{ success: boolean; isFavorite: boolean; favorites: string[] }> {
    const response = await api.post(`/users/favorites/${imageId}`);
    return response.data;
  },

  async getFavorites(): Promise<any[]> {
    const response = await api.get('/users/favorites');
    return response.data.data;
  }
};
