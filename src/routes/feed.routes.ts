import { Router } from "express";
import { getFeed } from "../controllers/feed.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth, getFeed);

export default router;
