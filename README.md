# LabRedSocial-DW

**Proyecto académico**: Desarrollo de una red social con Node.js, Express y MongoDB.  
**Estado actual**: Avance hasta el paso **20: Actualizar usuarios**.  

---

## 🚀 Descripción
Este proyecto corresponde a la construcción de una red social paso a paso, siguiendo una metodología incremental.  
Cada etapa se documenta en código, rutas y controladores, hasta alcanzar la implementación completa del backend.  

---

## 🛠️ Stack tecnológico
- **Node.js** como entorno de ejecución.  
- **Express** para el servidor web.  
- **MongoDB + Mongoose** como base de datos.  
- **JWT** para autenticación.  
- **Multer** para gestión de archivos.  

---

## 📂 Estructura del repositorio
- `src/` — código fuente del proyecto (modelos, rutas, controladores, middlewares).  
- `index.html` — punto de entrada (testing visual / recursos de front).  
- `package.json` — dependencias y scripts de ejecución.  
- `.gitignore` — archivos ignorados en control de versiones.  

---

## 📌 Roadmap de desarrollo (checklist)
1. [x] Diseñar la base de datos  
2. [x] Inicializar proyecto con Node  
3. [x] Instalar dependencias  
4. [x] Script para ahorrar tiempo  
5. [x] Conexión a MongoDB  
6. [x] Configurar servidor de Node  
7. [x] Crear controladores de prueba  
8. [x] Configurar rutas  
9. [x] Configurar rutas  
10. [x] Modelo de usuarios  
11. [x] Registro de usuarios (acción y ruta)  
12. [x] Login (acción y ruta)  
13. [x] Comprobar si existe el usuario  
14. [x] Validar contraseña correcta  
15. [x] Generar token JWT  
16. [x] Middleware de auth  
17. [x] Resolver error en middleware auth  
18. [x] Datos del perfil  
19. [x] Página listado de usuarios  
20. [✅] **Actualizar usuarios (estado actual)**  
21. [ ] Actualizar usuarios con `await`  
22. [ ] Subida de archivos  
23. [ ] Endpoint mostrar imagen  
24. [ ] Modelo y controlador de follows  
25. [ ] Acción save follow y corrección de error subida  
26. [ ] Seguir a un usuario  
27. [ ] Dejar de seguir  
28. [ ] Array de IDs de usuarios que sigo y me siguen  
29. [ ] Datos de seguimiento para el perfil  
30. [ ] Info de follows en el listado de usuarios  
31. [ ] Acción de mis seguidores  
32. [ ] Modelo de publicaciones  
33. [ ] Guardar publicaciones  
34. [ ] Mostrar una publicación  
35. [ ] Borrar una publicación  
36. [ ] Listado de publicaciones de perfil usuario  
37. [ ] Subir imagen de publicaciones  
38. [ ] Devolver una imagen de publicación  
39. [ ] Devolver una imagen de publicación  
40. [ ] Feed de publicaciones  
41. [ ] Quitar email de select  
42. [ ] Modificaciones al API  
43. [ ] Validar en backend  

---

## ⚡ Instalación y ejecución
1. Clonar el repositorio:  
   ```bash
   git clone https://github.com/Johaho-Yanes/LabRedSocial-DW.git
   cd LabRedSocial-DW

2. Instalar dependencias:

npm install


3. Levantar el servidor:

npm start

(Si no hay script start, usar node index.js o nodemon index.js según la configuración).


📄 Licencia

Uso académico — libre para aprendizaje y extensión.
