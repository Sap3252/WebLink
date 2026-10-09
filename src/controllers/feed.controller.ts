import type { Request, Response } from "express";
import Follow from "../models/Follow.js";
import { findPostsPage } from "../services/post.service.js";
import { parseCursorParams } from "../utils/pagination.js";

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

    const follows = await Follow.find({ follower: userId }).select("following").lean();
    const authors = follows.map((follow) => follow.following.toString());

    authors.push(userId);

    res.json(await findPostsPage({ author: { $in: authors } }, page, userId));
}
