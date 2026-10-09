import { Router } from "express";
import { createPost, getPost, deletePost, listPosts } from "../controllers/post.controller.js";
import { linkPost, unlinkPost } from "../controllers/link.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";

const router = Router();

router.post("/", requireAuth, createPost);
router.get("/", optionalAuth, listPosts);
router.get("/:id", optionalAuth, getPost);
router.delete("/:id", requireAuth, deletePost);
router.post("/:id/link", requireAuth, linkPost);
router.delete("/:id/link", requireAuth, unlinkPost);

export default router;
