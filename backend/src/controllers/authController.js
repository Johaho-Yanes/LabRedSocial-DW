// src/controllers/authController.js
const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// 🔹 Función auxiliar para verificar el token de reCAPTCHA
async function verifyRecaptcha(token) {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verificando reCAPTCHA:', error);
    return { success: false };
  }
}

// 🔹 Controlador de registro
const register = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    // Verificar reCAPTCHA
    if (!recaptchaToken)
      return res.status(400).json({ message: 'reCAPTCHA token required' });

    const rec = await verifyRecaptcha(recaptchaToken);

    // Para reCAPTCHA v3 se puede usar el "score"
    if (!rec.success || (rec.score && rec.score < 0.5))
      return res.status(400).json({ message: 'Failed reCAPTCHA verification' });

    // Comprobar si ya existe el usuario
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'Email already registered' });

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      passwordHash: hash,
      provider: 'local',
    });
    await user.save();

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 Controlador de login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash || '');
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 Endpoint para probar el reCAPTCHA manualmente
const recaptchaTest = async (req, res) => {
  try {
    const { token } = req.body;
    const verified = await verifyRecaptcha(token);
    res.json(verified);
  } catch (err) {
    res.status(500).json({ message: 'error' });
  }
};

// ✅ Exportar correctamente (para que `require` funcione)
module.exports = { register, login, recaptchaTest };
