# 🚀 Plan de Despliegue AWS - InstaGur (Capa Gratuita)

## 📋 Resumen de Arquitectura AWS Free Tier

### Servicios a Utilizar (GRATIS por 12 meses)

1. **Frontend**: AWS S3 + CloudFront
   - S3: Hosting estático (5GB almacenamiento)
   - CloudFront: CDN global (50GB transferencia/mes)
   
2. **Backend**: AWS EC2 t2.micro
   - 750 horas/mes (suficiente para 1 instancia 24/7)
   - 1 vCPU, 1GB RAM
   - 30GB SSD storage

3. **Base de Datos**: MongoDB Atlas (Free Tier)
   - 512MB storage (compartido)
   - Alternativa: DynamoDB (25GB gratis siempre)

4. **Almacenamiento de Imágenes**: AWS S3
   - 5GB almacenamiento
   - 20,000 GET requests/mes
   - 2,000 PUT requests/mes

5. **Extras**:
   - Route 53: DNS ($0.50/mes por zona)
   - Certificate Manager: SSL gratis
   - Elastic IP: 1 IP estática gratis

---

## 🎯 Arquitectura Final

```
[Usuario] 
    ↓
[CloudFront CDN] → [S3 Bucket - Frontend React]
    ↓
[EC2 Instance - Backend Node.js] 
    ↓
[MongoDB Atlas / DynamoDB]
    ↓
[S3 Bucket - Imágenes/Avatares]
```

---

## 📝 Plan de Implementación (Paso a Paso)

### FASE 1: Preparar Base de Datos (10 min)

#### Opción A: MongoDB Atlas (Recomendado - Compatible actual)
1. ✅ Ir a https://www.mongodb.com/cloud/atlas/register
2. ✅ Crear cluster gratis (M0 Sandbox - 512MB)
3. ✅ Configurar usuario y password
4. ✅ Whitelist IP: 0.0.0.0/0 (permitir todas)
5. ✅ Obtener connection string: `mongodb+srv://user:pass@cluster.mongodb.net/instagur`

#### Opción B: DynamoDB (Siempre gratis - Requiere migración)
- 25GB storage + 200M requests/mes (siempre gratis)
- Requiere cambiar modelos Mongoose → DynamoDB SDK

**Recomendación**: Usar MongoDB Atlas para no cambiar código existente.

---

### FASE 2: Configurar S3 para Imágenes (15 min)

1. **Crear Bucket S3 para imágenes**
   ```bash
   # En AWS Console:
   # - Nombre: instagur-images-[tu-nombre]
   # - Region: us-east-1
   # - Desbloquear acceso público
   # - Habilitar versionado
   ```

2. **Configurar CORS en S3**
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

3. **Crear IAM User para S3**
   - Permisos: `AmazonS3FullAccess`
   - Guardar: Access Key ID + Secret Access Key

---

### FASE 3: Preparar Backend para Producción (20 min)

1. **Actualizar código para usar S3**
2. **Configurar variables de entorno**
3. **Crear script de deployment**

---

### FASE 4: Desplegar Backend en EC2 (30 min)

1. **Lanzar EC2 t2.micro**
   - AMI: Ubuntu 22.04 LTS
   - Security Group: Puertos 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (Backend)

2. **Instalar dependencias en EC2**
   ```bash
   # Node.js 18
   # PM2 (gestor de procesos)
   # Nginx (reverse proxy)
   # Certbot (SSL gratis)
   ```

3. **Configurar Nginx como reverse proxy**

4. **Configurar dominio y SSL**

---

### FASE 5: Desplegar Frontend en S3 + CloudFront (20 min)

1. **Build del frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Subir a S3**

3. **Crear CloudFront distribution**

4. **Configurar dominio**

---

## 💰 Costos Estimados

### ✅ GRATIS (primeros 12 meses):
- EC2 t2.micro: $0
- S3 (hasta 5GB): $0
- CloudFront (hasta 50GB): $0
- MongoDB Atlas M0: $0 (siempre gratis)
- Certificate Manager SSL: $0

### 💵 Costos mínimos:
- Route 53 (DNS): ~$0.50/mes
- **TOTAL**: < $1/mes durante 12 meses

### 📊 Después de 12 meses:
- EC2 t2.micro: ~$8.50/mes
- S3: ~$0.50/mes (con poco tráfico)
- CloudFront: ~$2/mes
- **TOTAL**: ~$11-15/mes

---

## 🔧 Alternativas para REDUCIR COSTOS

### Opción 1: Todo en Vercel/Netlify (Frontend + Backend)
- **Frontend**: Vercel/Netlify (gratis siempre)
- **Backend**: Render.com Free Tier (750hrs/mes, duerme después de 15min inactividad)
- **DB**: MongoDB Atlas M0 (gratis siempre)
- **Imágenes**: Cloudinary Free Tier (25GB/mes)
- **COSTO**: $0 permanente (con limitaciones)

### Opción 2: AWS Amplify + Lambda
- **Frontend**: Amplify Hosting (gratis hasta 15GB)
- **Backend**: Lambda Functions (1M requests gratis/mes)
- **DB**: DynamoDB (25GB gratis siempre)
- **Imágenes**: S3 (5GB gratis 12 meses)
- **COSTO**: ~$0-2/mes

### Opción 3: Railway.app
- **Full Stack**: $5/mes (Backend + DB + Frontend)
- **Sin límite de tiempo**
- **Auto-scaling**

---

## ✅ Próximos Pasos Recomendados

### Opción A: AWS Completo (Aprendizaje + Control)
1. Preparar backend para S3
2. Configurar MongoDB Atlas
3. Desplegar en EC2
4. Frontend en S3+CloudFront

### Opción B: Híbrido Fácil (Rápido + Gratis)
1. Frontend → Vercel/Netlify
2. Backend → Render.com
3. DB → MongoDB Atlas
4. Imágenes → Cloudinary

### Opción C: Serverless AWS (Escalable)
1. Frontend → Amplify
2. Backend → Lambda + API Gateway
3. DB → DynamoDB
4. Imágenes → S3

---

## 🤔 ¿Qué opción prefieres?

**Para aprender AWS y tener control completo**: Opción A
**Para desplegar rápido y gratis para siempre**: Opción B
**Para escalar fácilmente en el futuro**: Opción C

---

## 📚 Recursos y Documentación

- [AWS Free Tier](https://aws.amazon.com/free/)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas/register)
- [Vercel Deployment](https://vercel.com/docs)
- [Render.com Free Tier](https://render.com/docs/free)

