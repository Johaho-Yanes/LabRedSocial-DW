import Image from '../models/Image.js';
import User from '../models/User.js';
import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { USE_S3 } from '../middleware/upload.js';
import { 
  processAndUploadImage, 
  deleteFromS3,
  USE_S3 as S3_ENABLED 
} from '../config/s3.js';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// @desc    Obtener todas las imágenes
// @route   GET /api/images
// @access  Public
const getAllImages = async (req, res) => {
  try {
    const { search, tags, author, sort = '-createdAt', limit = 50, page = 1 } = req.query;

    // Construir query
    let query = {};

    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search };
    }

    // Filtrar por tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Filtrar por autor
    if (author) {
      query.author = author;
    }

    // Ejecutar query con paginación
    const skip = (page - 1) * limit;
    const images = await Image.find(query)
      .populate('author', 'username avatar bio')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    // Contar total de documentos
    const total = await Image.countDocuments(query);

    res.json({
      success: true,
      count: images.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: images
    });
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener una imagen por ID
// @route   GET /api/images/:id
// @access  Public
const getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('comments.user', 'username avatar');

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Subir nueva imagen
// @route   POST /api/images/upload
// @access  Private
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    const { title, description, tags } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'El título es requerido' 
      });
    }

    let imageUrl, thumbnailUrl, metadata;

    if (USE_S3) {
      // ========== MODO S3 (PRODUCCIÓN) ==========
      console.log('📤 Subiendo imagen a S3...');
      
      // Subir imagen original procesada a S3
      imageUrl = await processAndUploadImage(req.file, req.user._id.toString());
      
      // Procesar y subir thumbnail a S3
      const thumbnailBuffer = await sharp(req.file.buffer)
        .resize(400, 400, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      const { uploadToS3 } = await import('../config/s3.js');
      const thumbnailFilename = `thumb-${req.user._id}-${Date.now()}.jpg`;
      thumbnailUrl = await uploadToS3(thumbnailBuffer, thumbnailFilename, 'thumbnails');
      
      // Obtener metadata de la imagen
      metadata = await sharp(req.file.buffer).metadata();
      
      console.log('✅ Imagen subida a S3:', imageUrl);
      
    } else {
      // ========== MODO LOCAL (DESARROLLO) ==========
      console.log('💾 Guardando imagen localmente...');
      
      const uploadsDir = path.join(__dirname, '../../uploads');
      const filename = path.parse(req.file.filename).name;
      const ext = path.parse(req.file.filename).ext;

      // Crear thumbnail local
      const thumbnailFilename = `${filename}-thumb${ext}`;
      await sharp(req.file.path)
        .resize(400, 400, { fit: 'cover' })
        .toFile(path.join(uploadsDir, thumbnailFilename));

      // Obtener metadata
      metadata = await sharp(req.file.path).metadata();

      // URLs locales
      imageUrl = `/uploads/${req.file.filename}`;
      thumbnailUrl = `/uploads/${thumbnailFilename}`;
      
      console.log('✅ Imagen guardada localmente:', imageUrl);
    }

    // Parsear tags
    const tagsArray = tags ? 
      (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim().toLowerCase()) : tags) 
      : [];

    // Crear documento de imagen
    const image = await Image.create({
      title,
      description: description || '',
      url: imageUrl,
      thumbnail: thumbnailUrl,
      author: req.user._id,
      tags: tagsArray,
      transformations: {
        original: imageUrl,
        sepia: imageUrl, // En producción, generar transformación real
        bw: imageUrl,
        mirrored: imageUrl
      },
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: req.file.size || metadata.size
      }
    });

    // Poblar autor
    await image.populate('author', 'username avatar bio');

    res.status(201).json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar imagen
// @route   PUT /api/images/:id
// @access  Private
const updateImage = async (req, res) => {
  try {
    let image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Verificar que el usuario sea el propietario
    if (image.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para actualizar esta imagen'
      });
    }

    const { title, description, tags } = req.body;

    image.title = title || image.title;
    image.description = description !== undefined ? description : image.description;
    
    if (tags) {
      image.tags = typeof tags === 'string' ? 
        tags.split(',').map(tag => tag.trim().toLowerCase()) : 
        tags;
    }

    await image.save();
    await image.populate('author', 'username avatar bio');

    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error al actualizar imagen:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar imagen
// @route   DELETE /api/images/:id
// @access  Private
const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Verificar que el usuario sea el propietario
    if (image.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar esta imagen'
      });
    }

    // Eliminar archivos (S3 o local)
    try {
      if (USE_S3) {
        // ========== MODO S3 ==========
        console.log('🗑️  Eliminando de S3:', image.url);
        
        // Eliminar imagen principal
        await deleteFromS3(image.url);
        
        // Eliminar thumbnail si existe
        if (image.thumbnail) {
          await deleteFromS3(image.thumbnail);
        }
        
        console.log('✅ Archivos eliminados de S3');
        
      } else {
        // ========== MODO LOCAL ==========
        const uploadsDir = path.join(__dirname, '../../uploads');
        const imagePath = path.join(uploadsDir, path.basename(image.url));
        const thumbnailPath = path.join(uploadsDir, path.basename(image.thumbnail));

        await fs.unlink(imagePath);
        await fs.unlink(thumbnailPath);
        
        console.log('✅ Archivos eliminados localmente');
      }
    } catch (fileError) {
      console.error('Error al eliminar archivos:', fileError);
      // No detenemos el proceso si falla la eliminación de archivos
    }

    // Eliminar de favoritos de todos los usuarios
    await User.updateMany(
      { favorites: req.params.id },
      { $pull: { favorites: req.params.id } }
    );

    // Eliminar documento
    await image.deleteOne();

    res.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Dar/quitar like a una imagen
// @route   POST /api/images/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    const userId = req.user._id;
    const hasLiked = image.likes.includes(userId);

    if (hasLiked) {
      // Quitar like
      image.likes = image.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Agregar like
      image.likes.push(userId);
    }

    await image.save();
    await image.populate('author', 'username avatar bio');

    res.json({
      success: true,
      data: image,
      liked: !hasLiked
    });
  } catch (error) {
    console.error('Error al dar like:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Agregar comentario a una imagen
// @route   POST /api/images/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El comentario no puede estar vacío'
      });
    }

    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    image.comments.push({
      user: req.user._id,
      text: text.trim()
    });

    await image.save();
    await image.populate('author', 'username avatar bio');
    await image.populate('comments.user', 'username avatar');

    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle upvote en una imagen
const toggleUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    const hasUpvoted = image.upvotes.includes(userId);
    
    if (hasUpvoted) {
      // Remover upvote
      image.upvotes = image.upvotes.filter(id => !id.equals(userId));
    } else {
      // Agregar upvote y remover downvote si existe
      image.upvotes.push(userId);
      image.downvotes = image.downvotes.filter(id => !id.equals(userId));
    }

    await image.save();

    res.json({
      success: true,
      hasUpvoted: !hasUpvoted,
      upvotes: image.upvotes.length,
      downvotes: image.downvotes.length
    });
  } catch (error) {
    console.error('Error al toggle upvote:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle downvote en una imagen
const toggleDownvote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    const hasDownvoted = image.downvotes.includes(userId);
    
    if (hasDownvoted) {
      // Remover downvote
      image.downvotes = image.downvotes.filter(id => !id.equals(userId));
    } else {
      // Agregar downvote y remover upvote si existe
      image.downvotes.push(userId);
      image.upvotes = image.upvotes.filter(id => !id.equals(userId));
    }

    await image.save();

    res.json({
      success: true,
      hasDownvoted: !hasDownvoted,
      upvotes: image.upvotes.length,
      downvotes: image.downvotes.length
    });
  } catch (error) {
    console.error('Error al toggle downvote:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export {
  getAllImages,
  getImageById,
  uploadImage,
  updateImage,
  deleteImage,
  toggleLike,
  addComment,
  toggleUpvote,
  toggleDownvote
};