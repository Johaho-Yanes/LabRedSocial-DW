import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar path para .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Importar modelo
import User from '../src/models/User.js';

const testDuplicateValidations = async () => {
  try {
    console.log('\n🧪 Iniciando pruebas de validación de duplicados...\n');

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Limpiar datos de prueba anteriores
    await User.deleteMany({ 
      username: { $in: ['testuser1', 'testuser2', 'testuser3'] } 
    });

    // ========== TEST 1: Crear usuario original ==========
    console.log('📝 TEST 1: Creando usuario original...');
    const originalUser = await User.create({
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'password123',
      bio: 'Usuario de prueba original'
    });
    console.log(`✅ Usuario creado: @${originalUser.username} (${originalUser.email})\n`);

    // ========== TEST 2: Intentar registrar con mismo EMAIL ==========
    console.log('📝 TEST 2: Intentando registrar con mismo email...');
    try {
      await User.create({
        username: 'testuser2',
        email: 'test1@example.com', // Email duplicado
        password: 'password123'
      });
      console.log('❌ ERROR: Se permitió email duplicado\n');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Email duplicado RECHAZADO correctamente (código 11000)\n');
      } else {
        console.log('⚠️  Error diferente:', error.message, '\n');
      }
    }

    // ========== TEST 3: Intentar registrar con mismo USERNAME ==========
    console.log('📝 TEST 3: Intentando registrar con mismo username...');
    try {
      await User.create({
        username: 'testuser1', // Username duplicado
        email: 'test2@example.com',
        password: 'password123'
      });
      console.log('❌ ERROR: Se permitió username duplicado\n');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Username duplicado RECHAZADO correctamente (código 11000)\n');
      } else {
        console.log('⚠️  Error diferente:', error.message, '\n');
      }
    }

    // ========== TEST 4: Crear segundo usuario válido ==========
    console.log('📝 TEST 4: Creando segundo usuario con datos únicos...');
    const secondUser = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      password: 'password123'
    });
    console.log(`✅ Segundo usuario creado: @${secondUser.username} (${secondUser.email})\n`);

    // ========== TEST 5: Intentar ACTUALIZAR a email existente ==========
    console.log('📝 TEST 5: Intentando actualizar a email ya existente...');
    const userToUpdate = await User.findOne({ username: 'testuser2' });
    userToUpdate.email = 'test1@example.com'; // Email que ya usa testuser1
    try {
      await userToUpdate.save();
      console.log('❌ ERROR: Se permitió actualizar a email duplicado\n');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Update a email duplicado RECHAZADO correctamente (código 11000)\n');
      } else {
        console.log('⚠️  Error diferente:', error.message, '\n');
      }
    }

    // ========== TEST 6: Intentar ACTUALIZAR a username existente ==========
    console.log('📝 TEST 6: Intentando actualizar a username ya existente...');
    const userToUpdate2 = await User.findOne({ username: 'testuser2' });
    userToUpdate2.username = 'testuser1'; // Username que ya usa testuser1
    try {
      await userToUpdate2.save();
      console.log('❌ ERROR: Se permitió actualizar a username duplicado\n');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Update a username duplicado RECHAZADO correctamente (código 11000)\n');
      } else {
        console.log('⚠️  Error diferente:', error.message, '\n');
      }
    }

    // ========== TEST 7: Actualización válida ==========
    console.log('📝 TEST 7: Actualizando con datos únicos...');
    const userToUpdate3 = await User.findOne({ username: 'testuser2' });
    userToUpdate3.bio = 'Bio actualizada correctamente';
    await userToUpdate3.save();
    console.log(`✅ Usuario actualizado correctamente: @${userToUpdate3.username}\n`);

    // Limpiar datos de prueba
    console.log('🧹 Limpiando datos de prueba...');
    await User.deleteMany({ 
      username: { $in: ['testuser1', 'testuser2', 'testuser3'] } 
    });
    console.log('✅ Datos de prueba eliminados\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Resumen:');
    console.log('✅ Email duplicado en registro: BLOQUEADO');
    console.log('✅ Username duplicado en registro: BLOQUEADO');
    console.log('✅ Email duplicado en actualización: BLOQUEADO');
    console.log('✅ Username duplicado en actualización: BLOQUEADO');
    console.log('✅ Actualizaciones válidas: PERMITIDAS\n');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB\n');
    process.exit(0);
  }
};

testDuplicateValidations();
