const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Agregar más opciones de configuración
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-out', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB Connected');
        
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
            // Intentar reconectar
            setTimeout(connectDB, 5000);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('📡 MongoDB disconnected - attempting to reconnect...');
            setTimeout(connectDB, 5000);
        });

        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('🔌 MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error during MongoDB disconnect:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        // Intentar reconectar después de un delay
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;