import type { Request, Response } from "express";
import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";
import { findCommentsPage } from "../services/comment.service.js";
import { parseCursorParams } from "../utils/pagination.js";

async function changeCommentsCount(postId: mongoose.Types.ObjectId | string, change: 1 | -1) {
    await Post.updateOne({ _id: postId }, { $inc: { commentsCount: change } });
}

// GET /posts/:id/comments: public, and still works for deleted posts.
export async function listComments(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid post id" });
        return;
    }

    const page = parseCursorParams(req);

    if (!page) {
        res.status(400).json({ error: "Invalid pagination parameters" });
        return;
    }

    const post = await Post.exists({ _id: id });

    if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
    }

    res.json(await findCommentsPage(id, page));
}

export async function createComment(req: Request, res: Response): Promise<void> {
    const author = req.userId;

    if (!author) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid post id" });
        return;
    }

    const { text } = req.body ?? {};

    if (typeof text !== "string") {
        res.status(400).json({ error: "text is required" });
        return;
    }

    const post = await Post.findById(id).select("deletedAt").lean();

    if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
    }

    // A deleted post keeps its comments, but the conversation is closed.
    if (post.deletedAt) {
        res.status(409).json({ error: "This post was deleted" });
        return;
    }

    const comment = await Comment.create({ post: id, author, text });
    await comment.populate("author", PUBLIC_USER_FIELDS);
    await changeCommentsCount(id, 1);

    res.status(201).json(comment);
}

// DELETE /comments/:id: the comment's author or the post's author can delete it.
export async function deleteComment(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const { id } = req.params;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid comment id" });
        return;
    }

    const comment = await Comment.findById(id);

    if (!comment) {
        res.status(404).json({ error: "Comment not found" });
        return;
    }

    const post = await Post.findById(comment.post).select("author").lean();
    const isCommentAuthor = comment.author.toString() === userId;
    const isPostAuthor = post?.author.toString() === userId;

    if (!isCommentAuthor && !isPostAuthor) {
        res.status(403).json({
            error: "You can only delete your own comments or comments on your posts",
        });
        return;
    }

    await comment.deleteOne();
    await changeCommentsCount(comment.post, -1);

    res.status(204).send();
}
