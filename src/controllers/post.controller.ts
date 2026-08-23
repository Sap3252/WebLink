import type { Request, Response } from "express";
import mongoose from "mongoose";
import type { QueryFilter } from "mongoose";
import Post, { type IPost } from "../models/Post.js";
import { parseCursorParams, nextCursorOf } from "../utils/pagination.js";


//POST /posts
export async function createPost(req: Request, res: Response): Promise<void> {
    const author = req.userId;

    if (!author) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const { text } = req.body ?? {};

    if (typeof text !== "string" || typeof author !== "string") {
        res.status(400).json({ error: "text and author are required" });
        return;
    }

    try {
        const post = await Post.create({ text: text.trim(), author });
        await post.populate("author", "username bio");

        res.status(201).json(post);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ error: error.message });
            return;
        }

        console.error("createPost failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

//GET /posts/:id
export async function getPost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

     if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid post id" });
        return;
    }

    try {
        const post = await Post.findById(id).populate("author", "username bio");

        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        res.json(post);
    } catch (error) {
        console.error("getPost failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function deletePost(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const { id } = req.params;

    if(!mongoose.isValidObjectId(id))
    {
        res.status(400).json({ error: "Invalid post id" });
        return;
    }

    try { 
        const post = await Post.findById(id);

        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }

        if (post.author.toString() !== userId) {
            res.status(403).json({ error: "You can only delete your own posts" });
            return;
        }

        await post.deleteOne();
        res.status(204).json({ message: "Post deleted successfully" });

    } catch (error) {
        console.error("deletePost failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function listPosts(req: Request, res: Response): Promise<void> {
    const page = parseCursorParams(req);

    if (!page) {
        res.status(400).json({ error: "Invalid pagination parameters" });
        return;
    }

    try {
        const filter: QueryFilter<IPost> = {};

        if (page.cursor) {
            filter.createdAt = { $lt: page.cursor };
        }

        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .limit(page.limit)
            .populate("author", "username bio");

        res.json({ posts, nextCursor: nextCursorOf(posts, page.limit) });
    } catch (error) {
        console.error("listPosts failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
