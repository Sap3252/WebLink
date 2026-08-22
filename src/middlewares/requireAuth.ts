import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const BEARER_PREFIX = "Bearer ";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (!header?.startsWith(BEARER_PREFIX)) {
        res.status(401).json({ error: "Missing or malformed Authorization header" });
        return;
    }

    try {
        const payload = jwt.verify(header.slice(BEARER_PREFIX.length), env.jwtSecret);

        if (typeof payload === "string" || typeof payload.sub !== "string") {
            res.status(401).json({ error: "Invalid token" });
            return;
        }

        req.userId = payload.sub;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
