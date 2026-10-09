import { Router } from "express";
import {
    followUser,
    getFollowing,
    getUserPosts,
    getUserProfile,
    getFollowers,
    unfollowUser,
    updateMe,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";

const router = Router();

router.patch("/me", requireAuth, updateMe);
router.get("/:username", optionalAuth, getUserProfile);
router.get("/:username/posts", optionalAuth, getUserPosts);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);
router.post("/:id/follow", requireAuth, followUser);
router.delete("/:id/follow", requireAuth, unfollowUser);

export default router;
