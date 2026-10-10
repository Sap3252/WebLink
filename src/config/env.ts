function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

// Open connections each API server keeps with MongoDB. Every copy of the API has its own
// pool, so with many copies keep this low enough to stay under the database's limit.
const mongoMaxPoolSize = Number(process.env.MONGO_MAX_POOL_SIZE ?? 20);

if (!Number.isInteger(mongoMaxPoolSize) || mongoMaxPoolSize <= 0) {
    throw new Error(`Invalid MONGO_MAX_POOL_SIZE: ${process.env.MONGO_MAX_POOL_SIZE}`);
}

// Image uploads (Cloudinary). Optional: without these three variables the API still runs
// and answers 503 when someone tries to upload a photo.
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

const cloudinary =
    cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret
        ? {
              cloudName: cloudinaryCloudName,
              apiKey: cloudinaryApiKey,
              apiSecret: cloudinaryApiSecret,
          }
        : null;

// Comma-separated list, e.g. the Vite dev server (5173) and `vite preview` (4173).
const DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://localhost:4173";

const corsOrigins = (process.env.CORS_ORIGIN ?? DEFAULT_CORS_ORIGINS)
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port,
    mongodbUri: required("MONGO_URI"),
    mongoMaxPoolSize,
    jwtSecret: required("JWT_SECRET"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    corsOrigins,
    cloudinary,
} as const;
