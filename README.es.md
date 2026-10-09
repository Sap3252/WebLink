# WebLink

[English](README.md) | **Español**

Una red social chica: los usuarios publican posts cortos (hasta 250 caracteres), se siguen entre sí, le dan **link** a los posts (la versión de WebLink del "me gusta") y conversan en los comentarios.

Hecha como proyecto de aprendizaje, con una API REST en Express + MongoDB y un cliente en React.

> **Estado:** la API y el cliente en React están completos. Próximo paso: el deploy.

## Stack

| Capa     | Tecnologías                                                     |
| -------- | --------------------------------------------------------------- |
| Backend  | Node.js, Express 5, TypeScript, MongoDB + Mongoose, JWT, bcrypt |
| Frontend | React 19, TypeScript, Vite, React Router, CSS Modules           |
| Tooling  | Prettier, ESLint, tsx                                           |

## Funcionalidades

**Red social**

- Registro e inicio de sesión con JWT. Las contraseñas se guardan hasheadas con bcrypt y la API nunca las devuelve. Cuando la sesión vence, la app vuelve a la pantalla de inicio de sesión.
- Posts de hasta 250 caracteres y un feed personalizado con tus posts y los de los usuarios que seguís.
- **Links**: darle link a un post, la versión de WebLink del "me gusta".
- **Comentarios** en la página propia de cada post. Un comentario lo puede borrar su autor o el autor del post.
- Seguir y dejar de seguir usuarios. Los perfiles muestran contadores de seguidores, los posts del usuario y una bio editable.
- **Borrado lógico**: un post borrado desaparece de todas las listas y su texto se elimina, pero sus comentarios siguen visibles y la conversación queda cerrada.

**Interfaz**

- Inglés y español, con cambio de idioma en cualquier momento.
- Tema claro y oscuro: sigue la configuración del sistema hasta que elegís uno.
- Diseño de vidrio sobre un fondo aurora animado, con posts que entran desde los costados.
- Funciona en celulares, con etiquetas accesibles y soporte de teclado.

**API**

- Paginación por cursor en todas las listas de posts y comentarios.
- Manejo de errores centralizado: todos los errores se devuelven como `{ "error": "..." }`.

## Estructura del proyecto

```
WebLink/
├── src/                  # API (Express + TypeScript)
│   ├── config/           # Validación del entorno y conexión a la base
│   ├── routes/           # Definición de endpoints
│   ├── controllers/      # Manejo de requests
│   ├── services/         # Consultas reutilizables
│   ├── models/           # Schemas de Mongoose
│   ├── middlewares/      # Auth, 404 y manejo de errores
│   └── utils/            # Helpers de paginación y JWT
└── client/               # App de React (Vite)
    └── src/
        ├── auth/         # Contexto de sesión y protección de rutas
        ├── pages/        # Un componente por ruta
        ├── posts/        # Tarjetas, listas, formulario y links de posts
        ├── comments/     # Lista y formulario de comentarios
        ├── profile/      # Encabezado del perfil, botón de seguir, editor de bio
        ├── components/   # Interfaz compartida (layout, avatar, logo, formularios)
        ├── i18n/         # Textos en inglés y español
        ├── theme/        # Tema claro y oscuro
        └── lib/          # Cliente tipado de la API y hooks reutilizables
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

Dentro de `client/`: `npm run dev`, `npm run build`, `npm run lint` y `npm run preview` (sirve la versión de producción en el puerto 4173).

## API

Todos los endpoints están bajo `/api`. En la columna **Auth**, **requerida** significa que hace falta el header `Authorization: Bearer <token>`, y **opcional** que el endpoint es público pero usa el token si lo hay (por ejemplo, para saber si le diste link a un post). Los errores siempre tienen la forma `{ "error": "mensaje" }`.

### Auth

| Método | Endpoint         | Auth      | Descripción                                                                                             |
| ------ | ---------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| POST   | `/auth/register` |           | Crea una cuenta. Body: `username`, `email`, `password` (8 caracteres o más). Devuelve `{ token, user }` |
| POST   | `/auth/login`    |           | Inicia sesión. Body: `email`, `password`. Devuelve `{ token, user }`                                    |
| GET    | `/auth/me`       | requerida | Usuario actual                                                                                          |

### Posts

| Método | Endpoint          | Auth      | Descripción                                                                          |
| ------ | ----------------- | --------- | ------------------------------------------------------------------------------------ |
| POST   | `/posts`          | requerida | Crea un post. Body: `text`                                                           |
| GET    | `/posts`          | opcional  | Todos los posts, del más nuevo al más viejo (paginado)                               |
| GET    | `/posts/:id`      | opcional  | Un post. Si fue borrado devuelve `{ _id, deleted: true, commentsCount, ... }`        |
| DELETE | `/posts/:id`      | requerida | Borra uno de tus posts (borrado lógico: el texto se elimina, los comentarios quedan) |
| POST   | `/posts/:id/link` | requerida | Le da link al post. Devuelve `{ linksCount, linkedByMe }`                            |
| DELETE | `/posts/:id/link` | requerida | Quita tu link. Devuelve `{ linksCount, linkedByMe }`                                 |

Un post tiene esta forma:

```json
{
    "_id": "...",
    "text": "Hola WebLink",
    "author": { "_id": "...", "username": "santi", "bio": "" },
    "linksCount": 3,
    "linkedByMe": true,
    "commentsCount": 2,
    "deletedAt": null,
    "createdAt": "2026-10-09T12:00:00.000Z",
    "updatedAt": "2026-10-09T12:00:00.000Z"
}
```

Sin token, `linkedByMe` siempre es `false`.

### Comentarios

| Método | Endpoint              | Auth      | Descripción                                                                               |
| ------ | --------------------- | --------- | ----------------------------------------------------------------------------------------- |
| GET    | `/posts/:id/comments` |           | Comentarios de un post, del más nuevo al más viejo (paginado). Funciona en posts borrados |
| POST   | `/posts/:id/comments` | requerida | Comenta un post. Body: `text`. No se permite en posts borrados (409)                      |
| DELETE | `/comments/:id`       | requerida | Borra un comentario: lo puede hacer su autor o el autor del post                          |

### Usuarios

| Método | Endpoint                 | Auth      | Descripción                                                            |
| ------ | ------------------------ | --------- | ---------------------------------------------------------------------- |
| GET    | `/users/:username`       | opcional  | Perfil con `followers`, `following` e `isFollowing` (`null` sin token) |
| GET    | `/users/:username/posts` | opcional  | Posts de un usuario (paginado)                                         |
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

Las listas de posts y de comentarios aceptan dos parámetros de query:

- `limit`: elementos por página (por defecto `20`, máximo `50`)
- `before`: cursor, solo devuelve elementos creados antes de esa fecha

La respuesta tiene la forma `{ posts, nextCursor }` (o `{ comments, nextCursor }`). Para pedir la página siguiente, mandar `nextCursor` como `before`. Cuando no hay más elementos, `nextCursor` es `null`.

```
GET /api/posts?limit=20
GET /api/posts?limit=20&before=2026-10-09T12:00:00.000Z
```

## Hoja de ruta

- [x] API REST
- [x] Páginas de auth, feed y perfil
- [x] Links y comentarios
- [x] Borrado lógico de posts
- [x] Estilos, tema claro y oscuro, inglés y español
- [ ] Deploy
- [ ] Capturas y link a la demo online
