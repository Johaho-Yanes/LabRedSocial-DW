# Dockerfile para Backend (Opción 3 - ECS)
FROM node:18-alpine AS base

# Instalar dependencias del sistema para Sharp
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

WORKDIR /app

# ============================================
# Stage 1: Build Backend
# ============================================
FROM base AS backend-build

# Copiar package.json del backend
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar código del backend
COPY backend/ ./

# ============================================
# Stage 2: Producción
# ============================================
FROM base AS production

WORKDIR /app

# Copiar dependencias y código desde build
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/src ./src

# Crear directorio para uploads (en producción usar S3)
RUN mkdir -p uploads && chmod 755 uploads

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Exponer puerto
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usuario no-root por seguridad
USER node

# Iniciar aplicación
CMD ["node", "src/server.js"]
