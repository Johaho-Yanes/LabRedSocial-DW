const express = require('express');
const { body } = require('express-validator');
const imageController = require('../controllers/imageController');

// Importar auth middleware
const authModule = require('../middleware/auth');
console.log('Auth module:', authModule);

// Extraer authenticate y crear optionalAuth si no existe
let { authenticate, optionalAuth } = authModule;

// Si optionalAuth no existe, crearla temporalmente
if (!optionalAuth) {
  console.log('optionalAuth not found, creating temporary version...');
  optionalAuth = async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        req.user = null;
        return next();
      }

      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.user.id).select('-password');

      req.user = user || null;
      next();
    } catch (error) {
      console.log('Token inválido en autenticación opcional:', error.message);
      req.user = null;
      next();
    }
  };
}

const { upload, processImage, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Validaciones
const uploadValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

const updateImageValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

const commentValidation = [
  body('text')
    .notEmpty()
    .withMessage('Comment text is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
];

// Feed principal y búsquedas
router.get('/', optionalAuth, imageController.getPublicFeed);
router.get('/search', optionalAuth, imageController.search);

// Tags
router.get('/tags/popular', optionalAuth, imageController.getPopularTags);
router.get('/tags/:tag', optionalAuth, imageController.getByTag);

// Estadísticas
router.get('/stats', optionalAuth, imageController.getStats);

// Rutas de usuario específico
router.get('/user/:userId', optionalAuth, imageController.getUserImages);

// RUTAS DE UPLOAD
router.post('/upload', 
  authenticate, 
  upload, 
  handleUploadError, 
  processImage, 
  uploadValidation, 
  imageController.upload
);

// Ruta GET para upload
router.get('/upload', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Upload endpoint - use POST method to upload images',
    allowedMethods: ['POST'],
    requiredAuth: true
  });
});

// Rutas que requieren autenticación
router.get('/my/images', authenticate, imageController.getMyImages);

// Imagen específica por ID
router.get('/:id', optionalAuth, imageController.getById);
router.put('/:id', authenticate, updateImageValidation, imageController.update);
router.delete('/:id', authenticate, imageController.delete);
router.patch('/:id/privacy', authenticate, [
  body('isPublic').isBoolean().withMessage('isPublic must be a boolean')
], imageController.togglePrivacy);
router.post('/:id/like', authenticate, imageController.toggleLike);

// Comentarios
router.post('/:id/comments', authenticate, commentValidation, imageController.addComment);
router.delete('/:id/comments/:commentId', authenticate, imageController.deleteComment);

module.exports = router;