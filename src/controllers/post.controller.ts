import type { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";
import { findPostsPage } from "../services/post.service.js";
import { parseCursorParams } from "../utils/pagination.js";

export async function createPost(req: Request, res: Response): Promise<void> {
    const author = req.userId;

    if (!author) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const { text } = req.body ?? {};

    if (typeof text !== "string") {
        res.status(400).json({ error: "text is required" });
        return;
    }

    const post = await Post.create({ text: text.trim(), author });
    await post.populate("author", PUBLIC_USER_FIELDS);

    res.status(201).json(post);
}

export async function getPost(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid post id" });
        return;
    }

    const post = await Post.findById(id).populate("author", PUBLIC_USER_FIELDS);

    if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
    }

    res.json(post);
}

export async function deletePost(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid post id" });
        return;
    }

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
    res.status(204).send();
}

export async function listPosts(req: Request, res: Response): Promise<void> {
    const page = parseCursorParams(req);

    if (!page) {
        res.status(400).json({ error: "Invalid pagination parameters" });
        return;
    }

    res.json(await findPostsPage({}, page));
}
