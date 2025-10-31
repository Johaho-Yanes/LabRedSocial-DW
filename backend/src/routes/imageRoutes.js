import express from 'express';
const router = express.Router();
import {
  getAllImages,
  getImageById,
  uploadImage,
  updateImage,
  deleteImage,
  toggleLike,
  addComment,
  toggleUpvote,
  toggleDownvote
} from '../controllers/imageController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

// Rutas públicas
router.get('/', getAllImages);
router.get('/:id', getImageById);

// Rutas protegidas
router.post('/upload', protect, upload.single('image'), uploadImage);
router.post('/:id', protect, updateImage);
router.delete('/:id', protect, deleteImage);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/upvote', protect, toggleUpvote);
router.post('/:id/downvote', protect, toggleDownvote);
router.post('/:id/comment', protect, addComment);

export default router;
