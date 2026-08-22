import { Router } from "express";
import { followUser, unfollowUser, updateMe } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.post("/:id/follow", requireAuth, followUser);
router.delete("/:id/follow", requireAuth, unfollowUser);
router.patch("/me", requireAuth, updateMe);


export default router;
