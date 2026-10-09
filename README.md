# WebLink

**English** | [Español](README.es.md)

A minimal social network: users publish short posts (up to 250 characters), follow other users and read a feed with the posts of the people they follow.

Built as a learning project, with a REST API in Express + MongoDB and a React client.

> **Status:** the API is complete (auth, posts, follows, feed and pagination). The frontend is in progress: routing and the typed API client are ready, the pages come next.

## Tech stack

| Layer    | Technologies                                                    |
| -------- | --------------------------------------------------------------- |
| Backend  | Node.js, Express 5, TypeScript, MongoDB + Mongoose, JWT, bcrypt |
| Frontend | React 19, TypeScript, Vite, React Router                        |
| Tooling  | Prettier, ESLint, tsx                                           |

## Features

- Sign up and log in with JWT. Passwords are hashed with bcrypt and never returned by the API.
- Posts of up to 250 characters. Users can only delete their own posts.
- Follow and unfollow users, with follower and following lists.
- Profiles with follower counts and whether the current user follows them.
- Personalized feed with your posts and the posts of the users you follow.
- Cursor-based pagination on every post list.
- Centralized error handling: every error is returned as `{ "error": "..." }`.

## Project structure

```
WebLink/
├── src/                 # API (Express + TypeScript)
│   ├── config/          # Environment validation and DB connection
│   ├── routes/          # Endpoint definitions
│   ├── controllers/     # Request handling
│   ├── services/        # Reusable queries
│   ├── models/          # Mongoose schemas
│   ├── middlewares/     # Auth, 404 and error handling
│   └── utils/           # Pagination and JWT helpers
└── client/              # React app (Vite)
    └── src/lib/         # Typed API client
```

## Getting started

### Prerequisites

- Node.js 22 or newer
- A MongoDB database, local or on [MongoDB Atlas](https://www.mongodb.com/atlas) (the free tier is enough)

### 1. Install

```bash
git clone https://github.com/Sap3252/WebLink.git
cd WebLink
npm install
npm install --prefix client
```

### 2. Configure

Copy `.env.example` to `.env` in the project root and fill it in:

| Variable         | Required | Default                 | Description                    |
| ---------------- | -------- | ----------------------- | ------------------------------ |
| `MONGO_URI`      | Yes      |                         | MongoDB connection string      |
| `JWT_SECRET`     | Yes      |                         | Secret used to sign tokens     |
| `JWT_EXPIRES_IN` | No       | `7d`                    | Token lifetime                 |
| `PORT`           | No       | `3000`                  | API port                       |
| `CORS_ORIGIN`    | No       | `http://localhost:5173` | Origin allowed to call the API |
| `NODE_ENV`       | No       | `development`           | Environment                    |

Then copy `client/.env.example` to `client/.env`. It contains `VITE_API_URL`, the API base URL (`http://localhost:3000/api` by default).

### 3. Run

Start the API and the client in two terminals:

```bash
npm run dev
```

```bash
npm run dev --prefix client
```

The API runs on `http://localhost:3000` and the client on `http://localhost:5173`.

## Scripts

Project root:

| Script                 | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the API with hot reload             |
| `npm run build`        | Compile the API to `dist/`                |
| `npm start`            | Run the compiled API                      |
| `npm run typecheck`    | Type-check the API                        |
| `npm run format`       | Format the whole repository with Prettier |
| `npm run format:check` | Check formatting without changing files   |

Inside `client/`: `npm run dev`, `npm run build`, `npm run lint` and `npm run preview`.

## API

All endpoints are under `/api`. Endpoints marked as **required** need the header `Authorization: Bearer <token>`. Errors always have the shape `{ "error": "message" }`.

### Auth

| Method | Endpoint         | Auth     | Description                                                                                         |
| ------ | ---------------- | -------- | --------------------------------------------------------------------------------------------------- |
| POST   | `/auth/register` |          | Create an account. Body: `username`, `email`, `password` (8+ characters). Returns `{ token, user }` |
| POST   | `/auth/login`    |          | Log in. Body: `email`, `password`. Returns `{ token, user }`                                        |
| GET    | `/auth/me`       | required | Current user                                                                                        |

### Posts

| Method | Endpoint     | Auth     | Description                         |
| ------ | ------------ | -------- | ----------------------------------- |
| POST   | `/posts`     | required | Create a post. Body: `text`         |
| GET    | `/posts`     |          | All posts, newest first (paginated) |
| GET    | `/posts/:id` |          | A single post                       |
| DELETE | `/posts/:id` | required | Delete one of your posts            |

### Users

| Method | Endpoint                 | Auth     | Description                                                                      |
| ------ | ------------------------ | -------- | -------------------------------------------------------------------------------- |
| GET    | `/users/:username`       | optional | Profile with `followers`, `following` and `isFollowing` (`null` without a token) |
| GET    | `/users/:username/posts` |          | Posts of a user (paginated)                                                      |
| PATCH  | `/users/me`              | required | Update your `username` and/or `bio`                                              |
| GET    | `/users/:id/followers`   |          | Users that follow this user                                                      |
| GET    | `/users/:id/following`   |          | Users this user follows                                                          |
| POST   | `/users/:id/follow`      | required | Follow a user                                                                    |
| DELETE | `/users/:id/follow`      | required | Unfollow a user                                                                  |

### Feed

| Method | Endpoint | Auth     | Description                                              |
| ------ | -------- | -------- | -------------------------------------------------------- |
| GET    | `/feed`  | required | Your posts and those of the users you follow (paginated) |

### Pagination

Paginated endpoints accept two query parameters:

- `limit`: posts per page (default `20`, max `50`)
- `before`: cursor, only returns posts created before this date

The response has the shape `{ posts, nextCursor }`. To get the next page, send `nextCursor` as `before`. When there are no more posts, `nextCursor` is `null`.

```
GET /api/posts?limit=20
GET /api/posts?limit=20&before=2026-10-09T12:00:00.000Z
```

## Roadmap

- [x] REST API
- [ ] Auth context and login/register pages
- [ ] Feed page
- [ ] Profile page with follow button
- [ ] Styling
- [ ] Deployment
