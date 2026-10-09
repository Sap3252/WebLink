import { Router } from "express";
import { deleteComment } from "../controllers/comment.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.delete("/:id", requireAuth, deleteComment);

export default router;
