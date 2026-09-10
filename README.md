# Sistema de Gestión de Usuarios Internos — Marketplace

Panel de administración para el equipo de Recursos Humanos de un marketplace. Permite listar, dar de alta, editar y dar de baja a los empleados internos de la plataforma.

Es una SPA en **React** que consume una **API REST propia** hecha con **Express**, con persistencia en **SQLite** a través del ORM **Sequelize**.

---

## Stack

| Capa | Tecnologías |
|---|---|
| Frontend | React 18, React Router 6, Vite, CSS propio |
| Backend | Node.js, Express 4 |
| Persistencia | Sequelize 6 + SQLite (archivo local `backend/database.sqlite`) |

---

## Estructura del proyecto

```
gestion-usuarios-marketplace/
├── backend/
│   ├── src/
│   │   ├── config/database.js            # conexión Sequelize + SQLite
│   │   ├── models/Usuario.js             # modelo y validaciones del usuario
│   │   ├── controllers/                  # lógica de cada endpoint
│   │   ├── routes/usuarios.routes.js     # definición de rutas REST
│   │   ├── middlewares/                  # validación de datos y manejo de errores
│   │   ├── seed.js                       # carga de usuarios de ejemplo
│   │   ├── app.js                        # configuración de Express
│   │   └── server.js                     # arranque del servidor
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/                   # formulario, modal de baja, mensajes
│   │   ├── pages/                        # listado, alta y edición
│   │   ├── hooks/useUsuarios.js          # estado del listado
│   │   ├── services/api.js               # llamadas HTTP a la API
│   │   ├── App.jsx                       # rutas de la SPA
│   │   └── styles.css
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Requisitos previos

- Node.js 18 o superior (probado con Node 20 y 22)
- npm 9 o superior

Verificalo con:

```bash
node -v
npm -v
```

---

## Instalación y ejecución local

El proyecto usa **dos terminales**: una para la API y otra para el frontend.

### 1. Backend (API REST)

```bash
cd backend
npm install
cp .env.example .env      # opcional: los valores por defecto ya funcionan
npm run seed              # opcional: carga 5 usuarios de ejemplo
npm run dev               # o npm start
```

La API queda en **http://localhost:3001**. La primera vez se crea solo el archivo `backend/database.sqlite` con la tabla `usuarios`.

### 2. Frontend (SPA)

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda en **http://localhost:5173**. Vite redirige todo lo que empiece con `/api` al backend (ver `vite.config.js`), así que no hace falta configurar nada más.

### Build de producción del frontend

```bash
cd frontend
npm run build     # genera la carpeta dist/
npm run preview   # sirve el build para probarlo
```

---

## Variables de entorno

Están en `backend/.env.example`. El archivo `.env` real está ignorado en git y **el proyecto no contiene credenciales**: SQLite es un archivo local y no requiere usuario ni contraseña.

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `PORT` | `3001` | Puerto de la API |
| `DB_STORAGE` | `./database.sqlite` | Ruta del archivo SQLite, relativa a `backend/` |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen permitido para CORS |

---

## API REST

Base: `http://localhost:3001/api`

| Verbo | Ruta | Descripción | Respuesta |
|---|---|---|---|
| `GET` | `/usuarios` | Lista todos los usuarios. Acepta `?q=texto` para filtrar | `200` |
| `GET` | `/usuarios/:id` | Devuelve un usuario | `200` / `404` |
| `POST` | `/usuarios` | Crea un usuario | `201` / `400` / `409` |
| `PUT` | `/usuarios/:id` | Actualiza nombre, apellido, email o domicilio | `200` / `400` / `404` / `409` |
| `DELETE` | `/usuarios/:id` | Elimina un usuario | `200` / `404` |
| `GET` | `/health` | Chequeo rápido del estado de la API | `200` |

### Modelo de datos

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | entero | Generado automáticamente por la base de datos (autoincremental) |
| `nombre` | texto | Obligatorio, 2 a 60 caracteres |
| `apellido` | texto | Obligatorio, 2 a 60 caracteres |
| `documento` | texto | Obligatorio, único, 6 a 20 caracteres (DNI o pasaporte) |
| `legajo` | texto | Obligatorio, único, 2 a 20 caracteres |
| `email` | texto | Obligatorio, único, formato de email válido |
| `domicilio` | texto | Obligatorio, 5 a 120 caracteres |
| `createdAt` / `updatedAt` | fecha | Los agrega Sequelize automáticamente |

> El documento y el legajo identifican al empleado, por eso no se modifican desde la edición. La consigna pide poder actualizar **domicilio o email**; el formulario también permite corregir nombre y apellido.

### Ejemplos con curl

```bash
# Crear
curl -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","apellido":"Ruiz","documento":"33111222","legajo":"MKT-010","email":"ana.ruiz@marketplace.com","domicilio":"Alberdi 120, Neuquén"}'

# Listar
curl http://localhost:3001/api/usuarios

# Actualizar email y domicilio
curl -X PUT http://localhost:3001/api/usuarios/1 \
  -H "Content-Type: application/json" \
  -d '{"email":"nuevo.mail@marketplace.com","domicilio":"Mitre 900, Neuquén"}'

# Eliminar
curl -X DELETE http://localhost:3001/api/usuarios/1
```

### Formato de los errores

```json
{
  "error": "Datos inválidos",
  "detalles": [{ "campo": "email", "mensaje": "El email no tiene un formato válido" }]
}
```

- `400` datos inválidos o campos obligatorios faltantes
- `404` usuario inexistente
- `409` documento, legajo o email ya registrados

---

## Funcionalidades del panel

- **Listado** de todos los usuarios con buscador por nombre, apellido, documento, legajo, email o domicilio.
- **Alta** con validaciones en el cliente y en el servidor (campos obligatorios, formato de email, documento y legajo únicos).
- **Edición** de los datos de contacto de un usuario existente.
- **Baja** con modal de confirmación antes de eliminar.
- La interfaz se actualiza sola después de cada operación: **no hace falta recargar la página**.
- Mensajes de éxito y de error visibles, y estados de carga en cada pantalla.

---

## Decisiones técnicas

- **Sequelize `sync()`** crea la tabla al levantar el servidor: no hacen falta migraciones para un proyecto de este tamaño.
- **Validación en dos capas**: un middleware normaliza y controla los campos antes de tocar la base, y el modelo repite las reglas como última línea de defensa.
- **Estado con hooks**: `useUsuarios` centraliza el listado y lo actualiza en memoria tras cada baja, evitando recargas.
- **Modal propio en lugar de `window.confirm`** para no bloquear el navegador y mantener la estética del panel.
- **Sin credenciales en el repo**: SQLite es un archivo local, `.env` está ignorado y solo se versiona `.env.example`.
