import type { Request, Response } from "express";
import mongoose from "mongoose";
import Link from "../models/Link.js";
import Post from "../models/Post.js";

async function changeLinksCount(postId: string, change: 1 | -1): Promise<number> {
    const post = await Post.findByIdAndUpdate(
        postId,
        { $inc: { linksCount: change } },
        { returnDocument: "after" },
    )
        .select("linksCount")
        .lean();

    return post?.linksCount ?? 0;
}

export async function linkPost(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid post id" });
        return;
    }

    const post = await Post.exists({ _id: id });

    if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
    }

    const alreadyLinked = await Link.exists({ user: userId, post: id });

    if (alreadyLinked) {
        res.status(409).json({ error: "You already linked this post" });
        return;
    }

    await Link.create({ user: userId, post: id });

    res.status(201).json({ linksCount: await changeLinksCount(id, 1), linkedByMe: true });
}

export async function unlinkPost(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid post id" });
        return;
    }

    const removed = await Link.findOneAndDelete({ user: userId, post: id });

    if (!removed) {
        res.status(404).json({ error: "You haven't linked this post" });
        return;
    }

    res.json({ linksCount: await changeLinksCount(id, -1), linkedByMe: false });
}
