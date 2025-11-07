#!/bin/bash

# ============================================================
# Script de Configuración Inicial EC2 - InstaGur
# ============================================================
# Ejecutar como: sudo bash setup-ec2-initial.sh
# ============================================================

set -e

echo "🔧 Configurando servidor EC2 para InstaGur..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================
# 1. Actualizar sistema
# ============================================
echo -e "${BLUE}📦 Actualizando sistema...${NC}"
apt update && apt upgrade -y

# ============================================
# 2. Instalar Node.js 22 (LTS)
# ============================================
echo -e "${BLUE}📦 Instalando Node.js 22...${NC}"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Verificar instalación
node --version
npm --version

# ============================================
# 3. Instalar PM2 (Process Manager)
# ============================================
echo -e "${BLUE}📦 Instalando PM2...${NC}"
npm install -g pm2

# Configurar PM2 para auto-inicio
pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

# ============================================
# 4. Instalar Nginx
# ============================================
echo -e "${BLUE}📦 Instalando Nginx...${NC}"
apt install -y nginx

# Habilitar Nginx
systemctl enable nginx
systemctl start nginx

# ============================================
# 5. Instalar Certbot (SSL gratis)
# ============================================
echo -e "${BLUE}📦 Instalando Certbot...${NC}"
apt install -y certbot python3-certbot-nginx

# ============================================
# 6. Configurar Firewall
# ============================================
echo -e "${BLUE}🔒 Configurando firewall...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ============================================
# 7. Crear directorio de aplicación
# ============================================
echo -e "${BLUE}📁 Creando estructura de directorios...${NC}"
mkdir -p /home/ubuntu/instagur
chown -R ubuntu:ubuntu /home/ubuntu/instagur

# ============================================
# 8. Configurar Nginx como Reverse Proxy
# ============================================
echo -e "${BLUE}⚙️  Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/instagur << 'EOF'
server {
    listen 80;
    server_name _; # Cambiar a tu dominio

    client_max_body_size 10M;

    location / {
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
}
EOF

# Habilitar configuración
ln -sf /etc/nginx/sites-available/instagur /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Probar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx

# ============================================
# 9. Instalar Git
# ============================================
echo -e "${BLUE}📦 Instalando Git...${NC}"
apt install -y git

# ============================================
# 10. Configurar variables de entorno
# ============================================
echo -e "${YELLOW}⚠️  IMPORTANTE: Configurar variables de entorno${NC}"
echo -e "${YELLOW}Ejecuta estos comandos como usuario ubuntu:${NC}"
echo ""
echo "cd /home/ubuntu/instagur"
echo "git clone https://github.com/TU_USUARIO/TU_REPO.git ."
echo "cd backend"
echo "cp .env.example .env"
echo "nano .env  # Edita las variables de entorno"
echo "npm install"
echo "pm2 start src/server.js --name instagur-backend"
echo "pm2 save"
echo ""

# ============================================
# Resumen
# ============================================
echo -e "${GREEN}✅ Configuración inicial completada!${NC}"
echo ""
echo -e "${BLUE}Servicios instalados:${NC}"
echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo "✅ PM2 $(pm2 --version)"
echo "✅ Nginx $(nginx -v 2>&1)"
echo "✅ Certbot"
echo "✅ Git $(git --version)"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Clonar repositorio en /home/ubuntu/instagur"
echo "2. Configurar .env en backend/"
echo "3. Ejecutar: npm install en backend/"
echo "4. Iniciar con PM2: pm2 start src/server.js --name instagur-backend"
echo "5. Configurar dominio en Nginx"
echo "6. Obtener SSL: sudo certbot --nginx -d tu-dominio.com"
echo ""
echo -e "${GREEN}Servidor listo para deployment! 🚀${NC}"
