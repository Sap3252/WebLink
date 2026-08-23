import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const BEARER_PREFIX = "Bearer ";

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (header?.startsWith(BEARER_PREFIX)) {
        try {
            const payload = jwt.verify(header.slice(BEARER_PREFIX.length), env.jwtSecret);

            if (typeof payload !== "string" && typeof payload.sub === "string") {
                req.userId = payload.sub;
            }
        } catch {
            //en caso de no tener token o que sea invalido, queda undefined
        }
    }

    next();
}
