import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

const BEARER_PREFIX = "Bearer ";

export function signToken(userId: string): string {
    return jwt.sign({ sub: userId }, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]>,
    });
}

export function extractBearerToken(header: string | undefined): string | undefined {
    return header?.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length) : undefined;
}

export function getUserIdFromToken(token: string): string | undefined {
    try {
        const payload = jwt.verify(token, env.jwtSecret);

        return typeof payload !== "string" && typeof payload.sub === "string"
            ? payload.sub
            : undefined;
    } catch {
        return undefined;
    }
}
