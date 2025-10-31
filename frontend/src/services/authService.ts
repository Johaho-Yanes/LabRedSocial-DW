import api from '../lib/api';

export interface UserData {
  username: string;
  email?: string;
  bio: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  bio?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    id: string;
    username: string;
    email: string;
    bio: string;
    avatar: string;
    token: string;
  };
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/users/register', data);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/users/login', credentials);
    if (response.data.success) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): UserData | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
};
