#!/bin/bash

# ==============================================
# Script de Despliegue EC2 - InstaGur Backend
# ==============================================

set -e

echo "🚀 Iniciando despliegue en EC2..."

# Variables
APP_DIR="/home/ubuntu/instagur"
BACKEND_DIR="$APP_DIR/backend"
PM2_APP_NAME="instagur-backend"

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Actualizar código desde Git
echo -e "${BLUE}📥 Actualizando código...${NC}"
cd $APP_DIR
git pull origin main

# 2. Instalar dependencias del backend
echo -e "${BLUE}📦 Instalando dependencias...${NC}"
cd $BACKEND_DIR
npm ci --only=production

# 3. Reiniciar aplicación con PM2
echo -e "${BLUE}🔄 Reiniciando aplicación...${NC}"
pm2 restart $PM2_APP_NAME || pm2 start src/server.js --name $PM2_APP_NAME

# 4. Verificar estado
echo -e "${BLUE}✅ Verificando estado...${NC}"
pm2 status
pm2 logs $PM2_APP_NAME --lines 20

echo -e "${GREEN}✅ Despliegue completado exitosamente!${NC}"
