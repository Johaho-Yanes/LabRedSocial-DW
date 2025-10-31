// Tipos compartidos de la aplicación

export interface UserData {
  id?: string;
  username: string;
  email?: string;
  bio: string;
  avatar?: string;
}

export interface ImageData {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  tags: string[];
  likes: string[]; // Array de IDs de usuarios que dieron like
  comments: Comment[]; // Array de comentarios
  upvotes: string[]; // Array de IDs de usuarios que dieron upvote
  downvotes: string[]; // Array de IDs de usuarios que dieron downvote
  timestamp: string;
  createdAt?: string; // Fecha ISO de creación desde MongoDB
  transformations: {
    original: string;
    sepia: string;
    bw: string;
    mirrored: string;
  };
  faceDetection?: {
    facesDetected: number;
    emotions?: string[];
  };
  rekognition?: {
    labels: string[];
    moderationLabels: string[];
  };
}

export interface Comment {
  user: {
    username: string;
    avatar: string;
  };
  text: string;
  createdAt: string;
}

export interface FollowingUser {
  id: string;
  username: string;
  avatar: string;
  bio: string;
}
