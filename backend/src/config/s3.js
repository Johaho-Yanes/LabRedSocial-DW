// ============================================
// AWS S3 Storage Configuration
// ============================================

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

// Configurar cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Nombre del bucket: soportamos dos nombres de variable para compatibilidad
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET;
const USE_S3 = (process.env.USE_S3 || 'false') === 'true';

// Validación temprana para ayudar al desarrollador si falta configuración
if (USE_S3 && !BUCKET_NAME) {
  console.error('❌ USE_S3 está habilitado pero no se encontró el nombre del bucket (AWS_S3_BUCKET_NAME o S3_BUCKET) en las variables de entorno.');
  // No hacemos process.exit aquí — solo lo logueamos para desarrollo.
}

/**
 * Sube una imagen a S3
 * @param {Buffer} buffer - Buffer de la imagen
 * @param {string} filename - Nombre del archivo
 * @param {string} folder - Carpeta dentro del bucket (ej: 'images', 'avatars')
 * @returns {Promise<string>} - URL de la imagen en S3
 */
async function uploadToS3(buffer, filename, folder = 'images') {
  if (!USE_S3) {
    throw new Error('S3 no está habilitado. Configurar USE_S3=true');
  }

  const key = `${folder}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    // No usamos ACL porque el bucket tiene ACLs desactivadas
    // El acceso público se controla con la Bucket Policy
  });

  await s3Client.send(command);

  // Retornar URL pública
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

/**
 * Elimina una imagen de S3
 * @param {string} imageUrl - URL completa de la imagen
 * @returns {Promise<void>}
 */
async function deleteFromS3(imageUrl) {
  if (!USE_S3) {
    throw new Error('S3 no está habilitado');
  }

  // Extraer key de la URL
  const url = new URL(imageUrl);
  const key = url.pathname.substring(1); // Remover '/' inicial

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Procesa y sube una imagen regular a S3
 * @param {Object} file - Archivo de multer
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} - URL de la imagen
 */
async function processAndUploadImage(file, userId) {
  // Procesar imagen con Sharp
  const processedBuffer = await sharp(file.buffer)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Generar nombre único
  const filename = `image-${userId}-${Date.now()}.jpg`;

  // Subir a S3
  return await uploadToS3(processedBuffer, filename, 'images');
}

/**
 * Procesa y sube un avatar a S3
 * @param {Buffer} buffer - Buffer de la imagen procesada
 * @param {string} userId - ID del usuario
 * @returns {Promise<string>} - URL del avatar
 */
async function processAndUploadAvatar(buffer, userId) {
  // Procesar avatar con Sharp (ya viene procesado del frontend, solo optimizar)
  const processedBuffer = await sharp(buffer)
    .resize(200, 200)
    .jpeg({ quality: 90 })
    .toBuffer();

  // Generar nombre único
  const filename = `avatar-${userId}-${Date.now()}.jpg`;

  // Subir a S3
  return await uploadToS3(processedBuffer, filename, 'avatars');
}

export {
  uploadToS3,
  deleteFromS3,
  processAndUploadImage,
  processAndUploadAvatar,
  USE_S3,
  BUCKET_NAME,
};
