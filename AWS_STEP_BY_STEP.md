# 🎯 Tutorial Completo: Desplegar InstaGur en AWS (Paso a Paso)

## 📋 Requisitos Previos

- [ ] Cuenta de AWS (Free Tier)
- [ ] AWS CLI instalado localmente
- [ ] Git instalado
- [ ] Node.js 18+ instalado localmente
- [ ] Repositorio en GitHub

---

## PARTE 1: Configurar MongoDB Atlas (15 minutos)

### Paso 1: Crear Cuenta y Cluster

1. Ir a: https://www.mongodb.com/cloud/atlas/register
2. Registrarse con email o Google
3. Click en "Build a Database"
4. Seleccionar **M0 (FREE)**
5. Provider: **AWS**
6. Region: **us-east-1** (Virginia)
7. Cluster Name: `instagur-cluster`
8. Click "Create"

### Paso 2: Configurar Seguridad

1. **Database Access** (usuarios):
   - Click "Add New Database User"
   - Username: `instagur_admin`
   - Password: Generar automática (GUARDAR)
   - Database User Privileges: `Atlas admin`
   - Click "Add User"

2. **Network Access** (IPs permitidas):
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

### Paso 3: Obtener Connection String

1. Click en "Connect" en tu cluster
2. Click "Connect your application"
3. Driver: **Node.js**, Version: **4.1 or later**
4. Copiar el connection string:
   ```
   mongodb+srv://instagur_admin:<password>@instagur-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Reemplazar `<password>` con la contraseña guardada
6. Agregar nombre de DB: `instagur`
   ```
   mongodb+srv://instagur_admin:TU_PASSWORD@instagur-cluster.xxxxx.mongodb.net/instagur?retryWrites=true&w=majority
   ```

✅ **GUARDAR** este string para usarlo después

---

## PARTE 2: Configurar AWS S3 para Imágenes (20 minutos)

### Paso 1: Crear Bucket S3

1. Ir a AWS Console → S3
2. Click "Create bucket"
3. Configuración:
   - Bucket name: `instagur-images-[tu-nombre-unico]`
   - AWS Region: `us-east-1`
   - **DESMARCAR** "Block all public access" ⚠️
   - Aceptar el warning
   - Click "Create bucket"

### Paso 2: Configurar CORS

1. Click en tu bucket
2. Tab "Permissions"
3. Scroll a "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Pegar:
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
6. Click "Save changes"

### Paso 3: Configurar Bucket Policy (Acceso Público)

1. Mismo bucket → Tab "Permissions"
2. Scroll a "Bucket policy"
3. Click "Edit"
4. Pegar (reemplazar `NOMBRE_DE_TU_BUCKET`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::NOMBRE_DE_TU_BUCKET/*"
       }
     ]
   }
   ```
5. Click "Save changes"

### Paso 4: Crear IAM User para Backend

1. IAM Console → Users → "Create user"
2. User name: `instagur-backend-s3`
3. Click "Next"
4. Permissions: "Attach policies directly"
5. Buscar y seleccionar: `AmazonS3FullAccess`
6. Click "Next" → "Create user"

7. **Crear Access Keys**:
   - Click en el usuario creado
   - Tab "Security credentials"
   - Scroll a "Access keys"
   - Click "Create access key"
   - Use case: "Application running outside AWS"
   - Click "Next" → "Create access key"
   - **GUARDAR**: Access Key ID y Secret Access Key

✅ **GUARDAR** estas credenciales para el backend

---

## PARTE 3: Lanzar EC2 para Backend (30 minutos)

### Paso 1: Lanzar Instancia EC2

1. EC2 Console → "Launch Instance"
2. Configuración:
   - Name: `instagur-backend`
   - AMI: **Ubuntu Server 22.04 LTS** (Free tier eligible)
   - Instance type: **t2.micro** (Free tier eligible)
   - Key pair: "Create new key pair"
     - Name: `instagur-key`
     - Type: RSA
     - Format: `.pem` (Linux/Mac) o `.ppk` (Windows PuTTY)
     - **DESCARGAR** y guardar en lugar seguro

3. **Network Settings**:
   - Click "Edit"
   - Auto-assign public IP: **Enable**
   - Firewall (Security group): "Create security group"
   - Security group name: `instagur-backend-sg`
   - **Agregar reglas**:
     - SSH (22): My IP
     - HTTP (80): Anywhere (0.0.0.0/0)
     - HTTPS (443): Anywhere (0.0.0.0/0)
     - Custom TCP (5000): Anywhere (0.0.0.0/0)

4. **Storage**: 30 GB gp3 (Free tier: 30GB)

5. Click "Launch instance"

### Paso 2: Conectar a EC2

#### Opción A: SSH desde PowerShell (Windows)
```powershell
# Dar permisos al archivo .pem
icacls "instagur-key.pem" /inheritance:r
icacls "instagur-key.pem" /grant:r "$($env:USERNAME):(R)"

# Conectar
ssh -i "instagur-key.pem" ubuntu@TU_IP_PUBLICA_EC2
```

#### Opción B: Desde AWS Console
- Click en la instancia → "Connect" → "EC2 Instance Connect" → "Connect"

### Paso 3: Configurar Servidor

Una vez conectado a EC2, ejecutar:

```bash
# 1. Descargar script de configuración
wget https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/scripts/setup-ec2-initial.sh

# 2. Dar permisos de ejecución
chmod +x setup-ec2-initial.sh

# 3. Ejecutar (como sudo)
sudo bash setup-ec2-initial.sh
```

Este script instala:
- ✅ Node.js 18
- ✅ PM2 (process manager)
- ✅ Nginx (reverse proxy)
- ✅ Certbot (SSL gratis)
- ✅ Git
- ✅ Firewall configurado

### Paso 4: Clonar Repositorio y Configurar

```bash
# Cambiar a usuario ubuntu
cd /home/ubuntu

# Clonar repositorio
git clone https://github.com/TU_USUARIO/TU_REPO.git instagur
cd instagur/backend

# Crear archivo .env
nano .env
```

**Contenido del `.env`**:
```bash
NODE_ENV=production
PORT=5000

# MongoDB Atlas (de Parte 1)
MONGODB_URI=mongodb+srv://instagur_admin:PASSWORD@instagur-cluster.xxxxx.mongodb.net/instagur?retryWrites=true&w=majority

# JWT Secret (genera uno aleatorio)
JWT_SECRET=tu_secret_key_muy_seguro_minimo_32_caracteres_aqui

# AWS S3 (de Parte 2)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET_NAME=instagur-images-tu-nombre

# Frontend URL (cambiar después)
FRONTEND_URL=http://TU_IP_EC2
```

Guardar: `Ctrl+O` → Enter → `Ctrl+X`

### Paso 5: Instalar Dependencias e Iniciar

```bash
# Instalar dependencias
npm install --production

# Iniciar con PM2
pm2 start src/server.js --name instagur-backend

# Guardar configuración PM2
pm2 save

# Ver logs
pm2 logs instagur-backend
```

### Paso 6: Configurar Nginx

```bash
# Editar configuración de Nginx
sudo nano /etc/nginx/sites-available/instagur
```

Cambiar `server_name _;` por:
```nginx
server_name TU_IP_PUBLICA_EC2;
```

```bash
# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Paso 7: Probar Backend

Abrir navegador:
```
http://TU_IP_PUBLICA_EC2/
```

Deberías ver: `{"message": "InstaGur API running"}` o similar

---

## PARTE 4: Desplegar Frontend en S3 + CloudFront (25 minutos)

### Paso 1: Crear Bucket S3 para Frontend

1. S3 Console → "Create bucket"
2. Configuración:
   - Bucket name: `instagur-frontend-[tu-nombre]`
   - Region: `us-east-1`
   - **DESMARCAR** "Block all public access"
   - Click "Create bucket"

### Paso 2: Configurar Static Website Hosting

1. Click en tu bucket
2. Tab "Properties"
3. Scroll a "Static website hosting"
4. Click "Edit"
5. Seleccionar: "Enable"
6. Index document: `index.html`
7. Error document: `index.html`
8. Click "Save changes"
9. **COPIAR** la URL del endpoint (ej: `http://bucket-name.s3-website-us-east-1.amazonaws.com`)

### Paso 3: Configurar Bucket Policy

1. Tab "Permissions" → "Bucket policy" → "Edit"
2. Pegar (reemplazar `NOMBRE_BUCKET_FRONTEND`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::NOMBRE_BUCKET_FRONTEND/*"
       }
     ]
   }
   ```

### Paso 4: Build y Deploy Frontend

En tu computadora local:

```powershell
# 1. Configurar variables de entorno del frontend
cd frontend
```

Editar `frontend/.env.production`:
```bash
VITE_API_URL=http://TU_IP_EC2/api
BACKEND_URL=http://TU_IP_EC2
```

```powershell
# 2. Build
npm run build

# 3. Instalar AWS CLI (si no lo tienes)
# Descargar de: https://aws.amazon.com/cli/

# 4. Configurar AWS CLI
aws configure
# Access Key ID: (del IAM user o crear uno nuevo)
# Secret Access Key: (del IAM user)
# Region: us-east-1
# Output: json

# 5. Subir a S3
cd dist
aws s3 sync . s3://NOMBRE_BUCKET_FRONTEND --delete
```

### Paso 5: Probar Frontend

Abrir navegador:
```
http://NOMBRE_BUCKET_FRONTEND.s3-website-us-east-1.amazonaws.com
```

✅ Deberías ver tu aplicación funcionando!

### Paso 6: Configurar CloudFront (CDN - Opcional pero recomendado)

1. CloudFront Console → "Create distribution"
2. Configuración:
   - Origin domain: Seleccionar tu bucket S3 (usar el endpoint de website)
   - Origin path: dejar vacío
   - Name: `instagur-cdn`
   - Viewer protocol policy: **Redirect HTTP to HTTPS**
   - Allowed HTTP methods: **GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE**
   - Cache policy: **CachingDisabled** (para desarrollo)
   - Price class: **Use only North America and Europe**
   - Default root object: `index.html`

3. Click "Create distribution"
4. Esperar 5-10 minutos a que se despliegue
5. Copiar "Distribution domain name" (ej: `d111111abcdef8.cloudfront.net`)

### Paso 7: Configurar Error Pages en CloudFront

1. Click en tu distribution
2. Tab "Error pages"
3. Click "Create custom error response"
4. Configurar para 404:
   - HTTP error code: **404**
   - Customize error response: **Yes**
   - Response page path: `/index.html`
   - HTTP response code: **200**
5. Click "Create"
6. Repetir para error 403

---

## PARTE 5: Configurar Dominio y SSL (Opcional - 20 minutos)

### Opción A: Usar Route 53 (AWS)

1. Route 53 → "Registered domains" → "Register domain"
2. Buscar y comprar dominio (desde $12/año)
3. Crear Hosted Zone
4. Crear Record A apuntando a IP de EC2
5. Crear Record CNAME para CloudFront

### Opción B: Usar Dominio Externo (Namecheap, GoDaddy, etc.)

1. En tu proveedor de dominios:
   - Record A: `@` → IP de EC2
   - Record CNAME: `www` → CloudFront domain

### Configurar SSL con Certbot en EC2

```bash
# Conectar a EC2
ssh -i "instagur-key.pem" ubuntu@TU_IP_EC2

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Renovación automática ya está configurada
```

---

## ✅ CHECKLIST FINAL

### Backend (EC2)
- [ ] MongoDB Atlas configurado y accesible
- [ ] S3 bucket de imágenes creado
- [ ] IAM user con permisos S3
- [ ] EC2 lanzado (t2.micro)
- [ ] Security group configurado
- [ ] Node.js, PM2, Nginx instalados
- [ ] Repositorio clonado
- [ ] .env configurado
- [ ] Backend corriendo con PM2
- [ ] Nginx como reverse proxy
- [ ] Backend accesible desde navegador

### Frontend (S3 + CloudFront)
- [ ] S3 bucket de frontend creado
- [ ] Static website hosting habilitado
- [ ] Bucket policy configurado
- [ ] Frontend build exitoso
- [ ] Archivos subidos a S3
- [ ] Frontend accesible desde S3 endpoint
- [ ] CloudFront distribution creada (opcional)
- [ ] Error pages configuradas

### Integración
- [ ] Frontend puede llamar al backend
- [ ] CORS configurado correctamente
- [ ] Registro de usuarios funciona
- [ ] Login funciona
- [ ] Upload de imágenes funciona
- [ ] Imágenes se muestran desde S3

---

## 🐛 Troubleshooting

### Backend no responde
```bash
# Ver logs de PM2
pm2 logs instagur-backend

# Reiniciar
pm2 restart instagur-backend

# Ver status de Nginx
sudo systemctl status nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### Frontend no carga
- Verificar que `VITE_API_URL` apunta a EC2
- Verificar bucket policy de S3
- Limpiar caché del navegador
- Invalidar caché de CloudFront

### Imágenes no se suben
- Verificar credenciales AWS en .env
- Verificar permisos del IAM user
- Verificar CORS en bucket S3
- Ver logs del backend

### CORS errors
```bash
# Verificar FRONTEND_URL en backend .env
# Debe coincidir con el dominio del frontend
```

---

## 💰 Costos Esperados (Free Tier)

**Primeros 12 meses**: ~$0-1/mes
- EC2 t2.micro: GRATIS (750 hrs/mes)
- S3: GRATIS (5GB + 20K GET)
- CloudFront: GRATIS (50GB transfer)
- MongoDB Atlas M0: GRATIS (siempre)
- Route 53 (opcional): $0.50/mes

**Después de 12 meses**: ~$10-15/mes
- EC2: ~$8.50/mes
- S3: ~$0.50/mes
- CloudFront: ~$2/mes
- MongoDB Atlas: GRATIS

---

## 🎉 ¡Felicidades!

Tu aplicación está desplegada en AWS con arquitectura profesional:
- ✅ Frontend en CDN global (CloudFront + S3)
- ✅ Backend escalable (EC2 + Nginx)
- ✅ Base de datos en la nube (MongoDB Atlas)
- ✅ Almacenamiento de imágenes (S3)
- ✅ SSL/HTTPS configurado
- ✅ 99.9% uptime

---

## 📚 Recursos Adicionales

- [AWS Free Tier](https://aws.amazon.com/free/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
