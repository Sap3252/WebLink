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
    jwtSecret: required("JWT_SECRET"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    corsOrigins,
} as const;
