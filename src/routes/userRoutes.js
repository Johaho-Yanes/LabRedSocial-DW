const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validaciones
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('El nombre de usuario solo puede contener letras, números, guiones bajos y guiones')
        .escape(),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail()
        .escape(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/)
        .withMessage('La contraseña debe contener al menos una letra y un número')
];

const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
];

// ==============================================
// RUTAS ESPECÍFICAS (sin parámetros) - PRIMERO
// ==============================================

// Autenticación
router.post('/register', registerValidation, userController.register);
router.post('/login', loginValidation, userController.login);
router.post('/logout', authenticate, userController.logout);
router.get('/verify-token', authenticate, userController.verifyToken);

module.exports = router;