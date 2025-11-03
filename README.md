# 📸 InstaGur - Red Social de Imágenes

Red social moderna tipo Instagram/Imgur para compartir imágenes, construida con React, TypeScript, Node.js, Express y MongoDB.

![Stack](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Rápida](#-instalación-rápida)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Despliegue en AWS](#-despliegue-en-aws)
- [Flujo de Trabajo en Equipo](#-flujo-de-trabajo-en-equipo)
- [Solución de Problemas](#-solución-de-problemas)

---

## 🚀 Características

### ✨ Funcionalidades Principales

- **Autenticación Completa**: Registro, login y gestión de sesiones con JWT
- **Feed de Imágenes**: Grid responsivo con scroll infinito
- **Upload de Imágenes**: Subir imágenes con procesamiento en servidor (Sharp)
- **Sistema de Favoritos**: Bookmarks personales por usuario
- **Upvotes/Downvotes**: Sistema de votación con exclusividad mutua
- **Filtros Inteligentes**: 
  - Todas las imágenes
  - Recientes (ordenadas por timestamp)
  - Populares (ordenadas por votos)
- **Perfil de Usuario**: 
  - Mis Imágenes
  - Favoritos
  - Siguiendo
- **Visor de Imágenes**: Modal full-screen con navegación
- **Timestamps Inteligentes**: "justo ahora", "hace 5 min", "hace 2 hrs", "hace 3 días"
- **Navegación con Memoria**: Retorna a la vista anterior al cerrar ImageViewer
- **Diseño Responsive**: Mobile-first con Tailwind CSS

### 🎨 UI/UX

- Diseño basado en prototipo de Figma
- Iconos con Lucide React
- Componentes reutilizables con shadcn/ui
- Animaciones suaves
- Carga optimizada de imágenes

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.2.2 | Type Safety |
| Vite | 5.3.1 | Build Tool |
| Tailwind CSS | 3.4.1 | Styling |
| Lucide React | Latest | Icons |
| Axios | Latest | HTTP Client |

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 18+ | Runtime |
| Express | Latest | Web Framework |
| MongoDB | 7.0+ | Database |
| Mongoose | Latest | ODM |
| JWT | Latest | Authentication |
| Multer | Latest | File Upload |
| Sharp | Latest | Image Processing |
| bcryptjs | Latest | Password Hashing |

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

- **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
- **MongoDB** v7.0 o superior ([Descargar](https://www.mongodb.com/try/download/community))
  - Opción 1: MongoDB local (instalado en tu máquina)
  - Opción 2: MongoDB Atlas (cloud, gratis)
- **npm** (viene con Node.js)
- **Git** para clonar el repositorio

### Verificar instalación:

```powershell
node --version    # Debe ser v18 o superior
npm --version     # Cualquier versión reciente
mongod --version  # Si usas MongoDB local
```

---

## ⚡ Instalación Rápida

### 1. Clonar el repositorio

```powershell
git clone https://github.com/tu-usuario/RedSocial-Project.git
cd RedSocial-Project
```

### 2. Instalar dependencias

**⚠️ IMPORTANTE para Windows PowerShell**: Ejecutar cada comando uno por uno:

```powershell
# Dependencias raíz (scripts de npm)
npm install

# Dependencias del backend
cd backend
npm install

# Dependencias del frontend
cd ..\frontend
npm install

# Volver a la raíz
cd ..
```

### 3. Configurar variables de entorno

```powershell
# Copiar el template
Copy-Item backend\.env.example backend\.env

# Editar backend\.env con tus valores (ver sección Configuración)
notepad backend\.env
```

### 4. Iniciar MongoDB

**Opción A - MongoDB Local:**
```powershell
# En una terminal separada
mongod
```

**Opción B - MongoDB Atlas:**
- Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Crea un cluster gratuito (M0)
- Obtén tu connection string
- Úsalo en `MONGODB_URI` del `.env`

### 5. Iniciar la aplicación

```powershell
# Desde la raíz del proyecto
npm start
```

Esto iniciará:
- Backend en http://localhost:5000
- Frontend en http://localhost:3003

---

## ⚙️ Configuración

### Variables de Entorno (`backend/.env`)

Edita el archivo `backend/.env` con estos valores:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos
# Opción 1: MongoDB Local
MONGODB_URI=mongodb://localhost:27017/instagur_dev

# Opción 2: MongoDB Atlas (Cloud - Recomendado)
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority&appName=<appName>

# Autenticación (CÁMBIALO a algo seguro)
JWT_SECRET=genera_un_secreto_seguro_de_al_menos_32_caracteres

# Frontend
FRONTEND_URL=http://localhost:3003

# AWS S3 (Opcional - para almacenar imágenes en la nube)
USE_S3=false
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your-bucket-name
AWS_S3_BUCKET_NAME=your-bucket-name
```

### Generar JWT_SECRET seguro:

```powershell
# En PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado y pégalo en `JWT_SECRET`.

### 🗄️ Configurar MongoDB Atlas (Cloud Database)

**MongoDB Atlas** es la opción recomendada para desarrollo en equipo y producción. Es gratuito hasta 512MB.

#### Paso 1: Crear cuenta y cluster

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto (ej: "InstaGur")
4. Haz clic en **"Build a Database"** → **"Create"** (plan M0 Free)
5. Selecciona:
   - **Provider**: AWS (recomendado)
   - **Region**: Una cercana a tus usuarios (ej: US East 1)
   - **Cluster Name**: Puedes dejarlo por defecto o cambiarlo
6. Haz clic en **"Create Cluster"** (tarda 3-5 minutos)

#### Paso 2: Crear usuario de base de datos

1. Ve a **Database Access** (en el menú izquierdo)
2. Haz clic en **"Add New Database User"**
3. Configura:
   - **Username**: `instagur_user` (o el que prefieras)
   - **Password**: Genera una contraseña segura o usa la autogenerada (¡guárdala!)
   - **Database User Privileges**: "Read and write to any database"
4. Haz clic en **"Add User"**

#### Paso 3: Permitir acceso desde tu IP ⚠️ CRÍTICO

1. Ve a **Network Access** (en el menú izquierdo)
2. Haz clic en **"Add IP Address"**
3. Opciones:
   - **Para desarrollo local**: "Add Current IP Address" (añade tu IP actual)
   - **Para equipo**: Añade las IPs de cada miembro
   - **Temporal (NO RECOMENDADO para producción)**: "Allow Access from Anywhere" (0.0.0.0/0)
4. Haz clic en **"Confirm"**
5. ⏳ **Espera 1-2 minutos** hasta que el status cambie a "Active"

**⚠️ Error común**: Si ves este error en la consola:

```
MongooseError: Operation `users.findOne()` buffering timed out after 10000ms
❌ Could not connect to any servers in your MongoDB Atlas cluster
```

**Solución**: Tu IP no está en la whitelist. Vuelve al Paso 3 y añádela.

**Nota**: Si tu proveedor de internet (ISP) cambia tu IP frecuentemente:
- Usa "Allow Access from Anywhere" (`0.0.0.0/0`) **solo para desarrollo**
- Para producción, añade únicamente la IP de tu servidor EC2

#### Paso 4: Obtener connection string

1. Ve a **Database** → **Connect**
2. Selecciona **"Connect your application"**
3. Copia el connection string (ejemplo):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
4. Reemplaza `<username>` y `<password>` con tus credenciales
5. Añade el nombre de tu base de datos después del host, ejemplo:
   ```
   mongodb+srv://instagur_user:tu_password@cluster0.xxxxx.mongodb.net/instagur_dev?retryWrites=true&w=majority&appName=Cluster0
   ```

#### Paso 5: Actualizar `.env`

```env
MONGODB_URI=mongodb+srv://instagur_user:tu_password@cluster0.xxxxx.mongodb.net/instagur_dev?retryWrites=true&w=majority&appName=Cluster0
```

**⚠️ IMPORTANTE**: Si tu contraseña contiene caracteres especiales (`@`, `:`, `/`, etc.), debes codificarla:

```powershell
# En Node.js
node -e "console.log(encodeURIComponent('tu_password_con@caracteres'))"
```

#### Paso 6: Probar conexión

```powershell
cd backend
node .\scripts\test-db-connection.js
```

Deberías ver:
```
✅ Conectado a MongoDB Atlas: ac-xxxxx-shard-00-00.xxxxx.mongodb.net
📊 Base de datos: instagur_dev
```

---

### ☁️ Configurar AWS S3 (Cloud Storage para Imágenes)

**AWS S3** permite almacenar imágenes en la nube en lugar de localmente. Útil para producción y equipos.

#### Paso 1: Crear cuenta AWS

1. Ve a https://aws.amazon.com/
2. Crea una cuenta gratuita (requiere tarjeta de crédito, pero el tier gratuito incluye 5GB en S3)
3. Accede a la consola: https://console.aws.amazon.com/

#### Paso 2: Crear bucket S3

1. Ve a **S3** en la consola AWS
2. Haz clic en **"Create bucket"**
3. Configura:
   - **Bucket name**: `instagur-images-dev` (debe ser único globalmente)
   - **Region**: La misma que usarás para EC2 (ej: `us-east-2`)
   - **Block Public Access**: Desmarca todas las opciones (las imágenes serán públicas)
   - **Bucket Versioning**: Disabled (para desarrollo)
4. Haz clic en **"Create bucket"**

#### Paso 3: Configurar política de bucket (hacer público)

1. Ve al bucket recién creado
2. Tab **"Permissions"** → **"Bucket Policy"**
3. Añade esta política (reemplaza `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. Guarda cambios

#### Paso 4: Crear usuario IAM con permisos S3

1. Ve a **IAM** en la consola AWS
2. **Users** → **"Add users"**
3. Configura:
   - **User name**: `instagur-s3-user`
   - **Access type**: "Access key - Programmatic access"
4. **Permissions**: "Attach existing policies directly"
   - Busca y selecciona: **AmazonS3FullAccess** (o crea una política más restrictiva)
5. **Create user**
6. **⚠️ IMPORTANTE**: Guarda las credenciales:
   - **Access Key ID**: `AKIAXXXXXXXXXXXXXXXX`
   - **Secret Access Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Solo se muestran una vez, guárdalas de forma segura

#### Paso 5: Actualizar `.env`

```env
USE_S3=true
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
S3_BUCKET=instagur-images-dev
AWS_S3_BUCKET_NAME=instagur-images-dev
```

#### Paso 6: Probar S3 (subir una imagen desde la app)

1. Inicia la aplicación: `npm start`
2. Regístrate/inicia sesión
3. Sube una imagen
4. Verifica en la consola de S3 que la imagen aparece en el bucket

---

### 🔐 Rotación de Credenciales (Seguridad)

**Para producción**, es importante rotar credenciales periódicamente:

#### MongoDB Atlas:
1. **Database Access** → Edita el usuario → "Edit Password"
2. Genera nueva contraseña
3. Actualiza `MONGODB_URI` en producción

#### AWS IAM:
1. **IAM** → **Users** → `instagur-s3-user` → **Security credentials**
2. **Create access key** (nueva)
3. Actualiza `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` en producción
4. **Delete** las credenciales antiguas después de verificar que las nuevas funcionan

**⚠️ NUNCA** subas credenciales reales a Git. Usa variables de entorno o servicios como:
- AWS Secrets Manager
- AWS Systems Manager Parameter Store
- Variables de entorno en Elastic Beanstalk/ECS

---

---

## 🚀 Uso

### Iniciar todo (Recomendado)

```powershell
npm start
```

### Iniciar por separado

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Acceder a la aplicación

- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

### Scripts disponibles

Desde la raíz:
```powershell
npm start          # Inicia backend + frontend
npm run dev        # Modo desarrollo con hot-reload
```

Desde `backend/`:
```powershell
npm start          # Inicia servidor
npm run dev        # Modo desarrollo con nodemon
```

Desde `frontend/`:
```powershell
npm run dev        # Inicia Vite dev server
npm run build      # Build de producción
npm run preview    # Preview del build
```

---

## 📁 Estructura del Proyecto

```
RedSocial-Project/
│
├── backend/                    # Servidor Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # Conexión MongoDB
│   │   ├── controllers/
│   │   │   ├── imageController.js  # CRUD imágenes, upvote/downvote
│   │   │   └── userController.js   # Auth, perfil, favoritos
│   │   ├── middleware/
│   │   │   ├── auth.js         # Verificación JWT
│   │   │   └── upload.js       # Multer config
│   │   ├── models/
│   │   │   ├── Image.js        # Schema de imágenes
│   │   │   └── User.js         # Schema de usuarios
│   │   ├── routes/
│   │   │   ├── imageRoutes.js  # /api/images
│   │   │   ├── userRoutes.js   # /api/users
│   │   │   └── index.js        # Router principal
│   │   └── server.js           # Entry point
│   ├── uploads/                # Imágenes subidas (gitignored excepto .gitkeep)
│   ├── .env                    # Variables de entorno (NO en Git)
│   ├── .env.example            # Template de .env
│   └── package.json
│
├── frontend/                   # Aplicación React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── figma/          # Componentes principales
│   │   │   │   ├── HomePage.tsx        # Feed principal
│   │   │   │   ├── LoginPage.tsx       # Login/Registro
│   │   │   │   ├── UserProfile.tsx     # Perfil con tabs
│   │   │   │   ├── ImageViewer.tsx     # Modal de imagen
│   │   │   │   ├── ImageThumbnail.tsx  # Card de imagen
│   │   │   │   └── UploadModal.tsx     # Modal de upload
│   │   │   └── ui/             # Componentes shadcn/ui
│   │   ├── services/
│   │   │   ├── authService.ts  # Login, registro, auth
│   │   │   ├── imageService.ts # CRUD imágenes, votos
│   │   │   └── userService.ts  # Favoritos, perfil
│   │   ├── lib/
│   │   │   ├── api.ts          # Axios instance
│   │   │   └── utils.ts        # Helpers
│   │   ├── styles/
│   │   │   └── globals.css     # Tailwind + custom
│   │   ├── App.tsx             # Router y state principal
│   │   └── main.tsx            # Entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── scripts/                    # Scripts de deployment (futuro)
│   ├── deploy-eb.ps1           # AWS Elastic Beanstalk
│   ├── deploy-ecs.ps1          # AWS ECS
│   └── deploy-s3-cloudfront.ps1
│
├── .gitignore                  # Configurado para trabajo en equipo
├── docker-compose.yml          # Docker config (opcional)
├── Dockerfile                  # Docker config (opcional)
├── package.json                # Scripts raíz
└── README.md                   # Este archivo
```

---

## 🔐 API Endpoints

### Autenticación (`/api/users`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registro de usuario | ❌ |
| POST | `/login` | Inicio de sesión | ❌ |
| GET | `/profile` | Obtener perfil propio | ✅ |
| PUT | `/profile` | Actualizar perfil | ✅ |
| GET | `/:username` | Obtener perfil público | ❌ |

### Favoritos (`/api/users`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/favorites` | Obtener favoritos del usuario | ✅ |
| POST | `/favorites/:imageId` | Toggle favorito | ✅ |

### Imágenes (`/api/images`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Listar todas las imágenes | ❌ |
| GET | `/:id` | Obtener imagen específica | ❌ |
| POST | `/upload` | Subir nueva imagen | ✅ |
| DELETE | `/:id` | Eliminar imagen | ✅ |
| POST | `/:id/upvote` | Dar upvote (quita downvote si existe) | ✅ |
| POST | `/:id/downvote` | Dar downvote (quita upvote si existe) | ✅ |

### Formato de Autenticación

Incluir en headers:
```
Authorization: Bearer <tu_token_jwt>
```

---

## ☁️ Despliegue en AWS

Para desplegar en producción en AWS, consulta la documentación detallada:

📄 **Ver `README_DEPLOYMENT.md`** para guías completas de:

### Opción Recomendada: EC2 + S3 + MongoDB Atlas

1. **EC2 t2.micro** (gratis 12 meses) - Backend Node.js
2. **S3** - Almacenamiento de imágenes
3. **MongoDB Atlas M0** (gratis) - Base de datos
4. **IAM** - Permisos de acceso

### Pasos generales:

1. Crear cuenta AWS
2. Configurar MongoDB Atlas
3. Crear bucket S3
4. Lanzar instancia EC2
5. Configurar variables de entorno de producción
6. Deploy con scripts en `/scripts`

**Tiempo estimado**: 2-3 horas primera vez

---

## 👥 Flujo de Trabajo en Equipo

### Primera vez (nuevo miembro del equipo)

```powershell
# 1. Clonar el repo
git clone https://github.com/tu-usuario/RedSocial-Project.git
cd RedSocial-Project

# 2. Instalar dependencias
npm install
cd backend
npm install
cd ..\frontend
npm install
cd ..

# 3. Configurar entorno
Copy-Item backend\.env.example backend\.env
notepad backend\.env  # Editar con tus valores

# 4. Crear rama de trabajo
git checkout -b feature/mi-funcionalidad

# 5. Iniciar MongoDB local
mongod  # En otra terminal

# 6. Iniciar aplicación
npm start
```

### Ciclo de desarrollo

```powershell
# 1. Actualizar desde main
git checkout main
git pull origin main

# 2. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 3. Hacer cambios y commits frecuentes
git add .
git commit -m "feat: descripción clara del cambio"

# 4. Push a tu rama
git push origin feature/nueva-funcionalidad

# 5. Abrir Pull Request en GitHub

# 6. Después de merge, limpiar
git checkout main
git pull origin main
git branch -d feature/nueva-funcionalidad
```

### Convención de commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato, punto y coma, etc
refactor: refactorización de código
test: agregar tests
chore: mantenimiento
```

### Archivos importantes en .gitignore

✅ **Se ignoran** (no se suben a Git):
- `node_modules/` - Dependencias (se reinstalan con npm install)
- `.env` - Variables de entorno con secretos
- `backend/uploads/*` - Imágenes subidas por usuarios
- `*.pem`, `*.key` - Credenciales de AWS
- `dist/`, `build/` - Archivos compilados

✅ **Se incluyen** (sí se suben):
- `.env.example` - Template sin valores reales
- `backend/uploads/.gitkeep` - Para preservar la carpeta
- `package.json`, `package-lock.json` - Para reproducir dependencias

---

## 🐛 Solución de Problemas

### Error: "MongooseError: buffering timed out" o "Could not connect to any servers"

**Síntomas:**
```
MongooseError: Operation `users.findOne()` buffering timed out after 10000ms
❌ Could not connect to any servers in your MongoDB Atlas cluster
```

**Causa:** Tu dirección IP no está en la whitelist de MongoDB Atlas.

**Solución:**
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Selecciona tu proyecto → **Network Access** (menú izquierdo)
3. Haz clic en **"Add IP Address"**
4. Opciones:
   - **"Add Current IP Address"** (recomendado para desarrollo)
   - **"Allow Access from Anywhere"** (0.0.0.0/0) - solo para desarrollo/testing
5. Haz clic en **"Confirm"**
6. ⏳ Espera 1-2 minutos hasta que el status sea "Active"
7. Reinicia tu aplicación

**Nota:** Si tu ISP cambia tu IP frecuentemente, usa "Allow Access from Anywhere" para desarrollo local.

---

### Error: "Cannot connect to MongoDB" (local)

```powershell
# Verificar que MongoDB está corriendo
mongod

# O verificar el URI de Atlas en .env
# MONGODB_URI debe estar correctamente configurado
```

### Error: "Port 5000 already in use"

```powershell
# Cambiar puerto en backend/.env
PORT=5001

# O matar el proceso en el puerto
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Error: "JWT secret missing"

```
# Asegúrate de tener JWT_SECRET en backend/.env
JWT_SECRET=tu_secreto_aqui_cambialo
```

### Frontend no conecta con Backend

```powershell
# Verificar CORS en backend/src/server.js
# Debe incluir http://localhost:3003

# Verificar API_URL en frontend/src/lib/api.ts
# Debe apuntar a http://localhost:5000
```

### Las imágenes no se suben

```powershell
# Verificar que existe la carpeta uploads
mkdir backend\uploads

# Verificar permisos de escritura
# La carpeta debe ser escribible
```

### `npm install` falla

```powershell
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Error de TypeScript en frontend

```powershell
# Reinstalar dependencias de tipos
cd frontend
npm install --save-dev @types/react @types/react-dom

# Verificar tsconfig.json
```

---

## 📚 Recursos Adicionales

- **MongoDB**: [Documentación oficial](https://www.mongodb.com/docs/)
- **Express**: [Guía de Express](https://expressjs.com/)
- **React**: [Docs de React](https://react.dev/)
- **Tailwind CSS**: [Docs de Tailwind](https://tailwindcss.com/docs)
- **AWS**: [Guías de AWS](https://docs.aws.amazon.com/)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

Desarrollado con ❤️ por el equipo de InstaGur

---

## 📞 Soporte

¿Problemas? Abre un [Issue](https://github.com/tu-usuario/RedSocial-Project/issues) en GitHub.
