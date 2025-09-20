const Image = require('../models/Image');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

class ImageService {
  // Subir nueva imagen
  async uploadImage(imageData, file, userId) {
    const { title, description, tags, isPublic = true } = imageData;

    // Crear URLs para servir las imágenes
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;
    const thumbnailUrl = `${baseUrl}/uploads/${file.thumbnailFilename}`;

    // Procesar tags
    let processTags = [];
    if (tags) {
      processTags = tags.split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
        .slice(0, 10); // Máximo 10 tags
    }

    // Crear imagen en la base de datos
    const image = new Image({
      title: title || path.parse(file.originalname).name,
      description: description || '',
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      width: file.width,
      height: file.height,
      url: imageUrl,
      thumbnailUrl: thumbnailUrl,
      uploader: userId,
      isPublic: isPublic,
      tags: processTags
    });

    await image.save();

    // Actualizar contador del usuario
    await User.findByIdAndUpdate(userId, {
      $inc: { totalUploads: 1 }
    });

    return await this.getImageById(image._id, userId);
  }

  // Obtener imagen por ID
  async getImageById(imageId, userId = null, incrementViews = false) {
    const image = await Image.findById(imageId)
      .populate('uploader', 'username avatar')
      .populate('comments.user', 'username avatar');

    if (!image || !image.isActive) {
      throw new Error('Image not found');
    }

    // Verificar permisos de acceso
    if (!image.isPublic && (!userId || image.uploader._id.toString() !== userId.toString())) {
      throw new Error('Access denied to private image');
    }

    // Incrementar vistas si se solicita
    if (incrementViews) {
      await image.incrementViews();
    }

    return image;
  }

  // Obtener imágenes públicas (feed principal)
  async getPublicImages(page = 1, limit = 20, sortBy = 'recent') {
    const skip = (page - 1) * limit;
    let sortOption = { createdAt: -1 }; // Por defecto, más recientes

    switch (sortBy) {
      case 'popular':
        sortOption = { views: -1, likes: -1 };
        break;
      case 'likes':
        sortOption = { likes: -1, createdAt: -1 };
        break;
      case 'views':
        sortOption = { views: -1, createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const images = await Image.find({
      isPublic: true,
      isActive: true
    })
    .populate('uploader', 'username avatar')
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

    const total = await Image.countDocuments({
      isPublic: true,
      isActive: true
    });

    return {
      images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Obtener imágenes de un usuario
  async getUserImages(userId, currentUserId = null, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const isOwner = currentUserId && userId === currentUserId.toString();

    // Si es el propietario, mostrar todas sus imágenes, sino solo las públicas
    const query = isOwner 
      ? { uploader: userId, isActive: true }
      : { uploader: userId, isActive: true, isPublic: true };

    const images = await Image.find(query)
      .populate('uploader', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Image.countDocuments(query);

    return {
      images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Buscar imágenes
  async searchImages(query, page = 1, limit = 20, tags = []) {
    const skip = (page - 1) * limit;
    
    let searchQuery = {
      isPublic: true,
      isActive: true
    };

    // Búsqueda por texto en título y descripción
    if (query) {
      searchQuery.$text = { $search: query };
    }

    // Filtrar por tags
    if (tags && tags.length > 0) {
      searchQuery.tags = { $in: tags };
    }

    const images = await Image.find(searchQuery)
      .populate('uploader', 'username avatar')
      .sort(query ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Image.countDocuments(searchQuery);

    return {
      images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Actualizar imagen
  async updateImage(imageId, updateData, userId) {
    const image = await Image.findById(imageId);

    if (!image || !image.isActive) {
      throw new Error('Image not found');
    }

    if (image.uploader.toString() !== userId.toString()) {
      throw new Error('Access denied. You can only edit your own images');
    }

    const allowedUpdates = ['title', 'description', 'tags', 'isPublic'];
    const updates = {};

    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'tags' && updateData[key]) {
          updates[key] = updateData[key].split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0)
            .slice(0, 10);
        } else {
          updates[key] = updateData[key];
        }
      }
    });

    const updatedImage = await Image.findByIdAndUpdate(
      imageId,
      updates,
      { new: true, runValidators: true }
    ).populate('uploader', 'username avatar');

    return updatedImage;
  }

  // Eliminar imagen
  async deleteImage(imageId, userId) {
    const image = await Image.findById(imageId);

    if (!image || !image.isActive) {
      throw new Error('Image not found');
    }

    if (image.uploader.toString() !== userId.toString()) {
      throw new Error('Access denied. You can only delete your own images');
    }

    // Soft delete - marcar como inactiva
    image.isActive = false;
    await image.save();

    // Eliminar archivos físicos
    try {
      const uploadsPath = path.join(__dirname, '../uploads');
      await fs.unlink(path.join(uploadsPath, image.filename));
      
      // Eliminar thumbnail si existe
      const thumbnailFilename = `thumb-${path.parse(image.filename).name}.jpg`;
      try {
        await fs.unlink(path.join(uploadsPath, thumbnailFilename));
      } catch {
        // Si no existe el thumbnail, continuar
      }
    } catch (error) {
      console.error('Error deleting image files:', error);
    }

    // Actualizar contador del usuario
    await User.findByIdAndUpdate(userId, {
      $inc: { totalUploads: -1 }
    });

    return { message: 'Image deleted successfully' };
  }

  // Toggle like en imagen
  async toggleLike(imageId, userId) {
    const image = await Image.findById(imageId);

    if (!image || !image.isActive || !image.isPublic) {
      throw new Error('Image not found');
    }

    await image.toggleLike(userId);
    
    return await this.getImageById(imageId, userId);
  }

  // Agregar comentario
  async addComment(imageId, commentText, userId) {
    const image = await Image.findById(imageId);

    if (!image || !image.isActive || !image.isPublic) {
      throw new Error('Image not found');
    }

    image.comments.push({
      user: userId,
      text: commentText,
      createdAt: new Date()
    });

    await image.save();
    
    return await this.getImageById(imageId, userId);
  }

  // Eliminar comentario
  async deleteComment(imageId, commentId, userId) {
    const image = await Image.findById(imageId);

    if (!image || !image.isActive) {
      throw new Error('Image not found');
    }

    const comment = image.comments.id(commentId);
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Solo el autor del comentario o el dueño de la imagen pueden eliminarlo
    if (comment.user.toString() !== userId.toString() && 
        image.uploader.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }

    image.comments.pull(commentId);
    await image.save();
    
    return await this.getImageById(imageId, userId);
  }

  // Obtener tags populares
  async getPopularTags(limit = 20) {
    const tags = await Image.aggregate([
      { $match: { isPublic: true, isActive: true } },
      { $unwind: '$tags' },
      { 
        $group: { 
          _id: '$tags', 
          count: { $sum: 1 } 
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    return tags.map(tag => ({
      name: tag._id,
      count: tag.count
    }));
  }

  // Obtener imágenes por tag
  async getImagesByTag(tagName, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const images = await Image.find({
      tags: tagName.toLowerCase(),
      isPublic: true,
      isActive: true
    })
    .populate('uploader', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Image.countDocuments({
      tags: tagName.toLowerCase(),
      isPublic: true,
      isActive: true
    });

    return {
      images,
      tag: tagName,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Obtener estadísticas generales
  async getStats() {
    const stats = await Image.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          publicImages: {
            $sum: { $cond: ['$isPublic', 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          totalComments: { $sum: { $size: '$comments' } }
        }
      }
    ]);

    const userCount = await User.countDocuments({ isActive: true });

    return {
      ...(stats[0] || {
        totalImages: 0,
        publicImages: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0
      }),
      totalUsers: userCount
    };
  }
}

module.exports = new ImageService();