import type { Request, Response } from "express";
import mongoose from "mongoose";
import Follow from "../models/Follow.js";
import User from "../models/User.js";

function isDuplicateKeyError(error: unknown): boolean {
    return typeof error === "object" && error !== null &&
        (error as { code?: unknown }).code === 11000;
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
            runValidators: true
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

