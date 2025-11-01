import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar .env desde la carpeta backend (asumiendo que el archivo está en backend/.env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI no encontrada en backend/.env. Añádela y vuelve a intentar.');
  process.exit(1);
}

(async () => {
  try {
    const conn = await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB Atlas:', conn.connection.host);
    console.log('📊 Base de datos:', conn.connection.name);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error conectando a Atlas:', err.message);
    process.exit(1);
  }
})();
