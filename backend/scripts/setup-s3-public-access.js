import { 
  S3Client, 
  PutPublicAccessBlockCommand,
  GetPublicAccessBlockCommand,
  PutBucketPolicyCommand 
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar .env desde la carpeta backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET;
const REGION = process.env.AWS_REGION;

if (!BUCKET_NAME) {
  console.log('❌ No se encontró el nombre del bucket en .env');
  process.exit(1);
}

// Crear cliente S3
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Política de bucket para hacer públicas las imágenes
const bucketPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicReadGetObject',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
    }
  ]
};

(async () => {
  try {
    console.log(`\n🔧 Configurando acceso público para el bucket: ${BUCKET_NAME}\n`);
    
    // Paso 1: Verificar configuración actual de Block Public Access
    console.log('📋 Verificando configuración de Block Public Access...');
    try {
      const getBlockCommand = new GetPublicAccessBlockCommand({ Bucket: BUCKET_NAME });
      const blockConfig = await s3Client.send(getBlockCommand);
      console.log('   Configuración actual:', blockConfig.PublicAccessBlockConfiguration);
    } catch (err) {
      console.log('   No hay configuración de Block Public Access');
    }
    
    // Paso 2: Desactivar Block Public Access
    console.log('\n🔓 Desactivando Block Public Access...');
    const putBlockCommand = new PutPublicAccessBlockCommand({
      Bucket: BUCKET_NAME,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,  // ← Este es el que causa el error
        RestrictPublicBuckets: false
      }
    });
    
    await s3Client.send(putBlockCommand);
    console.log('✅ Block Public Access desactivado');
    
    // Paso 3: Aplicar la política pública
    console.log('\n📝 Aplicando política de lectura pública...');
    const putPolicyCommand = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    });
    
    await s3Client.send(putPolicyCommand);
    console.log('✅ Política pública aplicada exitosamente!');
    
    console.log('');
    console.log('📄 Política aplicada:');
    console.log(JSON.stringify(bucketPolicy, null, 2));
    console.log('');
    console.log('🌐 Configuración completada. Ahora las imágenes son públicamente accesibles.');
    console.log('');
    console.log('💡 Formato de URL pública:');
    console.log(`   https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/<carpeta>/<archivo>`);
    console.log('');
    console.log('   Ejemplos:');
    console.log(`   https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/images/image-123.jpg`);
    console.log(`   https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/avatars/avatar-456.jpg`);
    console.log('');
    console.log('⚠️  IMPORTANTE - Seguridad:');
    console.log('   ✓ Las imágenes son visibles públicamente (solo LECTURA)');
    console.log('   ✓ Nadie puede ELIMINAR o MODIFICAR sin credenciales AWS');
    console.log('   ✓ Solo tu backend con credenciales puede subir/eliminar archivos');
    console.log('   ✗ Para más control, considera CloudFront + Signed URLs en producción');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error al configurar el bucket:');
    console.error(`   ${error.message}`);
    console.error('');
    
    if (error.Code === 'NoSuchBucket') {
      console.log('💡 El bucket no existe. Pasos:');
      console.log('   1. Ve a https://s3.console.aws.amazon.com/');
      console.log(`   2. Crea un bucket llamado "${BUCKET_NAME}"`);
      console.log(`   3. Región: ${REGION}`);
      console.log('   4. Ejecuta este script nuevamente');
    } else if (error.Code === 'AccessDenied') {
      console.log('💡 Acceso denegado. El usuario IAM necesita estos permisos:');
      console.log('   - s3:PutBucketPolicy');
      console.log('   - s3:GetBucketPolicy');
      console.log('   - s3:PutBucketPublicAccessBlock');
      console.log('   - s3:GetBucketPublicAccessBlock');
      console.log('');
      console.log('   Opción 1: Añade la política "AmazonS3FullAccess" al usuario IAM');
      console.log('   Opción 2: Configura manualmente en AWS Console:');
      console.log(`      → https://s3.console.aws.amazon.com/s3/bucket/${BUCKET_NAME}`);
      console.log('      → Pestaña "Permissions"');
      console.log('      → "Block public access" → Edit → Desmarcar todo → Save');
      console.log('      → "Bucket policy" → Edit → Pegar la política JSON mostrada arriba');
    } else if (error.name === 'CredentialsError') {
      console.log('💡 Error de credenciales. Verifica en backend/.env:');
      console.log('   - AWS_ACCESS_KEY_ID');
      console.log('   - AWS_SECRET_ACCESS_KEY');
      console.log('   - AWS_REGION');
    }
    
    process.exit(1);
  }
})();
