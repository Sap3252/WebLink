# WebLink

**English** | [Español](README.es.md)

A small social network: users publish short posts (up to 250 characters), follow each other, give posts a **link** (WebLink's take on a like) and talk about them in the comments.

Built as a learning project, with a REST API in Express + MongoDB and a React client.

> **Status:** the API and the React client are complete. Next step: deployment.

## Tech stack

| Layer    | Technologies                                                    |
| -------- | --------------------------------------------------------------- |
| Backend  | Node.js, Express 5, TypeScript, MongoDB + Mongoose, JWT, bcrypt |
| Frontend | React 19, TypeScript, Vite, React Router, CSS Modules           |
| Tooling  | Prettier, ESLint, tsx                                           |

## Features

**Social**

- Sign up and log in with JWT. Passwords are hashed with bcrypt and never returned by the API. When a session expires, the app sends you back to the login page.
- Posts of up to 250 characters, and a personalized feed with your posts and those of the users you follow.
- **Links**: give a post a link, the WebLink version of a like.
- **Comments** on each post's own page. A comment can be deleted by its author or by the author of the post.
- Follow and unfollow users. Profiles show follower counts, the user's posts and an editable bio.
- **Soft delete**: a deleted post disappears from every list and its text is wiped, but its comments stay visible and the conversation is closed.

**Interface**

- English and Spanish, switchable at any time.
- Light and dark theme: follows the system setting until you pick one.
- Glass design over an animated aurora background, with posts sliding in from the sides.
- Works on phones, with accessible labels and keyboard support.

**API**

- Cursor-based pagination on every list of posts and comments.
- Centralized error handling: every error is returned as `{ "error": "..." }`.

## Project structure

```
WebLink/
├── src/                  # API (Express + TypeScript)
│   ├── config/           # Environment validation and DB connection
│   ├── routes/           # Endpoint definitions
│   ├── controllers/      # Request handling
│   ├── services/         # Reusable queries
│   ├── models/           # Mongoose schemas
│   ├── middlewares/      # Auth, 404 and error handling
│   └── utils/            # Pagination and JWT helpers
└── client/               # React app (Vite)
    └── src/
        ├── auth/         # Session context and route guards
        ├── pages/        # One component per route
        ├── posts/        # Post cards, lists, composer and links
        ├── comments/     # Comment list and composer
        ├── profile/      # Profile header, follow button, bio editor
        ├── components/   # Shared UI (layout, avatar, logo, forms)
        ├── i18n/         # English and Spanish texts
        ├── theme/        # Light and dark theme
        └── lib/          # Typed API client and reusable hooks
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

| Variable         | Required | Default                                       | Description                                      |
| ---------------- | -------- | --------------------------------------------- | ------------------------------------------------ |
| `MONGO_URI`      | Yes      |                                               | MongoDB connection string                        |
| `JWT_SECRET`     | Yes      |                                               | Secret used to sign tokens                       |
| `JWT_EXPIRES_IN` | No       | `7d`                                          | Token lifetime                                   |
| `PORT`           | No       | `3000`                                        | API port                                         |
| `CORS_ORIGIN`    | No       | `http://localhost:5173,http://localhost:4173` | Origins allowed to call the API, comma-separated |
| `NODE_ENV`       | No       | `development`                                 | Environment                                      |

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

Inside `client/`: `npm run dev`, `npm run build`, `npm run lint` and `npm run preview` (serves the production build on port 4173).

## API

All endpoints are under `/api`. In the **Auth** column, **required** means the header `Authorization: Bearer <token>` is needed, and **optional** means the endpoint is public but uses the token when there is one (for example, to tell whether you linked a post). Errors always have the shape `{ "error": "message" }`.

### Auth

| Method | Endpoint         | Auth     | Description                                                                                         |
| ------ | ---------------- | -------- | --------------------------------------------------------------------------------------------------- |
| POST   | `/auth/register` |          | Create an account. Body: `username`, `email`, `password` (8+ characters). Returns `{ token, user }` |
| POST   | `/auth/login`    |          | Log in. Body: `email`, `password`. Returns `{ token, user }`                                        |
| GET    | `/auth/me`       | required | Current user                                                                                        |

### Posts

| Method | Endpoint          | Auth     | Description                                                                        |
| ------ | ----------------- | -------- | ---------------------------------------------------------------------------------- |
| POST   | `/posts`          | required | Create a post. Body: `text`                                                        |
| GET    | `/posts`          | optional | All posts, newest first (paginated)                                                |
| GET    | `/posts/:id`      | optional | A single post. A deleted post returns `{ _id, deleted: true, commentsCount, ... }` |
| DELETE | `/posts/:id`      | required | Delete one of your posts (soft delete: the text is wiped, the comments stay)       |
| POST   | `/posts/:id/link` | required | Give the post a link. Returns `{ linksCount, linkedByMe }`                         |
| DELETE | `/posts/:id/link` | required | Remove your link. Returns `{ linksCount, linkedByMe }`                             |

A post looks like this:

```json
{
    "_id": "...",
    "text": "Hello WebLink",
    "author": { "_id": "...", "username": "santi", "bio": "" },
    "linksCount": 3,
    "linkedByMe": true,
    "commentsCount": 2,
    "deletedAt": null,
    "createdAt": "2026-10-09T12:00:00.000Z",
    "updatedAt": "2026-10-09T12:00:00.000Z"
}
```

`linkedByMe` is always `false` without a token.

### Comments

| Method | Endpoint              | Auth     | Description                                                          |
| ------ | --------------------- | -------- | -------------------------------------------------------------------- |
| GET    | `/posts/:id/comments` |          | Comments of a post, newest first (paginated). Works on deleted posts |
| POST   | `/posts/:id/comments` | required | Comment on a post. Body: `text`. Not allowed on deleted posts (409)  |
| DELETE | `/comments/:id`       | required | Delete a comment: allowed for its author and for the post's author   |

### Users

| Method | Endpoint                 | Auth     | Description                                                                      |
| ------ | ------------------------ | -------- | -------------------------------------------------------------------------------- |
| GET    | `/users/:username`       | optional | Profile with `followers`, `following` and `isFollowing` (`null` without a token) |
| GET    | `/users/:username/posts` | optional | Posts of a user (paginated)                                                      |
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

Lists of posts and comments accept two query parameters:

- `limit`: items per page (default `20`, max `50`)
- `before`: cursor, only returns items created before this date

The response has the shape `{ posts, nextCursor }` (or `{ comments, nextCursor }`). To get the next page, send `nextCursor` as `before`. When there are no more items, `nextCursor` is `null`.

```
GET /api/posts?limit=20
GET /api/posts?limit=20&before=2026-10-09T12:00:00.000Z
```

## Roadmap

- [x] REST API
- [x] Auth, feed and profile pages
- [x] Links and comments
- [x] Soft delete of posts
- [x] Styling, light and dark theme, English and Spanish
- [ ] Deployment
- [ ] Screenshots and live demo link
