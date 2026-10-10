# WebLink

**English** | [Español](README.es.md)

A small social network: users publish short posts (up to 250 characters) with an optional photo, follow each other, give posts a **link** (WebLink's take on a like) and talk about them in the comments.

Built as a learning project, with a REST API in Express + MongoDB and a React client.

> **Status:** live at [weblink-45tw.onrender.com](https://weblink-45tw.onrender.com), deployed on Render. The free plan sleeps after 15 minutes without visits, so the first request can take about a minute.

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
- **Photos**: one per post, with an optional description for screen readers. They go straight from the browser to Cloudinary and are stored without metadata, so a phone photo doesn't reveal where it was taken.
- **Links**: give a post a link, the WebLink version of a like.
- **Comments** on each post's own page. A comment can be deleted by its author or by the author of the post.
- Follow and unfollow users. Profiles show follower counts, the user's posts and an editable bio.
- **Search** profiles by username.
- **Soft delete**: a deleted post disappears from every list and its text and photo are wiped, but its comments stay visible and the conversation is closed.

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
        ├── search/       # Profile search
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

| Variable                | Required | Default                                       | Description                                          |
| ----------------------- | -------- | --------------------------------------------- | ---------------------------------------------------- |
| `MONGO_URI`             | Yes      |                                               | MongoDB connection string                            |
| `MONGO_MAX_POOL_SIZE`   | No       | `20`                                          | Max open connections from each API server to MongoDB |
| `JWT_SECRET`            | Yes      |                                               | Secret used to sign tokens                           |
| `JWT_EXPIRES_IN`        | No       | `7d`                                          | Token lifetime                                       |
| `PORT`                  | No       | `3000`                                        | API port                                             |
| `CORS_ORIGIN`           | No       | `http://localhost:5173,http://localhost:4173` | Origins allowed to call the API, comma-separated     |
| `NODE_ENV`              | No       | `development`                                 | Environment                                          |
| `CLOUDINARY_CLOUD_NAME` | No       |                                               | Cloudinary cloud name, for photo uploads             |
| `CLOUDINARY_API_KEY`    | No       |                                               | Cloudinary API key                                   |
| `CLOUDINARY_API_SECRET` | No       |                                               | Cloudinary API secret                                |

The three `CLOUDINARY_*` variables come from a free [Cloudinary](https://cloudinary.com) account. Without them everything works except uploading photos.

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

| Method | Endpoint          | Auth     | Description                                                                         |
| ------ | ----------------- | -------- | ----------------------------------------------------------------------------------- |
| POST   | `/posts`          | required | Create a post. Body: `text` and/or `image: { publicId, alt }` (see Uploads)         |
| GET    | `/posts`          | optional | All posts, newest first (paginated)                                                 |
| GET    | `/posts/:id`      | optional | A single post. A deleted post returns `{ _id, deleted: true, commentsCount, ... }`  |
| DELETE | `/posts/:id`      | required | Delete one of your posts (soft delete: text and photo are wiped, the comments stay) |
| POST   | `/posts/:id/link` | required | Give the post a link. Returns `{ linksCount, linkedByMe }`                          |
| DELETE | `/posts/:id/link` | required | Remove your link. Returns `{ linksCount, linkedByMe }`                              |

A post looks like this:

```json
{
    "_id": "...",
    "text": "Hello WebLink",
    "image": {
        "publicId": "weblink/posts/<userId>/abc123",
        "url": "https://res.cloudinary.com/...",
        "width": 1200,
        "height": 800,
        "alt": "A sunset over the sea"
    },
    "author": { "_id": "...", "username": "santi", "bio": "" },
    "linksCount": 3,
    "linkedByMe": true,
    "commentsCount": 2,
    "deletedAt": null,
    "createdAt": "2026-10-09T12:00:00.000Z",
    "updatedAt": "2026-10-09T12:00:00.000Z"
}
```

`linkedByMe` is always `false` without a token. `text` is missing in posts that only have a photo, and `image` is `null` in posts without one.

### Uploads

Photos go from the browser straight to Cloudinary, so the API never handles the file:

1. `POST /uploads/signature` returns a short-lived signature.
2. The browser uploads the photo to Cloudinary with it and gets a `publicId`.
3. `POST /posts` with `image: { publicId, alt }`. The API checks that the photo exists, belongs to the author, isn't used by another post and isn't larger than 5 MB.

| Method | Endpoint             | Auth     | Description                                                                        |
| ------ | -------------------- | -------- | ---------------------------------------------------------------------------------- |
| POST   | `/uploads/signature` | required | Signature to upload one photo (JPG, PNG, WebP or GIF). 503 if Cloudinary isn't set |

### Comments

| Method | Endpoint              | Auth     | Description                                                          |
| ------ | --------------------- | -------- | -------------------------------------------------------------------- |
| GET    | `/posts/:id/comments` |          | Comments of a post, newest first (paginated). Works on deleted posts |
| POST   | `/posts/:id/comments` | required | Comment on a post. Body: `text`. Not allowed on deleted posts (409)  |
| DELETE | `/comments/:id`       | required | Delete a comment: allowed for its author and for the post's author   |

### Users

| Method | Endpoint                 | Auth     | Description                                                                                 |
| ------ | ------------------------ | -------- | ------------------------------------------------------------------------------------------- |
| GET    | `/users?q=text`          |          | Search by username: names starting with the text first, then those containing it (up to 10) |
| GET    | `/users/:username`       | optional | Profile with `followers`, `following` and `isFollowing` (`null` without a token)            |
| GET    | `/users/:username/posts` | optional | Posts of a user (paginated)                                                                 |
| PATCH  | `/users/me`              | required | Update your `username` and/or `bio`                                                         |
| GET    | `/users/:id/followers`   |          | Users that follow this user                                                                 |
| GET    | `/users/:id/following`   |          | Users this user follows                                                                     |
| POST   | `/users/:id/follow`      | required | Follow a user                                                                               |
| DELETE | `/users/:id/follow`      | required | Unfollow a user                                                                             |

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
- [x] Deployment
- [x] Profile search
- [x] Photos in posts
- [ ] Screenshots
