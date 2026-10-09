import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

export async function register(req: Request, res: Response): Promise<void> {
    const { username, email, password } = req.body ?? {};

    if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
        res.status(400).json({ error: "username, email and password are required" });
        return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        res.status(400).json({
            error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        });
        return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, email, passwordHash });
    const token = signToken(user._id.toString());

    res.status(201).json({ token, user });
}

export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
        res.status(400).json({ error: "email and password are required" });
        return;
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
    }

    const token = signToken(user._id.toString());

    res.json({ token, user });
}

export async function me(req: Request, res: Response): Promise<void> {
    const user = await User.findById(req.userId);

    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    res.json(user);
}
