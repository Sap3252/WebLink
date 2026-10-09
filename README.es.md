# WebLink

[English](README.md) | **Español**

Una red social mínima: los usuarios publican posts cortos (hasta 250 caracteres), siguen a otros usuarios y leen un feed con los posts de las personas que siguen.

Hecha como proyecto de aprendizaje, con una API REST en Express + MongoDB y un cliente en React.

> **Estado:** la API está completa (auth, posts, follows, feed y paginación). El frontend está en desarrollo: el ruteo y el cliente tipado de la API están listos, las páginas vienen después.

## Stack

| Capa     | Tecnologías                                                     |
| -------- | --------------------------------------------------------------- |
| Backend  | Node.js, Express 5, TypeScript, MongoDB + Mongoose, JWT, bcrypt |
| Frontend | React 19, TypeScript, Vite, React Router                        |
| Tooling  | Prettier, ESLint, tsx                                           |

## Funcionalidades

- Registro e inicio de sesión con JWT. Las contraseñas se guardan hasheadas con bcrypt y la API nunca las devuelve.
- Posts de hasta 250 caracteres. Cada usuario solo puede borrar los suyos.
- Seguir y dejar de seguir usuarios, con listas de seguidores y seguidos.
- Perfiles con contadores de seguidores y si el usuario actual los sigue.
- Feed personalizado con tus posts y los de los usuarios que seguís.
- Paginación por cursor en todas las listas de posts.
- Manejo de errores centralizado: todos los errores se devuelven como `{ "error": "..." }`.

## Estructura del proyecto

```
WebLink/
├── src/                 # API (Express + TypeScript)
│   ├── config/          # Validación del entorno y conexión a la base
│   ├── routes/          # Definición de endpoints
│   ├── controllers/     # Manejo de requests
│   ├── services/        # Consultas reutilizables
│   ├── models/          # Schemas de Mongoose
│   ├── middlewares/     # Auth, 404 y manejo de errores
│   └── utils/           # Helpers de paginación y JWT
└── client/              # App de React (Vite)
    └── src/lib/         # Cliente tipado de la API
```

## Cómo correrlo

### Requisitos

- Node.js 22 o superior
- Una base de MongoDB, local o en [MongoDB Atlas](https://www.mongodb.com/atlas) (alcanza con el plan gratuito)

### 1. Instalar

```bash
git clone https://github.com/Sap3252/WebLink.git
cd WebLink
npm install
npm install --prefix client
```

### 2. Configurar

Copiar `.env.example` como `.env` en la raíz del proyecto y completarlo:

| Variable         | Obligatoria | Valor por defecto                             | Descripción                                                |
| ---------------- | ----------- | --------------------------------------------- | ---------------------------------------------------------- |
| `MONGO_URI`      | Sí          |                                               | Connection string de MongoDB                               |
| `JWT_SECRET`     | Sí          |                                               | Secreto para firmar los tokens                             |
| `JWT_EXPIRES_IN` | No          | `7d`                                          | Duración de los tokens                                     |
| `PORT`           | No          | `3000`                                        | Puerto de la API                                           |
| `CORS_ORIGIN`    | No          | `http://localhost:5173,http://localhost:4173` | Orígenes autorizados a llamar a la API, separados por coma |
| `NODE_ENV`       | No          | `development`                                 | Entorno                                                    |

Después copiar `client/.env.example` como `client/.env`. Contiene `VITE_API_URL`, la URL base de la API (`http://localhost:3000/api` por defecto).

### 3. Ejecutar

Levantar la API y el cliente en dos terminales:

```bash
npm run dev
```

```bash
npm run dev --prefix client
```

La API queda en `http://localhost:3000` y el cliente en `http://localhost:5173`.

## Scripts

En la raíz del proyecto:

| Script                 | Descripción                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Levanta la API con recarga automática     |
| `npm run build`        | Compila la API en `dist/`                 |
| `npm start`            | Ejecuta la API compilada                  |
| `npm run typecheck`    | Chequea los tipos de la API               |
| `npm run format`       | Formatea todo el repositorio con Prettier |
| `npm run format:check` | Revisa el formato sin modificar archivos  |

Dentro de `client/`: `npm run dev`, `npm run build`, `npm run lint` y `npm run preview`.

## API

Todos los endpoints están bajo `/api`. Los marcados como **requerida** necesitan el header `Authorization: Bearer <token>`. Los errores siempre tienen la forma `{ "error": "mensaje" }`.

### Auth

| Método | Endpoint         | Auth      | Descripción                                                                                             |
| ------ | ---------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| POST   | `/auth/register` |           | Crea una cuenta. Body: `username`, `email`, `password` (8 caracteres o más). Devuelve `{ token, user }` |
| POST   | `/auth/login`    |           | Inicia sesión. Body: `email`, `password`. Devuelve `{ token, user }`                                    |
| GET    | `/auth/me`       | requerida | Usuario actual                                                                                          |

### Posts

| Método | Endpoint     | Auth      | Descripción                                            |
| ------ | ------------ | --------- | ------------------------------------------------------ |
| POST   | `/posts`     | requerida | Crea un post. Body: `text`                             |
| GET    | `/posts`     |           | Todos los posts, del más nuevo al más viejo (paginado) |
| GET    | `/posts/:id` |           | Un post                                                |
| DELETE | `/posts/:id` | requerida | Borra uno de tus posts                                 |

### Usuarios

| Método | Endpoint                 | Auth      | Descripción                                                            |
| ------ | ------------------------ | --------- | ---------------------------------------------------------------------- |
| GET    | `/users/:username`       | opcional  | Perfil con `followers`, `following` e `isFollowing` (`null` sin token) |
| GET    | `/users/:username/posts` |           | Posts de un usuario (paginado)                                         |
| PATCH  | `/users/me`              | requerida | Actualiza tu `username` y/o `bio`                                      |
| GET    | `/users/:id/followers`   |           | Usuarios que siguen a este usuario                                     |
| GET    | `/users/:id/following`   |           | Usuarios que este usuario sigue                                        |
| POST   | `/users/:id/follow`      | requerida | Sigue a un usuario                                                     |
| DELETE | `/users/:id/follow`      | requerida | Deja de seguir a un usuario                                            |

### Feed

| Método | Endpoint | Auth      | Descripción                                           |
| ------ | -------- | --------- | ----------------------------------------------------- |
| GET    | `/feed`  | requerida | Tus posts y los de los usuarios que seguís (paginado) |

### Paginación

Los endpoints paginados aceptan dos parámetros de query:

- `limit`: posts por página (por defecto `20`, máximo `50`)
- `before`: cursor, solo devuelve posts creados antes de esa fecha

La respuesta tiene la forma `{ posts, nextCursor }`. Para pedir la página siguiente, mandar `nextCursor` como `before`. Cuando no hay más posts, `nextCursor` es `null`.

```
GET /api/posts?limit=20
GET /api/posts?limit=20&before=2026-10-09T12:00:00.000Z
```

## Hoja de ruta

- [x] API REST
- [ ] Contexto de auth y páginas de login/registro
- [ ] Página del feed
- [ ] Página de perfil con botón de seguir
- [ ] Estilos
- [ ] Deploy
