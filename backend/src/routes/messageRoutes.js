import express from 'express';
const router = express.Router();
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteConversation
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

// Todas las rutas requieren autenticación
router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/:username', protect, getMessages);
router.put('/:username/read', protect, markAsRead);
router.delete('/:username', protect, deleteConversation);

export default router;
