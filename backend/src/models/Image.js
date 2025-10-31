import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  url: {
    type: String,
    required: [true, 'La URL de la imagen es requerida']
  },
  thumbnail: {
    type: String,
    required: [true, 'El thumbnail es requerido']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El autor es requerido']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  transformations: {
    original: String,
    sepia: String,
    bw: String,
    mirrored: String
  },
  metadata: {
    width: Number,
    height: Number,
    format: String,
    size: Number
  }
}, {
  timestamps: true
});

// Índices para búsqueda optimizada
imageSchema.index({ title: 'text', description: 'text', tags: 'text' });
imageSchema.index({ author: 1, createdAt: -1 });
imageSchema.index({ createdAt: -1 });

// Método virtual para contar likes
imageSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Método virtual para contar upvotes
imageSchema.virtual('upvotesCount').get(function() {
  return this.upvotes.length;
});

// Método virtual para contar downvotes
imageSchema.virtual('downvotesCount').get(function() {
  return this.downvotes.length;
});

// Método virtual para contar comentarios
imageSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Incluir virtuals en JSON
imageSchema.set('toJSON', { virtuals: true });
imageSchema.set('toObject', { virtuals: true });

const Image = mongoose.model('Image', imageSchema);

export default Image;
