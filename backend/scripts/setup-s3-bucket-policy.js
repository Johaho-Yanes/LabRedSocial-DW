import { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } from '@aws-sdk/client-s3';
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
    console.log(`\n🔧 Configurando política pública para el bucket: ${BUCKET_NAME}\n`);
    
    // Intentar obtener la política actual
    try {
      const getCommand = new GetBucketPolicyCommand({ Bucket: BUCKET_NAME });
      const currentPolicy = await s3Client.send(getCommand);
      console.log('📋 Política actual del bucket:');
      console.log(JSON.stringify(JSON.parse(currentPolicy.Policy), null, 2));
      console.log('');
    } catch (err) {
      if (err.name === 'NoSuchBucketPolicy') {
        console.log('ℹ️  El bucket no tiene política configurada actualmente.\n');
      } else {
        throw err;
      }
    }
    
    // Aplicar la nueva política
    const putCommand = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    });
    
    await s3Client.send(putCommand);
    
    console.log('✅ Política pública aplicada exitosamente!');
    console.log('');
    console.log('📄 Nueva política:');
    console.log(JSON.stringify(bucketPolicy, null, 2));
    console.log('');
    console.log('🌐 Ahora todas las imágenes en este bucket son públicamente accesibles.');
    console.log('');
    console.log('💡 Formato de URL pública:');
    console.log(`   https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/<ruta-al-archivo>`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Esta política permite acceso público de LECTURA.');
    console.log('   - Las imágenes serán visibles por cualquiera con la URL.');
    console.log('   - Nadie puede ELIMINAR o MODIFICAR sin credenciales AWS.');
    console.log('   - Para producción, considera usar CloudFront + Signed URLs si necesitas más control.');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error al configurar la política del bucket:');
    console.error(`   ${error.message}`);
    
    if (error.Code === 'NoSuchBucket') {
      console.log(`\n💡 El bucket "${BUCKET_NAME}" no existe. Créalo primero en AWS Console.`);
    } else if (error.Code === 'AccessDenied') {
      console.log('\n💡 Acceso denegado. Verifica que el usuario IAM tenga permisos:');
      console.log('   - s3:PutBucketPolicy');
      console.log('   - s3:GetBucketPolicy');
    } else if (error.name === 'CredentialsError') {
      console.log('\n💡 Error de credenciales. Verifica AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY en .env');
    }
    
    process.exit(1);
  }
})();
