# Blog Out - Node.js & MongoDB

**Blog Out** es una plataforma moderna para compartir imágenes, construida con Node.js, Express y MongoDB. Diseñada con los colores frescos inspirados en Tío Limón, ofrece una experiencia única para que los usuarios suban, compartan y gestionen sus imágenes con funciones sociales como likes, comentarios y organización por tags.

## 🚀 Características

- **Autenticación de usuarios**: Registro, login, logout con JWT
- **Subida de imágenes**: Con optimización automática y generación de thumbnails
- **Gestión de imágenes**: Crear, leer, actualizar, eliminar imágenes
- **Interacciones sociales**: Likes y comentarios
- **Sistema de tags**: Organizar imágenes por etiquetas
- **Privacidad**: Imágenes públicas y privadas
- **Búsqueda**: Buscar imágenes por título, descripción y tags
- **Perfiles de usuario**: Ver perfiles y estadísticas
- **Feed de imágenes**: Ver las últimas imágenes públicas
- **API RESTful**: Completamente documentada
- **Diseño fresco**: Inspirado en la paleta de colores Tío Limón

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MongoDB (v4.4 o superior)
- npm o yarn

## 🛠 Instalación

1. **Clona el repositorio**
```bash
git clone https://github.com/tu-usuario/blog-out.git
cd blog-out
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**
Crea un archivo `.env` en la raíz del proyecto:
```bash
# Configuración de la base de datos
MONGODB_URI=mongodb://localhost:27017/blog_out

# Configuración del servidor
PORT=3000
NODE_ENV=development

# JWT Secret (cambia esto en producción)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_12345

# Configuración de archivos
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp
```

4. **Inicia MongoDB**
Asegúrate de que MongoDB esté ejecutándose en tu sistema.

5. **Ejecuta la aplicación**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📁 Estructura del Proyecto

```
blog-out/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de MongoDB
│   ├── controllers/
│   │   ├── userController.js    # Controladores de usuario
│   │   └── imageController.js   # Controladores de imagen
│   ├── middleware/
│   │   ├── auth.js              # Middleware de autenticación
│   │   └── upload.js            # Middleware de subida de archivos
│   ├── models/
│   │   ├── User.js              # Modelo de usuario
│   │   └── Image.js             # Modelo de imagen
│   ├── routes/
│   │   ├── index.js             # Rutas principales
│   │   ├── userRoutes.js        # Rutas de usuario
│   │   └── imageRoutes.js       # Rutas de imagen
│   ├── services/
│   │   ├── userService.js       # Lógica de negocio de usuario
│   │   └── imageService.js      # Lógica de negocio de imagen
│   ├── uploads/                 # Directorio de archivos subidos
│   └── app.js                   # Aplicación principal
├── public/
│   └── css/
│       └── styles.css           # Estilos con paleta Tío Limón
├── .env                         # Variables de entorno
├── .gitignore                   # Archivos ignorados por Git
├── package.json                 # Dependencias del proyecto
└── README.md                    # Este archivo
```

## 🔌 API Endpoints

### Usuarios
- `POST /api/users/register` - Registrar usuario
- `POST /api/users/login` - Iniciar sesión
- `POST /api/users/logout` - Cerrar sesión
- `GET /api/users/profile` - Obtener perfil del usuario actual
- `PUT /api/users/profile` - Actualizar perfil
- `GET /api/users/:id` - Obtener perfil de usuario por ID
- `GET /api/users/search` - Buscar usuarios
- `DELETE /api/users/account` - Eliminar cuenta

### Imágenes
- `GET /api/images` - Obtener feed de imágenes públicas
- `POST /api/images/upload` - Subir nueva imagen
- `GET /api/images/:id` - Obtener imagen por ID
- `PUT /api/images/:id` - Actualizar imagen
- `DELETE /api/images/:id` - Eliminar imagen
- `POST /api/images/:id/like` - Toggle like en imagen
- `POST /api/images/:id/comments` - Agregar comentario
- `DELETE /api/images/:id/comments/:commentId` - Eliminar comentario
- `GET /api/images/search` - Buscar imágenes
- `GET /api/images/tags/popular` - Obtener tags populares
- `GET /api/images/tags/:tag` - Obtener imágenes por tag
- `GET /api/images/user/:userId` - Obtener imágenes de usuario

## 🔧 Configuración de Desarrollo

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `MONGODB_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/imgur_clone` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `JWT_SECRET` | Clave secreta para JWT | (requerido) |
| `MAX_FILE_SIZE` | Tamaño máximo de archivo en bytes | `10485760` (10MB) |
| `ALLOWED_EXTENSIONS` | Extensiones de archivo permitidas | `jpg,jpeg,png,gif,webp` |

### Scripts Disponibles

```bash
npm start          # Ejecutar en producción
npm run dev        # Ejecutar en desarrollo con nodemon
npm test           # Ejecutar tests (pendiente)
```

## 📸 Subida de Archivos

- **Tamaño máximo**: 10MB por archivo
- **Formatos soportados**: JPEG, PNG, GIF, WebP
- **Procesamiento automático**: Las imágenes se optimizan y se generan thumbnails automáticamente
- **Almacenamiento**: Los archivos se almacenan localmente en `src/uploads/`

## 🔐 Autenticación

La aplicación utiliza JWT (JSON Web Tokens) para la autenticación:

- Los tokens se pueden enviar en el header `Authorization: Bearer <token>`
- También se pueden usar cookies HTTP (opcional)
- Los tokens expiran en 7 días
- Se requiere autenticación para subir, editar y eliminar imágenes

## 🗃 Base de Datos

### Modelo de Usuario
```javascript
{
  username: String,
  email: String,
  password: String (hash),
  avatar: String,
  bio: String,
  totalUploads: Number,
  totalViews: Number,
  isActive: Boolean,
  timestamps: true
}
```

### Modelo de Imagen
```javascript
{
  title: String,
  description: String,
  filename: String,
  url: String,
  thumbnailUrl: String,
  uploader: ObjectId,
  isPublic: Boolean,
  views: Number,
  likes: Number,
  likedBy: [ObjectId],
  tags: [String],
  comments: [{
    user: ObjectId,
    text: String,
    createdAt: Date
  }],
  timestamps: true
}
```

## 🔍 Características Técnicas

- **Validación de datos**: Con express-validator
- **Seguridad**: Helmet, CORS, rate limiting
- **Compresión**: Gzip automático
- **Logs**: Morgan para logging HTTP
- **Manejo de errores**: Middleware global de errores
- **Procesamiento de imágenes**: Sharp para optimización
- **Hash de contraseñas**: bcryptjs
- **Índices de BD**: Para optimizar consultas

## 🚀 Despliegue

### MongoDB Atlas (Recomendado)
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster y obtén la URI de conexión
3. Actualiza `MONGODB_URI` en tu `.env`

### Variables de Producción
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/imgur_clone
JWT_SECRET=tu_jwt_secret_muy_seguro_para_produccion
PORT=80
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue si es necesario

## 📊 Estado del Proyecto

- ✅ Autenticación de usuarios
- ✅ CRUD de imágenes
- ✅ Sistema de likes y comentarios
- ✅ Sistema de tags
- ✅ Búsqueda de imágenes
- ✅ API RESTful
- 🔄 Frontend (en desarrollo)
- 🔄 Tests unitarios (pendiente)
- 🔄 Documentación de API con Swagger (pendiente)

---

Desarrollado con ❤️ usando Node.js y MongoDB