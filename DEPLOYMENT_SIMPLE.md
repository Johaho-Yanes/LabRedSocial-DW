# 🚀 Despliegue Rápido y GRATIS - Alternativas Simples

## ⚡ Opción 1: Vercel + Render + MongoDB Atlas (GRATIS PERMANENTE)

### 📊 Resumen
- **Dificultad**: ⭐ Muy Fácil
- **Tiempo**: 15-20 minutos
- **Costo**: $0 (con limitaciones razonables)
- **Ideal para**: Proyectos personales, portafolio, demos

### 🎯 Arquitectura
```
Frontend (Vercel) → Backend (Render) → MongoDB Atlas
                          ↓
                    Cloudinary (Imágenes)
```

### ✅ Ventajas
- ✅ Totalmente gratis (siempre)
- ✅ Deploy automático con Git
- ✅ HTTPS gratis
- ✅ Dominio gratis (.vercel.app, .onrender.com)
- ✅ Sin tarjeta de crédito
- ✅ Setup en minutos

### ⚠️ Limitaciones
- ⚠️ Backend duerme después de 15 min inactividad (tarda 30s en despertar)
- ⚠️ 750 horas/mes de backend (25 días activo 24/7)
- ⚠️ 512MB RAM en backend
- ⚠️ 100GB bandwidth/mes
- ⚠️ Imágenes: 25GB storage en Cloudinary

---

## 📝 TUTORIAL PASO A PASO - Opción 1

### PASO 1: MongoDB Atlas (5 min) ✅ GRATIS SIEMPRE

1. Ir a https://www.mongodb.com/cloud/atlas/register
2. Registrarse (gratis, sin tarjeta)
3. Create Database → M0 (FREE) → AWS → us-east-1
4. Database Access → Add User → username: `admin`, password: (guardar)
5. Network Access → Add IP → 0.0.0.0/0 (permitir todos)
6. Connect → Connect your application → Copiar string:
   ```
   mongodb+srv://admin:PASSWORD@cluster.mongodb.net/instagur?retryWrites=true&w=majority
   ```

✅ **GUARDAR** connection string

---

### PASO 2: Cloudinary para Imágenes (5 min) ✅ GRATIS SIEMPRE

1. Ir a https://cloudinary.com/users/register_free
2. Registrarse (gratis, sin tarjeta)
3. Dashboard → Product Environment Credentials
4. Copiar:
   - Cloud Name
   - API Key
   - API Secret

Límites Free:
- 25GB storage
- 25GB bandwidth/mes
- Transformaciones ilimitadas

✅ **GUARDAR** credenciales

---

### PASO 3: Configurar Backend para Cloudinary (10 min)

Instalar dependencia:
```powershell
cd backend
npm install cloudinary
```

Crear `backend/src/config/cloudinary.js`:
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

Actualizar `backend/.env`:
```bash
# MongoDB Atlas
MONGODB_URI=mongodb+srv://admin:PASSWORD@cluster.mongodb.net/instagur

# JWT
JWT_SECRET=tu_secret_muy_largo_y_seguro_minimo_32_caracteres

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# CORS
FRONTEND_URL=http://localhost:3003
```

---

### PASO 4: Desplegar Backend en Render.com (10 min) ✅ GRATIS

1. Ir a https://render.com/
2. Sign Up con GitHub
3. Dashboard → New → Web Service
4. Connect repository: Selecciona tu repo
5. Configuración:
   - Name: `instagur-backend`
   - Region: Oregon (US West)
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
   - Instance Type: **Free**

6. Environment Variables → Add:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=(pegar tu connection string)
   JWT_SECRET=(tu secret)
   CLOUDINARY_CLOUD_NAME=(tu cloud name)
   CLOUDINARY_API_KEY=(tu api key)
   CLOUDINARY_API_SECRET=(tu api secret)
   FRONTEND_URL=https://instagur.vercel.app (cambiar después)
   ```

7. Click "Create Web Service"
8. Esperar 2-5 minutos (se despliega automáticamente)
9. Copiar URL del backend: `https://instagur-backend.onrender.com`

✅ Backend desplegado!

---

### PASO 5: Desplegar Frontend en Vercel (10 min) ✅ GRATIS

1. Ir a https://vercel.com/
2. Sign Up con GitHub
3. Add New → Project
4. Import tu repositorio
5. Configuración:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. Environment Variables → Add:
   ```
   VITE_API_URL=https://instagur-backend.onrender.com/api
   BACKEND_URL=https://instagur-backend.onrender.com
   ```

7. Click "Deploy"
8. Esperar 2-3 minutos
9. Copiar URL del frontend: `https://instagur.vercel.app`

✅ Frontend desplegado!

---

### PASO 6: Actualizar CORS en Backend (5 min)

1. Render.com → Tu servicio → Environment
2. Editar `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://instagur.vercel.app
   ```
3. Click "Save Changes"
4. El servicio se redesplegará automáticamente

✅ Todo conectado!

---

## 🎉 ¡LISTO! - Aplicación Desplegada

### URLs de tu aplicación:
- **Frontend**: https://instagur.vercel.app
- **Backend**: https://instagur-backend.onrender.com

### Auto-Deploy:
- Cada push a GitHub redespliega automáticamente
- Frontend: ~1 min
- Backend: ~2-3 min

### Monitoreo:
- Vercel Dashboard: Ver logs y analytics
- Render Dashboard: Ver logs y uptime
- MongoDB Atlas: Ver queries y performance

---

## ⚡ Opción 2: Railway.app (GRATIS + Mejor Performance)

### 📊 Resumen
- **Dificultad**: ⭐⭐ Fácil
- **Tiempo**: 15 minutos
- **Costo**: $0 (trial de $5 crédito gratis)
- **Ideal para**: Mejor que Render, sin sleep

### ✅ Ventajas
- ✅ NO duerme (siempre activo)
- ✅ Deploy automático
- ✅ Incluye PostgreSQL/MongoDB
- ✅ HTTPS gratis
- ✅ Logs en tiempo real

### ⚠️ Limitaciones
- ⚠️ $5 de crédito gratis (dura ~1 mes)
- ⚠️ Después: $5/mes por proyecto

---

## 📝 TUTORIAL - Railway.app

### PASO 1: Sign Up en Railway

1. Ir a https://railway.app/
2. Sign Up con GitHub
3. Verificar email

### PASO 2: Deploy Backend

1. Dashboard → New Project → Deploy from GitHub repo
2. Seleccionar tu repositorio
3. Railway detecta Node.js automáticamente
4. Settings:
   - Root Directory: `backend`
   - Start Command: `node src/server.js`

5. Variables → Add:
   ```
   NODE_ENV=production
   MONGODB_URI=tu_connection_string
   JWT_SECRET=tu_secret
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   PORT=5000
   ```

6. Generate Domain → Copiar URL

### PASO 3: Deploy Frontend

1. Same project → New Service → GitHub Repo
2. Settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Start Command: `npx serve -s dist -p $PORT`

3. Variables:
   ```
   VITE_API_URL=https://backend-url.railway.app/api
   ```

4. Generate Domain

✅ Desplegado en Railway!

---

## 💡 Comparación de Opciones

| Característica | Vercel + Render | Railway | AWS EC2 |
|---------------|----------------|---------|---------|
| **Costo** | $0 siempre | $0-5/mes | $0 (12 meses) → $10/mes |
| **Setup** | 20 min | 15 min | 60 min |
| **Dificultad** | ⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Backend Sleep** | Sí (15 min) | No | No |
| **Auto Deploy** | Sí | Sí | Manual |
| **Escalabilidad** | Limitada | Media | Alta |
| **HTTPS** | Gratis | Gratis | Manual (Certbot) |
| **Logs** | Básicos | Completos | Completos |
| **Dominio custom** | Gratis | Gratis | Route 53 ($0.50/mes) |

---

## 🎯 Recomendación Final

### Para ti (proyecto personal/portafolio):
**→ Opción 1: Vercel + Render + MongoDB Atlas**

**Razones**:
1. ✅ Totalmente gratis para siempre
2. ✅ Deploy super rápido (20 min)
3. ✅ Auto-deploy con Git push
4. ✅ No necesitas conocer AWS
5. ✅ Suficiente para demos y portafolio
6. ⚠️ Backend duerme (30s delay primera request) - no es problema para demos

### Si necesitas mejor performance:
**→ Opción 2: Railway.app**
- No duerme
- $5/mes después del trial

### Si quieres aprender AWS:
**→ Opción 3: AWS EC2**
- Más complejo pero gratis 12 meses
- Buen para CV
- Control total

---

## 🚀 Próximos Pasos Recomendados

### AHORA MISMO:
1. ✅ Deploy en Vercel + Render (20 min)
2. ✅ Probar que funciona
3. ✅ Agregar a portafolio/CV

### DESPUÉS (Opcional):
1. Dominio custom (Namecheap ~$10/año)
2. Analytics (Google Analytics gratis)
3. Migrar a Railway si necesitas mejor performance
4. Aprender AWS cuando tengas tiempo

---

## 📚 Scripts Incluidos

He creado todos los scripts necesarios en `scripts/`:
- ✅ `deploy-vercel.md` - Guía Vercel
- ✅ `deploy-render.md` - Guía Render
- ✅ `deploy-railway.md` - Guía Railway
- ✅ `setup-cloudinary.md` - Configurar Cloudinary

---

## ❓ FAQ

**P: ¿Por qué el backend duerme en Render?**
R: Free tier de Render apaga servicios después de 15 min sin requests. Primera request tarda ~30s en despertar.

**P: ¿Cómo evitar el sleep?**
R: 
- Opción 1: Usar Railway ($5/mes, no duerme)
- Opción 2: Hacer ping cada 10 min con cron-job.org (gratis)
- Opción 3: Aceptarlo para demos (no es problema)

**P: ¿Cuánto tráfico soporta?**
R: Render Free: ~100 usuarios/día. Suficiente para portafolio.

**P: ¿Puedo usar mi propio dominio?**
R: Sí, Vercel y Render permiten dominios custom gratis.

**P: ¿Necesito tarjeta de crédito?**
R: No para Vercel, Render Free, MongoDB Atlas, Cloudinary.

---

## 🎉 ¡Elige tu opción y empecemos!

¿Cuál prefieres?
1. **Vercel + Render** (rápido y gratis)
2. **Railway** (mejor performance)
3. **AWS EC2** (aprendizaje completo)

Te guío paso a paso con la que elijas 🚀
