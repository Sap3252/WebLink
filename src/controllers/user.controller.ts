import type { Request, Response } from "express";
import mongoose from "mongoose";
import type { QueryFilter } from "mongoose";
import Follow from "../models/Follow.js";
import User from "../models/User.js";
import Post, { type IPost } from "../models/Post.js";
import { parseCursorParams, nextCursorOf } from "../utils/pagination.js";

function isDuplicateKeyError(error: unknown): boolean {
    return (
        typeof error === "object" && error !== null && (error as { code?: unknown }).code === 11000
    );
}

export async function followUser(req: Request, res: Response): Promise<void> {
    const follower = req.userId;

    if (!follower) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const following = req.params.id;

    if (typeof following !== "string" || !mongoose.isValidObjectId(following)) {
        res.status(400).json({ error: "Invalid user id" });
        return;
    }

    if (following === follower) {
        res.status(400).json({ error: "You cannot follow yourself" });
        return;
    }

    try {
        const target = await User.exists({ _id: following });

        if (!target) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const follow = await Follow.create({ follower, following });

        res.status(201).json(follow);
    } catch (error) {
        if (isDuplicateKeyError(error)) {
            res.status(409).json({ error: "You are already following this user" });
            return;
        }

        console.error("followUser failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function unfollowUser(req: Request, res: Response): Promise<void> {
    const follower = req.userId;

    if (!follower) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const following = req.params.id;

    if (typeof following !== "string" || !mongoose.isValidObjectId(following)) {
        res.status(400).json({ error: "Invalid user id" });
        return;
    }

    try {
        const deleted = await Follow.findOneAndDelete({ follower, following });

        if (!deleted) {
            res.status(404).json({ error: "You are not following this user" });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error("unfollowUser failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateMe(req: Request, res: Response): Promise<void> {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    const { username, bio } = req.body ?? {};
    const updates: { username?: string; bio?: string } = {};

    if (username !== undefined) {
        if (typeof username !== "string" || username.trim().length === 0) {
            res.status(400).json({ error: "username must be a non-empty string" });
            return;
        }

        updates.username = username.trim();
    }

    if (bio !== undefined) {
        if (typeof bio !== "string") {
            res.status(400).json({ error: "bio must be a string" });
            return;
        }

        updates.bio = bio.trim();
    }

    if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: "Nothing to update" });
        return;
    }

    try {
        const user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ error: error.message });
            return;
        }

        if (isDuplicateKeyError(error)) {
            res.status(409).json({ error: "Username already in use" });
            return;
        }

        console.error("updateMe failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getUserProfile(req: Request, res: Response): Promise<void> {
    const username = req.params.username;

    if (typeof username !== "string") {
        res.status(400).json({ error: "Invalid username" });
        return;
    }

    try {
        const user = await User.findOne({ username: username.trim() });

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const viewer = req.userId;

        const [followers, following, follow] = await Promise.all([
            Follow.countDocuments({ following: user._id }),
            Follow.countDocuments({ follower: user._id }),
            viewer ? Follow.exists({ follower: viewer, following: user._id }) : null,
        ]);

        res.json({
            ...user.toJSON(),
            followers,
            following,
            isFollowing: viewer ? Boolean(follow) : null,
        });
    } catch (error) {
        console.error("getUserProfile failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getUserPosts(req: Request, res: Response): Promise<void> {
    const username = req.params.username;

    if (typeof username !== "string") {
        res.status(400).json({ error: "Invalid username" });
        return;
    }

    const page = parseCursorParams(req);

    if (!page) {
        res.status(400).json({ error: "Invalid pagination parameters" });
        return;
    }

    try {
        const user = await User.findOne({ username: username.trim() }).select("_id").lean();

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const filter: QueryFilter<IPost> = { author: user._id };

        if (page.cursor) {
            filter.createdAt = { $lt: page.cursor };
        }

        const posts = await Post.find(filter)
            .sort({ createdAt: -1 })
            .limit(page.limit)
            .populate("author", "username bio");

        res.json({ posts, nextCursor: nextCursorOf(posts, page.limit) });
    } catch (error) {
        console.error("getUserPosts failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getFollowers(req: Request, res: Response): Promise<void> {
    await listRelations(req, res, "followers");
}

export async function getFollowing(req: Request, res: Response): Promise<void> {
    await listRelations(req, res, "following");
}

async function listRelations(
    req: Request,
    res: Response,
    kind: "followers" | "following",
): Promise<void> {
    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
        res.status(400).json({ error: "Invalid user id" });
        return;
    }

    try {
        const filter = kind === "followers" ? { following: id } : { follower: id };
        const field = kind === "followers" ? "follower" : "following";

        const follows = await Follow.find(filter)
            .populate(field, "username bio")
            .sort({ createdAt: -1 });

        res.json({ users: follows.map((follow) => follow[field]) });
    } catch (error) {
        console.error(`${kind} failed:`, error);
        res.status(500).json({ error: "Internal server error" });
    }
}
