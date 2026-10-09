import type { Request, Response } from "express";
import mongoose from "mongoose";
import Post, { ACTIVE_POST } from "../models/Post.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";
import { findPostsPage, withLinkedByMe } from "../services/post.service.js";
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

    res.status(201).json({ ...post.toJSON(), linkedByMe: false });
}

export async function getPost(req: Request, res: Response): Promise<void> {
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

    if (post.deletedAt) {
        // A deleted post only says that it existed: no text, no author.
        res.json({
            _id: post._id,
            deleted: true,
            createdAt: post.createdAt,
            deletedAt: post.deletedAt,
        });
        return;
    }

    await post.populate("author", PUBLIC_USER_FIELDS);

    const [postWithLink] = await withLinkedByMe([post], req.userId);
    res.json(postWithLink);
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

    const post = await Post.findOne({ _id: id, ...ACTIVE_POST });

    if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
    }

    if (post.author.toString() !== userId) {
        res.status(403).json({ error: "You can only delete your own posts" });
        return;
    }

    // Soft delete: mark the date and wipe the content. updateOne skips validation,
    // so the post can be saved without text.
    await Post.updateOne({ _id: id }, { $set: { deletedAt: new Date() }, $unset: { text: 1 } });
    res.status(204).send();
}

export async function listPosts(req: Request, res: Response): Promise<void> {
    const page = parseCursorParams(req);

    if (!page) {
        res.status(400).json({ error: "Invalid pagination parameters" });
        return;
    }

    res.json(await findPostsPage({}, page, req.userId));
}
