const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Import configuration and routes con ruta correcta
const connectDB = require('./config/database');  // Cambiado aquí
const apiRoutes = require('./routes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Define paths
const publicPath = path.join(__dirname, '../public');

// Route logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Static files middleware
app.use(express.static(publicPath));

// API routes
app.use('/api', apiRoutes);

// Frontend routes
app.get(['/', '/login', '/register', '/profile', '/upload', '/dashboard'], (req, res) => {
    const page = req.path === '/' ? 'index.html' : `src/pages${req.path}.html`;
    res.sendFile(path.join(publicPath, page));
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            status: 'error',
            message: 'API endpoint not found'
        });
    }
    res.sendFile(path.join(publicPath, 'src/pages/404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n=================================');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('📍 Available routes:');
    console.log(`  http://localhost:${PORT}/`);
    console.log(`  http://localhost:${PORT}/login`);
    console.log(`  http://localhost:${PORT}/register`);
    console.log('=================================\n');
});

module.exports = app;