import express from 'express';
const router = express.Router();

// Importar rutas
import userRoutes from './userRoutes.js';
import imageRoutes from './imageRoutes.js';
import messageRoutes from './messageRoutes.js';

// Usar rutas
router.use('/users', userRoutes);
router.use('/images', imageRoutes);
router.use('/messages', messageRoutes);

export default router;
