import api from '../lib/api';
import type { ImageData } from '../types';

// URL base del backend para archivos estáticos
const BACKEND_URL = 'http://localhost:5000';

// Función para convertir URLs relativas a absolutas
const getFullImageUrl = (relativeUrl: string): string => {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http')) return relativeUrl;
  return `${BACKEND_URL}${relativeUrl}`;
};

export const imageService = {
  async getAllImages(): Promise<ImageData[]> {
    const response = await api.get('/images');
    return response.data.data.map((img: any) => ({
      ...img,
      id: img._id,
      url: getFullImageUrl(img.url),
      thumbnail: getFullImageUrl(img.thumbnail),
      author: {
        name: img.author.username,
        username: `@${img.author.username}`,
        avatar: img.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${img.author.username}`
      },
      likes: img.likes || [],
      upvotes: img.upvotes || [],
      downvotes: img.downvotes || [],
      timestamp: formatTimestamp(img.createdAt),
      createdAt: img.createdAt,
      transformations: {
        original: getFullImageUrl(img.url),
        sepia: getFullImageUrl(img.url),
        bw: getFullImageUrl(img.url),
        mirrored: getFullImageUrl(img.url)
      }
    }));
  },

  async getImageById(id: string): Promise<ImageData> {
    const response = await api.get(`/images/${id}`);
    const img = response.data.data;
    return {
      ...img,
      id: img._id,
      url: getFullImageUrl(img.url),
      thumbnail: getFullImageUrl(img.thumbnail),
      author: {
        name: img.author.username,
        username: `@${img.author.username}`,
        avatar: img.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${img.author.username}`
      },
      likes: img.likes || [],
      upvotes: img.upvotes || [],
      downvotes: img.downvotes || [],
      timestamp: formatTimestamp(img.createdAt),
      createdAt: img.createdAt,
      transformations: {
        original: getFullImageUrl(img.url),
        sepia: getFullImageUrl(img.url),
        bw: getFullImageUrl(img.url),
        mirrored: getFullImageUrl(img.url)
      }
    };
  },

  async uploadImage(formData: FormData): Promise<ImageData> {
    const response = await api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const img = response.data.data;
    return {
      ...img,
      id: img._id,
      url: getFullImageUrl(img.url),
      thumbnail: getFullImageUrl(img.thumbnail),
      author: {
        name: img.author.username,
        username: `@${img.author.username}`,
        avatar: img.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${img.author.username}`
      },
      likes: img.likes || [],
      upvotes: img.upvotes || [],
      downvotes: img.downvotes || [],
      timestamp: 'justo ahora',
      createdAt: img.createdAt || new Date().toISOString(),
      transformations: {
        original: getFullImageUrl(img.url),
        sepia: getFullImageUrl(img.url),
        bw: getFullImageUrl(img.url),
        mirrored: getFullImageUrl(img.url)
      }
    };
  },

  async toggleLike(imageId: string): Promise<void> {
    await api.post(`/images/${imageId}/like`);
  },

  async toggleUpvote(imageId: string): Promise<{ success: boolean; hasUpvoted: boolean; upvotes: number; downvotes: number }> {
    const response = await api.post(`/images/${imageId}/upvote`);
    return response.data;
  },

  async toggleDownvote(imageId: string): Promise<{ success: boolean; hasDownvoted: boolean; upvotes: number; downvotes: number }> {
    const response = await api.post(`/images/${imageId}/downvote`);
    return response.data;
  },

  async addComment(imageId: string, text: string): Promise<void> {
    await api.post(`/images/${imageId}/comment`, { text });
  },

  async deleteImage(imageId: string): Promise<void> {
    await api.delete(`/images/${imageId}`);
  }
};

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'justo ahora';
  if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  return `hace ${days} día${days > 1 ? 's' : ''}`;
}
