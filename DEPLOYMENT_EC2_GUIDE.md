# 🚀 Guía de Deployment a EC2 - InstaGur

**Fecha:** Noviembre 2025  
**Estado:** Listo para desplegar

---

## ✅ Pre-requisitos COMPLETADOS

- ✅ MongoDB Atlas configurado: `dw-5090223003.0nsmifa.mongodb.net`
- ✅ AWS S3 bucket configurado: `tuapp-dev-bucket` (us-east-2)
- ✅ Credenciales AWS IAM disponibles
- ✅ Código local funcionando con cloud services
- ✅ Variables de entorno configuradas

---

## 📋 PASO A PASO - Deployment a EC2

### PASO 1: Lanzar Instancia EC2 (10 minutos)

#### 1.1 Ir a AWS Console
- Ir a: https://console.aws.amazon.com/ec2/
- Asegúrate de estar en región **us-east-2** (Ohio) - misma que S3

#### 1.2 Launch Instance
Click en **"Launch Instance"** (botón naranja)

#### 1.3 Configurar instancia:

**Name and tags:**
```
Name: instagur-backend-prod
```

**Application and OS Images (AMI):**
- Quick Start: **Ubuntu**
- AMI: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**
- Architecture: **64-bit (x86)**
- ✅ Free tier eligible

**Instance type:**
- **t2.micro** (1 vCPU, 1 GiB Memory)
- ✅ Free tier eligible

**Key pair (login):**
- Click **"Create new key pair"**
- Key pair name: `instagur-key`
- Key pair type: **RSA**
- Private key file format: **`.pem`** (para SSH en PowerShell)
- Click **"Create key pair"**
- ⚠️ **GUARDA EL ARCHIVO** en un lugar seguro (ej: `C:\Users\johao\.ssh\instagur-key.pem`)

**Network settings:**
- Click **"Edit"**
- Auto-assign public IP: **Enable**
- Firewall (Security group): **Create security group**
- Security group name: `instagur-backend-sg`
- Description: `Security group for InstaGur backend`

**Agregar reglas de seguridad:**
1. SSH (ya está por defecto):
   - Type: SSH
   - Port: 22
   - Source: **My IP** (tu IP actual - más seguro)
   
2. Click **"Add security group rule"** y agregar:
   - Type: HTTP
   - Port: 80
   - Source: **Anywhere** (0.0.0.0/0)
   
3. Click **"Add security group rule"** y agregar:
   - Type: HTTPS
   - Port: 443
   - Source: **Anywhere** (0.0.0.0/0)

4. Click **"Add security group rule"** y agregar (para testing):
   - Type: Custom TCP
   - Port: 5000
   - Source: **Anywhere** (0.0.0.0/0)
   - Description: Node.js backend

**Configure storage:**
- Size (GiB): **30** (máximo free tier)
- Volume Type: **gp3** (más rápido que gp2)
- ✅ Free tier: Up to 30 GB

**Advanced details:**
- Dejar todo por defecto

#### 1.4 Lanzar
- Click **"Launch instance"**
- Espera ~2 minutos
- Click en el Instance ID para ver detalles
- **COPIA LA IP PÚBLICA** (ej: `18.222.123.45`)

---

### PASO 2: Conectar a EC2 desde PowerShell (5 minutos)

#### 2.1 Configurar permisos del archivo .pem

Abre **PowerShell como Administrador**:

```powershell
# Navegar a donde guardaste la key
cd C:\Users\johao\.ssh

# Ver el archivo
dir instagur-key.pem

# Dar permisos SOLO a tu usuario (importante para seguridad)
icacls instagur-key.pem /inheritance:r
icacls instagur-key.pem /grant:r "$($env:USERNAME):(R)"

# Verificar permisos (debe mostrar solo tu usuario)
icacls instagur-key.pem
```

#### 2.2 Conectar por SSH

```powershell
# Reemplaza TU_IP_PUBLICA con la IP de tu instancia EC2
ssh -i "instagur-key.pem" ubuntu@TU_IP_PUBLICA
```

Si pregunta "Are you sure you want to continue connecting?", escribe: **yes**

Deberías ver:
```
Welcome to Ubuntu 22.04 LTS
ubuntu@ip-172-31-xx-xx:~$
```

✅ ¡Conectado!

---

### PASO 3: Configurar Servidor (15 minutos)

#### 3.1 Actualizar sistema

```bash
# Actualizar lista de paquetes
sudo apt update

# Actualizar paquetes instalados
sudo apt upgrade -y
```

#### 3.2 Instalar Node.js 22 (versión LTS)

```bash
# Descargar script de instalación de NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v22.x.x
npm --version   # Debe mostrar 10.x.x
```

#### 3.3 Instalar PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar instalación
pm2 --version

# Configurar PM2 para auto-start en reinicio
pm2 startup systemd
# COPIAR Y EJECUTAR el comando que muestra (algo como: sudo env PATH=...)
# Ejecutar ese comando
```

#### 3.4 Instalar Nginx (Reverse Proxy)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Verificar que está corriendo
sudo systemctl status nginx
# Presiona 'q' para salir

# Habilitar Nginx en startup
sudo systemctl enable nginx
```

#### 3.5 Instalar Git

```bash
# Instalar Git
sudo apt install -y git

# Verificar
git --version
```

---

### PASO 4: Clonar Repositorio y Configurar (10 minutos)

#### 4.1 Configurar Git (si el repo es privado)

```bash
# Configurar tu usuario de GitHub
git config --global user.name "Johaho-Yanes"
git config --global user.email "tu_email@ejemplo.com"

# Si el repo es privado, necesitarás un Personal Access Token
# Crear en: https://github.com/settings/tokens
# Scopes: repo (todos los checkboxes)
```

#### 4.2 Clonar repositorio

```bash
# Navegar a home
cd /home/ubuntu

# Clonar repositorio
git clone https://github.com/Johaho-Yanes/LabRedSocial-DW.git

# Si es privado:
# git clone https://TU_TOKEN@github.com/Johaho-Yanes/LabRedSocial-DW.git

# Entrar al directorio
cd LabRedSocial-DW/backend
```

#### 4.3 Crear archivo .env de producción

```bash
# Crear archivo .env
nano .env
```

**Pega esto y EDITA LOS VALORES:**

```bash
# Servidor
PORT=5000
NODE_ENV=production

# MongoDB Atlas (YA CONFIGURADO - copiar de tu .env local)
MONGODB_URI=mongodb+srv://jyanesg2_db_user:Y2ZTbhTbK6ZKtPXi@dw-5090223003.0nsmifa.mongodb.net/instagur_dev?retryWrites=true&w=majority&appName=DW-5090223003

# JWT Secret (GENERAR UNO NUEVO PARA PRODUCCIÓN)
JWT_SECRET=GENERA_UNO_NUEVO_AQUI_MINIMO_32_CARACTERES_SUPER_SEGURO_2025

# Frontend URL (cambiar después cuando despliegues frontend)
FRONTEND_URL=http://TU_IP_EC2

# AWS S3 - REEMPLAZAR CON TUS CREDENCIALES
USE_S3=true
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=TU_AWS_ACCESS_KEY_AQUI
AWS_SECRET_ACCESS_KEY=TU_AWS_SECRET_KEY_AQUI
S3_BUCKET=tu-bucket-name
AWS_S3_BUCKET_NAME=tu-bucket-name
```

**Guardar archivo:**
- `Ctrl + O` → Enter (guardar)
- `Ctrl + X` (salir)

**IMPORTANTE - Generar JWT_SECRET nuevo:**
```bash
# En la terminal de EC2, generar un secret seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar el resultado y reemplazar en .env
nano .env
# Pegar el nuevo JWT_SECRET
# Guardar: Ctrl+O, Enter, Ctrl+X
```

#### 4.4 Instalar dependencias

```bash
# Instalar solo dependencias de producción
npm install --production

# Ver si hay errores
# Si todo OK, continuar
```

---

### PASO 5: Iniciar Backend con PM2 (5 minutos)

#### 5.1 Iniciar aplicación

```bash
# Asegurarte de estar en /home/ubuntu/LabRedSocial-DW/backend
pwd  # Debe mostrar: /home/ubuntu/LabRedSocial-DW/backend

# Iniciar con PM2
pm2 start src/server.js --name instagur-backend

# Ver status
pm2 status
# Debe mostrar "online" en verde

# Ver logs en tiempo real
pm2 logs instagur-backend
# Presiona Ctrl+C para salir de los logs
```

Deberías ver algo como:
```
🚀 Servidor corriendo en puerto 5000
🌍 Modo: production
✅ Conectado a MongoDB Atlas: ac-qczvt7w-shard-00-00.0nsmifa.mongodb.net
☁️  Usando AWS S3 para almacenamiento
```

#### 5.2 Guardar configuración PM2

```bash
# Guardar la configuración actual de PM2
pm2 save

# Verificar que se auto-inicia en reboot
pm2 list
```

#### 5.3 Probar backend directamente

```bash
# Probar endpoint desde EC2
curl http://localhost:5000/

# Debe responder con algo (JSON o HTML)
```

Desde tu computadora, abrir navegador:
```
http://TU_IP_EC2:5000
```

⚠️ Si no carga, verificar:
```bash
# Ver logs de errores
pm2 logs instagur-backend --err

# Reiniciar si es necesario
pm2 restart instagur-backend
```

---

### PASO 6: Configurar Nginx como Reverse Proxy (10 minutos)

#### 6.1 Crear configuración de Nginx

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/instagur
```

**Pegar esta configuración:**

```nginx
server {
    listen 80;
    server_name TU_IP_EC2;  # Reemplazar con tu IP pública

    # Logs
    access_log /var/log/nginx/instagur_access.log;
    error_log /var/log/nginx/instagur_error.log;

    # Proxy para el backend (Node.js en puerto 5000)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Servir frontend estático (opcional - si subes el build aquí)
    location / {
        # Por ahora, redirect al puerto 5000
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Guardar:** `Ctrl+O` → Enter → `Ctrl+X`

#### 6.2 Habilitar configuración

```bash
# Crear symlink a sites-enabled
sudo ln -s /etc/nginx/sites-available/instagur /etc/nginx/sites-enabled/

# Eliminar configuración default (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración de Nginx
sudo nginx -t

# Debe mostrar:
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### 6.3 Reiniciar Nginx

```bash
# Reiniciar Nginx para aplicar cambios
sudo systemctl restart nginx

# Verificar status
sudo systemctl status nginx
# Debe estar "active (running)" en verde
```

#### 6.4 Probar desde navegador

Abrir en tu computadora:
```
http://TU_IP_EC2/
```

Deberías ver la respuesta de tu API (¡sin el puerto 5000!)

Probar un endpoint específico:
```
http://TU_IP_EC2/api/images
```

---

### PASO 7: Actualizar MongoDB Atlas Network Access (2 minutos)

⚠️ **IMPORTANTE**: Añadir la IP de EC2 a MongoDB Atlas

#### 7.1 Ir a MongoDB Atlas
- https://cloud.mongodb.com/
- Proyecto → Network Access

#### 7.2 Añadir IP de EC2
- Click "Add IP Address"
- Pegar la **IP pública de EC2** (ej: `18.222.123.45`)
- Description: `EC2 Production Server`
- Click "Confirm"
- Esperar 1-2 minutos hasta que status = "Active"

#### 7.3 Verificar conexión desde EC2

```bash
# En la terminal de EC2, reiniciar backend
pm2 restart instagur-backend

# Ver logs
pm2 logs instagur-backend

# Debe mostrar:
# ✅ Conectado a MongoDB Atlas
```

---

### PASO 8: Probar Todo el Sistema (5 minutos)

#### 8.1 Endpoints a probar

Desde **Postman** o navegador:

**1. Health check:**
```
GET http://TU_IP_EC2/
```

**2. Registro de usuario:**
```
POST http://TU_IP_EC2/api/users/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@ejemplo.com",
  "password": "password123"
}
```

**3. Login:**
```
POST http://TU_IP_EC2/api/users/login
Content-Type: application/json

{
  "email": "test@ejemplo.com",
  "password": "password123"
}
```

**4. Ver imágenes:**
```
GET http://TU_IP_EC2/api/images
```

#### 8.2 Verificar S3

- Sube una imagen desde Postman (con token de auth)
- Ve a AWS S3 Console
- Verifica que la imagen está en `tuapp-dev-bucket`

---

## ✅ CHECKLIST FINAL - Backend en EC2

- [ ] EC2 t2.micro lanzado
- [ ] Security Group configurado (SSH, HTTP, HTTPS, 5000)
- [ ] SSH funcionando
- [ ] Node.js 22 instalado
- [ ] PM2 instalado y configurado
- [ ] Nginx instalado
- [ ] Git instalado
- [ ] Repositorio clonado
- [ ] .env de producción creado
- [ ] Dependencias instaladas
- [ ] Backend corriendo con PM2
- [ ] PM2 auto-start configurado
- [ ] Nginx reverse proxy configurado
- [ ] IP de EC2 añadida a MongoDB Atlas
- [ ] Backend accesible desde http://IP_EC2/
- [ ] Endpoints de API funcionando
- [ ] Registro de usuarios funciona
- [ ] Upload de imágenes a S3 funciona

---

## 🎉 ¡Backend Desplegado!

Tu backend está corriendo 24/7 en AWS EC2 con:
- ✅ Node.js + Express
- ✅ MongoDB Atlas (cloud database)
- ✅ AWS S3 (cloud storage)
- ✅ PM2 (process manager)
- ✅ Nginx (reverse proxy)

**Próximo paso:** Desplegar el frontend

---

## 🐛 Troubleshooting

### Backend no responde
```bash
# Ver logs de PM2
pm2 logs instagur-backend

# Ver todos los procesos
pm2 list

# Reiniciar
pm2 restart instagur-backend

# Ver uso de recursos
pm2 monit
```

### Error de conexión a MongoDB
```bash
# Ver logs
pm2 logs instagur-backend --err

# Verificar .env
cat .env | grep MONGODB_URI

# Verificar IP en Atlas Network Access
```

### Nginx no funciona
```bash
# Ver status
sudo systemctl status nginx

# Ver logs de error
sudo tail -f /var/log/nginx/error.log

# Reiniciar
sudo systemctl restart nginx

# Probar configuración
sudo nginx -t
```

### Puerto 5000 no accesible
```bash
# Verificar Security Group en AWS Console
# Debe tener regla: Custom TCP, Port 5000, Source 0.0.0.0/0

# Verificar que el backend está escuchando
sudo netstat -tulpn | grep 5000
```

### PM2 no se auto-inicia
```bash
# Ejecutar startup command
pm2 startup systemd

# Copiar y ejecutar el comando que muestra

# Guardar procesos actuales
pm2 save
```

---

## 📝 Comandos Útiles

```bash
# SSH a EC2
ssh -i "C:\Users\johao\.ssh\instagur-key.pem" ubuntu@TU_IP_EC2

# Ver logs en tiempo real
pm2 logs instagur-backend --lines 100

# Reiniciar backend
pm2 restart instagur-backend

# Ver status
pm2 status

# Ver recursos (CPU, RAM)
pm2 monit

# Detener backend
pm2 stop instagur-backend

# Eliminar proceso
pm2 delete instagur-backend

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Actualizar código (pull changes)
cd /home/ubuntu/LabRedSocial-DW
git pull origin main
cd backend
npm install --production
pm2 restart instagur-backend
```

---

## 🔐 Seguridad Adicional (Opcional)

### Cambiar puerto SSH (más seguro)
```bash
sudo nano /etc/ssh/sshd_config
# Cambiar Port 22 → Port 2222
sudo systemctl restart sshd
# Actualizar Security Group en AWS
```

### Instalar Fail2Ban (protección contra brute force)
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

### Configurar Firewall UFW
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

**¡Éxito! 🚀**
