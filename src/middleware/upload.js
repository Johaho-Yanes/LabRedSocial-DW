const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    try {
      await fs.access(uploadPath);
    } catch {
      await fs.mkdir(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `image-${uniqueSuffix}${extension}`);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Middleware para procesar imagen después de la subida
const processImage = async (req, res, next) => {
  // Procesamiento automático de imágenes con sharp
  // Creación de thumbnails
  // Optimización de tamaño

  if (!req.file) {
    return next();
  }

  try {
    const inputPath = req.file.path;
    const filename = req.file.filename;
    const nameWithoutExt = path.parse(filename).name;
    
    // Procesar imagen principal (optimizar y redimensionar si es muy grande)
    const processedPath = path.join(path.dirname(inputPath), `processed-${filename}`);
    const thumbnailPath = path.join(path.dirname(inputPath), `thumb-${nameWithoutExt}.jpg`);

    // Obtener metadata de la imagen original
    const metadata = await sharp(inputPath).metadata();
    
    let processedImage = sharp(inputPath);

    // Redimensionar si es muy grande (máximo 2000px en cualquier lado)
    if (metadata.width > 2000 || metadata.height > 2000) {
      processedImage = processedImage.resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Optimizar y guardar imagen procesada
    await processedImage
      .jpeg({ quality: 85 })
      .toFile(processedPath);

    // Crear thumbnail (300x300)
    await sharp(inputPath)
      .resize(300, 300, {
        fit: 'cover',
        position: 'centre'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Eliminar archivo original
    await fs.unlink(inputPath);

    // Obtener metadata final
    const finalMetadata = await sharp(processedPath).metadata();

    // Actualizar req.file con la información procesada
    req.file.path = processedPath;
    req.file.filename = `processed-${filename}`;
    req.file.width = finalMetadata.width;
    req.file.height = finalMetadata.height;
    req.file.size = (await fs.stat(processedPath)).size;
    req.file.thumbnailPath = thumbnailPath;
    req.file.thumbnailFilename = `thumb-${nameWithoutExt}.jpg`;

    next();
  } catch (error) {
    console.error('Error processing image:', error);
    
    // Limpiar archivos si hay error
    try {
      if (req.file?.path) await fs.unlink(req.file.path);
    } catch {}

    return res.status(500).json({
      error: 'Error processing image. Please try again.'
    });
  }
};

// Middleware para manejar errores de multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. Only one file allowed.'
      });
    }
    return res.status(400).json({
      error: 'Upload error: ' + err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      error: err.message
    });
  }
  
  next();
};

module.exports = {
  upload: upload.single('image'),
  processImage,
  handleUploadError
};