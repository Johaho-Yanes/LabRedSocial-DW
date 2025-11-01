import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Registrar nuevo usuario
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password, bio } = req.body;

    // Validar datos
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona username, email y password'
      });
    }

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El usuario o email ya existe'
      });
    }

    // Crear usuario
    const user = await User.create({
      username,
      email,
      password,
      bio: bio || `Hola, soy ${username}`
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          token: generateToken(user._id)
        }
      });
    }
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login de usuario
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona email y password'
      });
    }

    // Buscar usuario (incluir password)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener perfil del usuario actual
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: updatedUser.toPublicJSON()
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener usuario por ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Seguir a un usuario
// @route   POST /api/users/:username/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findOne({ username: req.params.username });

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No puedes seguirte a ti mismo
    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes seguirte a ti mismo'
      });
    }

    const currentUser = await User.findById(req.user._id);

    // Verificar si ya está siguiendo
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({
        success: false,
        message: 'Ya sigues a este usuario'
      });
    }

    // Agregar a following
    currentUser.following.push(userToFollow._id);
    await currentUser.save();

    // Agregar a followers del otro usuario
    userToFollow.followers.push(currentUser._id);
    await userToFollow.save();

    res.json({
      success: true,
      message: `Ahora sigues a @${userToFollow.username}`
    });
  } catch (error) {
    console.error('Error al seguir usuario:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Dejar de seguir a un usuario
// @route   DELETE /api/users/:username/follow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findOne({ username: req.params.username });

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const currentUser = await User.findById(req.user._id);

    // Verificar si no está siguiendo
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({
        success: false,
        message: 'No sigues a este usuario'
      });
    }

    // Remover de following
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    await currentUser.save();

    // Remover de followers del otro usuario
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );
    await userToUnfollow.save();

    res.json({
      success: true,
      message: `Dejaste de seguir a @${userToUnfollow.username}`
    });
  } catch (error) {
    console.error('Error al dejar de seguir usuario:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener lista de usuarios que sigue el usuario actual
// @route   GET /api/users/following
// @access  Private
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('following', 'username avatar bio');

    res.json({
      success: true,
      data: user.following
    });
  } catch (error) {
    console.error('Error al obtener following:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Subir avatar
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    // Importar dependencias
    const sharp = (await import('sharp')).default;
    const path = await import('path');
    const fs = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');
    const { USE_S3 } = await import('../middleware/upload.js');
    const { processAndUploadAvatar, deleteFromS3 } = await import('../config/s3.js');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Obtener el usuario actual
    const currentUser = await User.findById(req.user._id);
    
    let avatarUrl;
    
    if (USE_S3) {
      // ========== MODO S3 (PRODUCCIÓN) ==========
      console.log('📤 Subiendo avatar a S3...');
      
      // Si tiene avatar anterior en S3, eliminarlo
      if (currentUser.avatar && currentUser.avatar.includes('s3.amazonaws.com')) {
        try {
          await deleteFromS3(currentUser.avatar);
          console.log('🗑️  Avatar anterior eliminado de S3');
        } catch (err) {
          console.error('Error al eliminar avatar anterior de S3:', err);
        }
      }
      
      // Procesar y subir nuevo avatar a S3
      avatarUrl = await processAndUploadAvatar(req.file.buffer, req.user._id.toString());
      console.log('✅ Avatar subido a S3:', avatarUrl);
      
    } else {
      // ========== MODO LOCAL (DESARROLLO) ==========
      console.log('💾 Guardando avatar localmente...');
      
      // Si tiene avatar anterior local, eliminarlo
      if (currentUser.avatar && currentUser.avatar.startsWith('/uploads/avatar-')) {
        const oldAvatarPath = path.join(__dirname, '../..', currentUser.avatar);
        
        if (fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
            console.log(`🗑️  Avatar anterior eliminado: ${currentUser.avatar}`);
          } catch (err) {
            console.error('Error al eliminar avatar anterior:', err);
          }
        }
      }

      // Procesar la imagen: redimensionar a 200x200 y optimizar
      const avatarFilename = `avatar-${req.user._id}-${Date.now()}.jpg`;
      const avatarPath = path.join(__dirname, '../../uploads', avatarFilename);

      await sharp(req.file.path)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toFile(avatarPath);

      // Eliminar el archivo temporal original de multer
      fs.unlinkSync(req.file.path);

      // URL local
      avatarUrl = `/uploads/${avatarFilename}`;
      console.log('✅ Avatar guardado localmente:', avatarUrl);
    }

    // Actualizar el usuario con el nuevo avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      data: {
        avatar: avatarUrl,
        user
      }
    });
  } catch (error) {
    console.error('Error al subir avatar:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle favorito (agregar/quitar imagen de favoritos)
// @route   POST /api/users/favorites/:imageId
// @access  Private
const toggleFavorite = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const isFavorite = user.favorites.includes(imageId);

    if (isFavorite) {
      // Quitar de favoritos
      user.favorites = user.favorites.filter(id => id.toString() !== imageId);
    } else {
      // Agregar a favoritos
      user.favorites.push(imageId);
    }

    await user.save();

    res.json({
      success: true,
      isFavorite: !isFavorite,
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Error al toggle favorito:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Obtener favoritos del usuario
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: {
        path: 'author',
        select: 'username avatar bio'
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Filtrar favoritos null (imágenes que fueron eliminadas)
    const validFavorites = user.favorites.filter(fav => fav !== null && fav.author !== null);

    res.json({
      success: true,
      data: validFavorites
    });
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export {
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
};
