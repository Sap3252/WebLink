import type { Request, Response } from "express";
import { createUploadSignature, imagesEnabled } from "../services/image.service.js";

// POST /uploads/signature: lets the logged-in user upload one photo to Cloudinary.
export function getUploadSignature(req: Request, res: Response): void {
    const userId = req.userId;

    if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }

    if (!imagesEnabled()) {
        res.status(503).json({ error: "Image uploads are not configured" });
        return;
    }

    res.json(createUploadSignature(userId));
}
