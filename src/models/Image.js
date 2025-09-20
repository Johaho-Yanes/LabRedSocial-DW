const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  width: {
    type: Number
  },
  height: {
    type: Number
  },
  url: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
imageSchema.index({ uploader: 1, createdAt: -1 });
imageSchema.index({ isPublic: 1, createdAt: -1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ title: 'text', description: 'text' });

// Virtual para el número de comentarios
imageSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Middleware para incrementar vistas
imageSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Método para verificar si un usuario ya dio like
imageSchema.methods.isLikedBy = function(userId) {
  return this.likedBy.some(id => id.toString() === userId.toString());
};

// Método para agregar/quitar like
imageSchema.methods.toggleLike = async function(userId) {
  const isLiked = this.isLikedBy(userId);
  
  if (isLiked) {
    // Remover like
    this.likedBy = this.likedBy.filter(id => id.toString() !== userId.toString());
    this.likes = Math.max(0, this.likes - 1);
  } else {
    // Agregar like
    this.likedBy.push(userId);
    this.likes += 1;
  }
  
  return this.save();
};

module.exports = mongoose.model('Image', imageSchema);