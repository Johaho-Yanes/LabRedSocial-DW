const express = require('express');
const path = require('path');
const userRoutes = require('./userRoutes');
const imageRoutes = require('./imageRoutes');

const router = express.Router();

// API Health check
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date(),
        service: 'Blog Out API'
    });
});

// Mount API routes
router.use('/users', userRoutes);
router.use('/images', imageRoutes);

// Servir archivos estáticos de uploads
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;