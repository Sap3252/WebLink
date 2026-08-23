import type { Request, Response } from "express";
import type { QueryFilter } from "mongoose";
import Follow from "../models/Follow.js";
import Post, { type IPost } from "../models/Post.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function getFeed(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const rawLimit = Number(req.query.limit);
    const limit = Number.isInteger(rawLimit) && rawLimit > 0
        ? Math.min(rawLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;

    const before = req.query.before;
    let cursor: Date | undefined;

    if (before !== undefined) {
        if (typeof before !== "string") {
            res.status(400).json({ error: "before must be a single ISO date" });
            return;
        }

        cursor = new Date(before);

        if (Number.isNaN(cursor.getTime())) {
            res.status(400).json({ error: "before must be a valid ISO date" });
            return;
        }
    }

    try {
        const follows = await Follow.find({ follower: userId }).select("following").lean();
        const authors = follows.map((follow) => follow.following.toString());

        authors.push(userId);

        const filter: QueryFilter<IPost> = { author: { $in: authors } };

        if (cursor) {
            filter.createdAt = { $lt: cursor };
        }

        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("author", "username bio");

        const last = posts.at(-1);

        res.json({
            posts,
            nextCursor: posts.length === limit && last ? last.createdAt.toISOString() : null
        });
    } catch (error) {
        console.error("getFeed failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
