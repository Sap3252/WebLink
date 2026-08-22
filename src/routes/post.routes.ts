import { Router } from "express";
import { createPost, getPost, deletePost } from "../controllers/post.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.post("/", requireAuth, createPost);
router.get("/:id", getPost);
router.delete("/:id",requireAuth, deletePost);

export default router;
