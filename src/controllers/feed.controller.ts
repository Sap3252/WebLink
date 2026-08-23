import type { Request, Response } from "express";
import type { QueryFilter } from "mongoose";
import Follow from "../models/Follow.js";
import Post, { type IPost } from "../models/Post.js";
import { parseCursorParams, nextCursorOf } from "../utils/pagination.js";

export async function getFeed(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const page = parseCursorParams(req);

    if (!page) {
        res.status(400).json({ error: "Invalid pagination parameters" });
        return;
    }

    try {
        const follows = await Follow.find({ follower: userId }).select("following").lean();
        const authors = follows.map((follow) => follow.following.toString());

        authors.push(userId);

        const filter: QueryFilter<IPost> = { author: { $in: authors } };

        if (page.cursor) {
            filter.createdAt = { $lt: page.cursor };
        }

        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .limit(page.limit)
            .populate("author", "username bio");

        res.json({ posts, nextCursor: nextCursorOf(posts, page.limit) });
    } catch (error) {
        console.error("getFeed failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
