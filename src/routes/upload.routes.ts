import { Router } from "express";
import { getUploadSignature } from "../controllers/upload.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.post("/signature", requireAuth, getUploadSignature);

export default router;
