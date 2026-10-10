import type { Request, Response } from "express";
import mongoose from "mongoose";
import Post, { ACTIVE_POST, IMAGE_ALT_MAX_LENGTH, type IPostImage } from "../models/Post.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";
import {
    MAX_IMAGE_BYTES,
    deleteImage,
    findUploadedImage,
    imagesEnabled,
    userImageFolder,
} from "../services/image.service.js";
import { findPostsPage, withLinkedByMe } from "../services/post.service.js";
import { parseCursorParams } from "../utils/pagination.js";

type ImageCheck = { ok: true; image: IPostImage } | { ok: false; status: number; error: string };

// Checks the photo the client says it uploaded: it must be in the author's folder,
// exist in Cloudinary, not be used by another post and not exceed the size limit.
async function checkPostImage(input: unknown, authorId: string): Promise<ImageCheck> {
    const { publicId, alt = "" } = (input ?? {}) as { publicId?: unknown; alt?: unknown };

    if (typeof publicId !== "string" || typeof alt !== "string") {
        return { ok: false, status: 400, error: "Invalid image" };
    }

    if (alt.trim().length > IMAGE_ALT_MAX_LENGTH) {
        return { ok: false, status: 400, error: "Image description is too long" };
    }

    if (!imagesEnabled()) {
        return { ok: false, status: 503, error: "Image uploads are not configured" };
    }

    if (!publicId.startsWith(`${userImageFolder(authorId)}/`)) {
        return { ok: false, status: 400, error: "Invalid image" };
    }

    if (await Post.exists({ "image.publicId": publicId })) {
        return { ok: false, status: 409, error: "Image already used in another post" };
    }

    const uploaded = await findUploadedImage(publicId);

    if (!uploaded) {
        return { ok: false, status: 400, error: "Invalid image" };
    }

    if (uploaded.bytes > MAX_IMAGE_BYTES) {
        await deleteImage(publicId);
        return { ok: false, status: 400, error: "Image is too large" };
    }

    return {
        ok: true,
        image: {
            publicId: uploaded.publicId,
            url: uploaded.url,
            width: uploaded.width,
            height: uploaded.height,
            alt: alt.trim(),
        },
    };
}

// POST /posts: text, a photo, or both.
export async function createPost(req: Request, res: Response): Promise<void> {
    const author = req.userId;

    if (!author) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const { text, image } = req.body ?? {};

    if (text !== undefined && typeof text !== "string") {
        res.status(400).json({ error: "text is required" });
        return;
    }

    const trimmedText = typeof text === "string" ? text.trim() : "";

    if (!trimmedText && image === undefined) {
        res.status(400).json({ error: "text is required" });
        return;
    }

    let postImage: IPostImage | null = null;

    if (image !== undefined) {
        const check = await checkPostImage(image, author);

        if (!check.ok) {
            res.status(check.status).json({ error: check.error });
            return;
        }

        postImage = check.image;
    }

    const post = await Post.create({
        ...(trimmedText ? { text: trimmedText } : {}),
        image: postImage,
        author,
    });
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
        // A deleted post only says that it existed (and how many comments it has):
        // no text, no author.
        res.json({
            _id: post._id,
            deleted: true,
            commentsCount: post.commentsCount,
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

    // Soft delete: mark the date and wipe the content (text and photo). updateOne skips
    // validation, so the post can be saved without text.
    await Post.updateOne(
        { _id: id },
        { $set: { deletedAt: new Date(), image: null }, $unset: { text: 1 } },
    );

    // The photo is removed from Cloudinary too. If that fails the post is still deleted;
    // the file is only logged so it can be cleaned up later.
    if (post.image) {
        try {
            await deleteImage(post.image.publicId);
        } catch (error) {
            console.error(`Could not delete image ${post.image.publicId}:`, error);
        }
    }

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
