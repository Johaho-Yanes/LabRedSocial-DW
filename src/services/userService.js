const User = require('../models/User');
const Image = require('../models/Image');
const { generateToken } = require('../middleware/auth');

class UserService {
  // Registrar nuevo usuario
  async register(userData) {
    const { username, email, password } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error('Email already registered');
      }
      if (existingUser.username === username) {
        throw new Error('Username already taken');
      }
    }

    // Crear nuevo usuario
    const user = new User({ username, email, password });
    await user.save();

    // Generar token
    const token = generateToken(user._id);

    return {
      user: user.toPublicJSON(),
      token
    };
  }

  // Iniciar sesión
  async login(email, password) {
    // Buscar usuario por email
    const user = await User.findOne({ email, isActive: true });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verificar password
    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generar token
    const token = generateToken(user._id);

    return {
      user: user.toPublicJSON(),
      token
    };
  }

  // Obtener perfil de usuario
  async getUserProfile(userId, currentUserId = null) {
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'images',
        match: { isActive: true, isPublic: true },
        options: { 
          sort: { createdAt: -1 },
          limit: 20 
        }
      });

    if (!user) {
      throw new Error('User not found');
    }

    // Si es el propio usuario, incluir imágenes privadas
    if (currentUserId && userId === currentUserId.toString()) {
      const images = await Image.find({ 
        uploader: userId, 
        isActive: true 
      }).sort({ createdAt: -1 }).limit(20);
      
      return { ...user.toPublicJSON(), images };
    }

    return user.toPublicJSON();
  }

  // Actualizar perfil
  async updateProfile(userId, updateData) {
    const allowedUpdates = ['username', 'bio', 'avatar'];
    const updates = {};

    // Filtrar solo campos permitidos
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    // Si se está actualizando el username, verificar que no exista
    if (updates.username) {
      const existingUser = await User.findOne({
        username: updates.username,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        throw new Error('Username already taken');
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user.toPublicJSON();
  }

  // Obtener estadísticas del usuario
  async getUserStats(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const stats = await Image.aggregate([
      { $match: { uploader: user._id, isActive: true } },
      {
        $group: {
          _id: null,
          totalImages: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          totalComments: { $sum: { $size: '$comments' } }
        }
      }
    ]);

    return stats[0] || {
      totalImages: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0
    };
  }

  // Buscar usuarios
  async searchUsers(query, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    })
    .select('-password')
    .sort({ totalUploads: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await User.countDocuments({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    });

    return {
      users: users.map(user => user.toPublicJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Eliminar cuenta (soft delete)
  async deleteAccount(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Desactivar usuario
    user.isActive = false;
    await user.save();

    // Desactivar todas sus imágenes
    await Image.updateMany(
      { uploader: userId },
      { isActive: false }
    );

    return { message: 'Account deleted successfully' };
  }
}

module.exports = new UserService();