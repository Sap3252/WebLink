import type { NextFunction, Request, Response } from "express";
import { extractBearerToken, getUserIdFromToken } from "../utils/token.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
        res.status(401).json({ error: "Missing or malformed Authorization header" });
        return;
    }

    const userId = getUserIdFromToken(token);

    if (!userId) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }

    req.userId = userId;
    next();
}
