const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(userId) {
  return jwt.sign(
    { user: { id: userId } }, // 👈 O ajusta la estructura según tu decode
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.generateToken = generateToken;

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No hay token, autorización denegada'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }
};