import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Enviar un mensaje
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverUsername, text } = req.body;

    if (!receiverUsername || !text) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere username del receptor y texto del mensaje'
      });
    }

    // Buscar el usuario receptor
    const receiver = await User.findOne({ username: receiverUsername });
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir enviarse mensajes a sí mismo
    if (receiver._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes enviarte mensajes a ti mismo'
      });
    }

    // Crear el mensaje
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiver._id,
      text: text.trim()
    });

    // Poblar los datos del mensaje
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener conversaciones del usuario
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    // Obtener todos los mensajes donde el usuario es sender o receiver
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'username avatar bio')
    .populate('receiver', 'username avatar bio')
    .sort({ createdAt: -1 });

    // Agrupar por conversación (usuario único)
    const conversationsMap = new Map();

    messages.forEach(msg => {
      // Determinar el otro usuario (no el actual)
      const otherUser = msg.sender._id.toString() === req.user._id.toString() 
        ? msg.receiver 
        : msg.sender;
      
      const otherUserId = otherUser._id.toString();

      if (!conversationsMap.has(otherUserId)) {
        // Contar mensajes no leídos de este usuario
        const unreadCount = messages.filter(m => 
          m.sender._id.toString() === otherUserId && 
          m.receiver._id.toString() === req.user._id.toString() &&
          !m.read
        ).length;

        conversationsMap.set(otherUserId, {
          user: {
            id: otherUser._id,
            username: otherUser.username,
            avatar: otherUser.avatar,
            bio: otherUser.bio
          },
          lastMessage: {
            id: msg._id,
            text: msg.text,
            timestamp: msg.createdAt,
            senderId: msg.sender._id,
            read: msg.read
          },
          unreadCount
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener mensajes de una conversación
// @route   GET /api/messages/:username
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { username } = req.params;

    // Buscar el otro usuario
    const otherUser = await User.findOne({ username });
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener mensajes entre los dos usuarios
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUser._id },
        { sender: otherUser._id, receiver: req.user._id }
      ]
    })
    .populate('sender', 'username avatar')
    .populate('receiver', 'username avatar')
    .sort({ createdAt: 1 }); // Ordenar cronológicamente

    // Marcar como leídos los mensajes recibidos
    await Message.updateMany(
      {
        sender: otherUser._id,
        receiver: req.user._id,
        read: false
      },
      { read: true }
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Marcar mensajes como leídos
// @route   PUT /api/messages/:username/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { username } = req.params;

    const otherUser = await User.findOne({ username });
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await Message.updateMany(
      {
        sender: otherUser._id,
        receiver: req.user._id,
        read: false
      },
      { read: true }
    );

    res.json({
      success: true,
      message: 'Mensajes marcados como leídos'
    });
  } catch (error) {
    console.error('Error al marcar mensajes como leídos:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Eliminar una conversación completa
// @route   DELETE /api/messages/:username
// @access  Private
export const deleteConversation = async (req, res) => {
  try {
    const { username } = req.params;

    const otherUser = await User.findOne({ username });
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await Message.deleteMany({
      $or: [
        { sender: req.user._id, receiver: otherUser._id },
        { sender: otherUser._id, receiver: req.user._id }
      ]
    });

    res.json({
      success: true,
      message: 'Conversación eliminada'
    });
  } catch (error) {
    console.error('Error al eliminar conversación:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
