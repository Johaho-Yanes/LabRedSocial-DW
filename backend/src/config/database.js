import mongoose from 'mongoose';

// Opciones de Mongoose: dejamos vacío por defecto ya que el driver moderno
// aplica internamente las opciones adecuadas. Añade aquí opciones como
// poolSize o serverSelectionTimeoutMS según necesites.
const mongooseOptions = {
  // Ejemplo:
  // poolSize: 10,
  // serverSelectionTimeoutMS: 5000,
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ Variable de entorno MONGODB_URI no encontrada. Añade tu connection string de MongoDB Atlas en .env');
    // No hacemos process.exit para no romper procesos de test; pero es importante arreglarlo.
    return;
  }

  try {
    const conn = await mongoose.connect(uri, mongooseOptions);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
    // En producción quizá quieras reintentar en lugar de salir.
    process.exit(1);
  }
};

export default connectDB;
