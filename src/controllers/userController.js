const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService'); // ✅ Aquí importas tu servicio

class UserController {
  // Registrar usuario
  async register(req, res) {
    try {
      const parametros = req.body;
      
      if (!parametros.username || !parametros.email || !parametros.password) {
        return res.status(400).json({
          status: "error",
          mensaje: "Faltan datos por enviar"
        });
      }

      const result = await userService.register(parametros);
      
      return res.status(201).json({
        status: "success",
        mensaje: "Usuario registrado exitosamente",
        data: result
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(400).json({
        status: "error",
        mensaje: error.message || "Error en el registro"
      });
    }
  }

  // Iniciar sesión
  async login(req, res) {
    try {
      const parametros = req.body;
      
      if (!parametros.email || !parametros.password) {
        return res.status(400).json({
          status: "error",
          mensaje: "Email y password son requeridos"
        });
      }

      const result = await userService.login(parametros.email, parametros.password);
      
      // Opcional: Establecer cookie con el token
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      return res.status(200).json({
        status: "success",
        mensaje: "Login exitoso",
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        status: "error",
        mensaje: error.message || "Error en el login"
      });
    }
  }

  // Cerrar sesión
  async logout(req, res) {
    try {
      res.clearCookie('token');
      return res.status(200).json({
        status: "success",
        mensaje: "Logout exitoso"
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        status: "error",
        mensaje: "Error en logout"
      });
    }
  }

  // Obtener perfil del usuario actual
  async getProfile(req, res) {
    try {
      const userId = req.user._id;
      const profile = await userService.getUserProfile(userId, userId);
      
      return res.status(200).json({
        status: "success",
        data: profile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        status: "error",
        mensaje: error.message || "Error al obtener perfil"
      });
    }
  }

  // Obtener perfil de usuario por ID
  async getUserById(req, res) {
    try {
      const id = req.params.id;
      const currentUserId = req.user?._id;
      
      const profile = await userService.getUserProfile(id, currentUserId);
      
      return res.status(200).json({
        status: "success",
        data: profile
      });
    } catch (error) {
      console.error('Get user error:', error);
      const statusCode = error.message === 'User not found' ? 404 : 500;
      return res.status(statusCode).json({
        status: "error",
        mensaje: error.message || "Error al obtener usuario"
      });
    }
  }

  // Actualizar perfil
  async updateProfile(req, res) {
    try {
      const userId = req.user._id;
      const parametros = req.body;
      
      const updatedUser = await userService.updateProfile(userId, parametros);
      
      return res.status(200).json({
        status: "success",
        mensaje: "Perfil actualizado exitosamente",
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      const statusCode = error.message.includes('already taken') ? 400 : 500;
      return res.status(statusCode).json({
        status: "error",
        mensaje: error.message || "Error al actualizar perfil"
      });
    }
  }

  // Obtener estadísticas del usuario
  async getUserStats(req, res) {
    try {
      const id = req.params.id;
      const stats = await userService.getUserStats(id);
      
      return res.status(200).json({
        status: "success",
        data: stats
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      const statusCode = error.message === 'User not found' ? 404 : 500;
      return res.status(statusCode).json({
        status: "error",
        mensaje: error.message || "Error al obtener estadísticas"
      });
    }
  }

  // Buscar usuarios
  async searchUsers(req, res) {
    try {
      const query = req.query.q;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          status: "error",
          mensaje: "La búsqueda debe tener al menos 2 caracteres"
        });
      }

      const result = await userService.searchUsers(query.trim(), page, limit);
      
      return res.status(200).json({
        status: "success",
        data: result
      });
    } catch (error) {
      console.error('Search users error:', error);
      return res.status(500).json({
        status: "error",
        mensaje: "Error en la búsqueda"
      });
    }
  }

  // Eliminar cuenta
  async deleteAccount(req, res) {
    try {
      const userId = req.user._id;
      const result = await userService.deleteAccount(userId);
      
      // Limpiar cookie
      res.clearCookie('token');
      
      return res.status(200).json({
        status: "success",
        mensaje: result.message
      });
    } catch (error) {
      console.error('Delete account error:', error);
      return res.status(500).json({
        status: "error",
        mensaje: error.message || "Error al eliminar cuenta"
      });
    }
  }

  // Verificar disponibilidad de username
  async checkUsername(req, res) {
    try {
      const username = req.params.username;
      
      if (!username || username.length < 3) {
        return res.status(400).json({
          available: false,
          mensaje: "Username debe tener al menos 3 caracteres"
        });
      }

      const existingUser = await User.findOne({ 
        username, 
        isActive: true 
      });
      
      return res.status(200).json({
        available: !existingUser,
        mensaje: existingUser ? "Username ya está en uso" : "Username disponible"
      });
    } catch (error) {
      console.error('Check username error:', error);
      return res.status(500).json({
        available: false,
        mensaje: "Error verificando disponibilidad"
      });
    }
  }

  // Verificar token (para frontend)
  async verifyToken(req, res) {
    try {
      // Si llegamos aquí, el middleware de auth ya validó el token
      return res.status(200).json({
        status: "success",
        user: req.user.toPublicJSON()
      });
    } catch (error) {
      console.error('Verify token error:', error);
      return res.status(401).json({
        status: "error",
        mensaje: "Token inválido"
      });
    }
  }
}

module.exports = new UserController();