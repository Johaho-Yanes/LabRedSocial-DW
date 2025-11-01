import { S3Client, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar .env desde la carpeta backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const USE_S3 = (process.env.USE_S3 || 'false') === 'true';
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET;
const REGION = process.env.AWS_REGION;

console.log('\n🔍 Verificando configuración de S3...\n');

if (!USE_S3) {
  console.log('⚠️  USE_S3 está en false. Cambia a true en backend/.env para habilitar S3.');
  process.exit(1);
}

if (!BUCKET_NAME) {
  console.log('❌ No se encontró el nombre del bucket (AWS_S3_BUCKET_NAME o S3_BUCKET) en .env');
  process.exit(1);
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.log('❌ Faltan credenciales AWS (AWS_ACCESS_KEY_ID o AWS_SECRET_ACCESS_KEY) en .env');
  process.exit(1);
}

console.log('✅ Configuración encontrada:');
console.log(`   - Bucket: ${BUCKET_NAME}`);
console.log(`   - Region: ${REGION}`);
console.log(`   - Access Key: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...`);
console.log('');

// Crear cliente S3
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

(async () => {
  try {
    // 1. Listar buckets disponibles
    console.log('📋 Listando buckets disponibles...');
    const listCommand = new ListBucketsCommand({});
    const listResponse = await s3Client.send(listCommand);
    
    if (listResponse.Buckets && listResponse.Buckets.length > 0) {
      console.log('✅ Buckets encontrados:');
      listResponse.Buckets.forEach(bucket => {
        const status = bucket.Name === BUCKET_NAME ? '👉 (configurado)' : '';
        console.log(`   - ${bucket.Name} ${status}`);
      });
    } else {
      console.log('⚠️  No se encontraron buckets');
    }
    
    // 2. Verificar si el bucket configurado existe
    const bucketExists = listResponse.Buckets?.some(b => b.Name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`\n❌ El bucket "${BUCKET_NAME}" NO existe en tu cuenta AWS.`);
      console.log('\n📝 Opciones:');
      console.log('   1. Crear el bucket en AWS Console: https://s3.console.aws.amazon.com/s3/');
      console.log(`   2. O cambiar S3_BUCKET en .env a uno de los buckets listados arriba`);
      process.exit(1);
    }
    
    console.log(`\n✅ El bucket "${BUCKET_NAME}" existe y es accesible`);
    
    // 3. Probar subida de un archivo de prueba
    console.log('\n🧪 Probando subida de archivo de prueba...');
    const testKey = 'test/connection-test.txt';
    const testContent = `Prueba de conexión S3 - ${new Date().toISOString()}`;
    
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });
    
    await s3Client.send(putCommand);
    console.log(`✅ Archivo de prueba subido exitosamente a: ${testKey}`);
    
    const fileUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${testKey}`;
    console.log(`📍 URL del archivo: ${fileUrl}`);
    
    console.log('\n🎉 ¡Conexión a S3 exitosa! Tu configuración está lista.');
    console.log('\n💡 Nota: Si las imágenes no son públicas, configura la política del bucket.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error conectando a S3:');
    console.error(`   ${error.message}`);
    
    if (error.name === 'CredentialsError' || error.Code === 'InvalidAccessKeyId') {
      console.log('\n💡 Las credenciales AWS parecen incorrectas. Verifica:');
      console.log('   - AWS_ACCESS_KEY_ID');
      console.log('   - AWS_SECRET_ACCESS_KEY');
    } else if (error.Code === 'NoSuchBucket') {
      console.log(`\n💡 El bucket "${BUCKET_NAME}" no existe. Créalo en AWS Console.`);
    } else {
      console.log('\n💡 Verifica la configuración en backend/.env');
    }
    
    process.exit(1);
  }
})();
