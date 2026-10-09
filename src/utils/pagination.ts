import type { Request } from "express";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export interface CursorParams {
    limit: number;
    cursor: Date | undefined;
}

export function parseCursorParams(req: Request): CursorParams | null {
    const rawLimit = Number(req.query.limit);
    const limit =
        Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

    const before = req.query.before;

    if (before === undefined) {
        return { limit, cursor: undefined };
    }

    if (typeof before !== "string") {
        return null;
    }

    const cursor = new Date(before);

    if (Number.isNaN(cursor.getTime())) {
        return null;
    }

    return { limit, cursor };
}

// Keeps only items older than the cursor. Empty on the first page.
export function createdBefore(page: CursorParams): { createdAt?: { $lt: Date } } {
    return page.cursor ? { createdAt: { $lt: page.cursor } } : {};
}

export function nextCursorOf(items: { createdAt: Date }[], limit: number): string | null {
    const last = items.at(-1);

    return items.length === limit && last ? last.createdAt.toISOString() : null;
}
