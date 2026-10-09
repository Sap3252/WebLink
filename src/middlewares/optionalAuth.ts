import type { NextFunction, Request, Response } from "express";
import { extractBearerToken, getUserIdFromToken } from "../utils/token.js";

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    const token = extractBearerToken(req.headers.authorization);
    const userId = token ? getUserIdFromToken(token) : undefined;

    if (userId) {
        req.userId = userId;
    }

    next();
}
