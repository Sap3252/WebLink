import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";


const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

function isDuplicateKeyError(error: unknown): boolean {
    return typeof error === "object" && error !== null &&
        (error as { code?: unknown }).code === 11000;
}

export async function register(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body ?? {};

    if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
        res.status(400).json({ error: "username, email and password are required" });
        return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` });
        return;
    }

    try {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({ username, email, passwordHash });

        res.status(201).json(user);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json({ error: error.message });
            return;
        }

        if (isDuplicateKeyError(error)) {
            res.status(409).json({ error: "Username or email already in use" });
            return;
        }

        console.error("register failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
        res.status(400).json({ error: "email and password are required" });
        return;
    }

    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }

        const token = jwt.sign(
            { sub: user._id.toString() },
            env.jwtSecret,
            { expiresIn: env.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]> }
        );

        res.json({ token, user });
    } catch (error) {
        console.error("login failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function me(req: Request, res: Response): Promise<void> {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error("me failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

