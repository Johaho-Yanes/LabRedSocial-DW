const imageService = require('../services/imageService');
const { validationResult } = require('express-validator');

class ImageController {
  // Subir nueva imagen
  async upload(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'No image file provided'
        });
      }

      const userId = req.user._id;
      const image = await imageService.uploadImage(req.body, req.file, userId);
      
      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: image
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        error: error.message || 'Upload failed'
      });
    }
  }

  // Obtener imagen por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      const incrementViews = req.query.view === 'true';
      
      const image = await imageService.getImageById(id, userId, incrementViews);
      
      res.json({
        success: true,
        data: image
      });
    } catch (error) {
      console.error('Get image error:', error);
      const statusCode = error.message.includes('not found') || 
                        error.message.includes('Access denied') ? 404 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to get image'
      });
    }
  }

  // Obtener feed de imágenes públicas
  async getPublicFeed(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        sort = 'recent' 
      } = req.query;
      
      const result = await imageService.getPublicImages(
        parseInt(page),
        parseInt(limit),
        sort
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get public feed error:', error);
      res.status(500).json({
        error: 'Failed to get images'
      });
    }
  }

  // Obtener imágenes de un usuario
  async getUserImages(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const currentUserId = req.user?._id;
      
      const result = await imageService.getUserImages(
        userId,
        currentUserId,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get user images error:', error);
      res.status(500).json({
        error: 'Failed to get user images'
      });
    }
  }

  // Buscar imágenes
  async search(req, res) {
    try {
      const { 
        q: query, 
        tags, 
        page = 1, 
        limit = 20 
      } = req.query;
      
      let tagArray = [];
      if (tags) {
        tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      }
      
      const result = await imageService.searchImages(
        query,
        parseInt(page),
        parseInt(limit),
        tagArray
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Search images error:', error);
      res.status(500).json({
        error: 'Search failed'
      });
    }
  }

  // Actualizar imagen
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const userId = req.user._id;
      
      const image = await imageService.updateImage(id, req.body, userId);
      
      res.json({
        success: true,
        message: 'Image updated successfully',
        data: image
      });
    } catch (error) {
      console.error('Update image error:', error);
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('Access denied') ? 403 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to update image'
      });
    }
  }

  // Eliminar imagen
  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const result = await imageService.deleteImage(id, userId);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Delete image error:', error);
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('Access denied') ? 403 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to delete image'
      });
    }
  }

  // Toggle like
  async toggleLike(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const image = await imageService.toggleLike(id, userId);
      
      res.json({
        success: true,
        message: 'Like toggled successfully',
        data: image
      });
    } catch (error) {
      console.error('Toggle like error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to toggle like'
      });
    }
  }

  // Agregar comentario
  async addComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { text } = req.body;
      const userId = req.user._id;
      
      const image = await imageService.addComment(id, text, userId);
      
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: image
      });
    } catch (error) {
      console.error('Add comment error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to add comment'
      });
    }
  }

  // Eliminar comentario
  async deleteComment(req, res) {
    try {
      const { id, commentId } = req.params;
      const userId = req.user._id;
      
      const image = await imageService.deleteComment(id, commentId, userId);
      
      res.json({
        success: true,
        message: 'Comment deleted successfully',
        data: image
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('Access denied') ? 403 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to delete comment'
      });
    }
  }

  // Obtener tags populares
  async getPopularTags(req, res) {
    try {
      const { limit = 20 } = req.query;
      
      const tags = await imageService.getPopularTags(parseInt(limit));
      
      res.json({
        success: true,
        data: tags
      });
    } catch (error) {
      console.error('Get popular tags error:', error);
      res.status(500).json({
        error: 'Failed to get popular tags'
      });
    }
  }

  // Obtener imágenes por tag
  async getByTag(req, res) {
    try {
      const { tag } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await imageService.getImagesByTag(
        tag,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get images by tag error:', error);
      res.status(500).json({
        error: 'Failed to get images by tag'
      });
    }
  }

  // Obtener estadísticas generales
  async getStats(req, res) {
    try {
      const stats = await imageService.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        error: 'Failed to get statistics'
      });
    }
  }

  // Obtener mis imágenes (usuario actual)
  async getMyImages(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user._id;
      
      const result = await imageService.getUserImages(
        userId,
        userId,
        parseInt(page),
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get my images error:', error);
      res.status(500).json({
        error: 'Failed to get your images'
      });
    }
  }

  // Cambiar privacidad de imagen
  async togglePrivacy(req, res) {
    try {
      const { id } = req.params;
      const { isPublic } = req.body;
      const userId = req.user._id;
      
      const image = await imageService.updateImage(id, { isPublic }, userId);
      
      res.json({
        success: true,
        message: `Image is now ${isPublic ? 'public' : 'private'}`,
        data: image
      });
    } catch (error) {
      console.error('Toggle privacy error:', error);
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('Access denied') ? 403 : 500;
      res.status(statusCode).json({
        error: error.message || 'Failed to update privacy'
      });
    }
  }
}

module.exports = new ImageController();