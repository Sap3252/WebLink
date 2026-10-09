import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

const DUPLICATE_KEY_CODE = 11000;

interface DuplicateKeyError {
    code: typeof DUPLICATE_KEY_CODE;
    keyValue: Record<string, unknown>;
}

interface ClientHttpError {
    status: number;
    message: string;
}

function isDuplicateKeyError(error: unknown): error is DuplicateKeyError {
    return (
        typeof error === "object" &&
        error !== null &&
        (error as { code?: unknown }).code === DUPLICATE_KEY_CODE
    );
}

function isClientHttpError(error: unknown): error is ClientHttpError {
    const status = (error as { status?: unknown } | null)?.status;
    return typeof status === "number" && status >= 400 && status < 500;
}

export function errorHandler(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ error: error.message });
        return;
    }

    if (isDuplicateKeyError(error)) {
        const fields = Object.keys(error.keyValue).join(", ");
        res.status(409).json({ error: `${fields} already in use` });
        return;
    }

    if (isClientHttpError(error)) {
        res.status(error.status).json({ error: error.message });
        return;
    }

    console.error(`${req.method} ${req.originalUrl} failed:`, error);
    res.status(500).json({ error: "Internal server error" });
}
