import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { lookup as mimeLookup } from "mime-types";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear cliente S3 sólo si está habilitado
const USE_S3 = (process.env.USE_S3 || 'false') === 'true';
const s3 = USE_S3
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

// Configurar almacenamiento según el modo (S3 o local)
let storage;

if (USE_S3) {
  // Modo S3: usar memoryStorage (archivos en buffer)
  console.log('📦 Multer configurado en modo memoria (para S3)');
  storage = multer.memoryStorage();
} else {
  // Modo local: usar diskStorage
  console.log('📦 Multer configurado en modo disco (almacenamiento local)');
  
  // Crear directorio de uploads si no existe
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, 'image-' + uniqueSuffix + ext);
    }
  });
}

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'));
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  },
  fileFilter: fileFilter
});

export default upload;
export { s3, USE_S3 };
