import express from "express";
import {
  getDealAlerts,
  dismissDealAlert,
  generateDealAlerts,
} from "../controllers/dealAlertController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getDealAlerts);
router.patch("/:id/dismiss", authMiddleware, dismissDealAlert);
router.post("/generate", authMiddleware, generateDealAlerts);

export default router;