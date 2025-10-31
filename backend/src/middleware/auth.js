import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  // Verificar si el token está en los headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener el token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Obtener el usuario del token (sin la contraseña)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      next();
    } catch (error) {
      console.error('Error de autenticación:', error);
      return res.status(401).json({
        success: false,
        message: 'No autorizado, token inválido'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado, no se encontró token'
    });
  }
};

export { protect };
