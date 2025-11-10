import express from 'express';
import { visionController } from '../controllers/visionController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Ruta para analizar rostros en una imagen
router.post('/analyze-faces', upload.single('image'), visionController.analyzeFaces);

export default router;