import express from 'express';
const router = express.Router();
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUserById,
  getAllUsers,
  followUser,
  unfollowUser,
  getFollowing,
  uploadAvatar,
  toggleFavorite,
  getFavorites
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas protegidas
router.get('/profile/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.get('/following', protect, getFollowing);
router.get('/favorites', protect, getFavorites);
router.post('/favorites/:imageId', protect, toggleFavorite);
router.get('/', protect, getAllUsers);
router.post('/:username/follow', protect, followUser);
router.delete('/:username/follow', protect, unfollowUser);
router.get('/:id', getUserById);

export default router;
