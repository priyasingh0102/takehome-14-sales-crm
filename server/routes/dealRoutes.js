import express from "express";
import { addCollaborator, createDeal, getCollaborators, getDealHistory, getDeals, removeCollaborator, updateDeal, updateDealStage } from "../controllers/dealController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createDeal);
router.get("/", authMiddleware, getDeals);
router.put("/:id", authMiddleware, updateDeal);
router.patch("/:id/stage", authMiddleware, updateDealStage);
router.get("/:id/history", authMiddleware, getDealHistory);
router.post("/:id/collaborators", authMiddleware, addCollaborator);
router.delete("/:id/collaborators/:userId", authMiddleware, removeCollaborator);
router.get("/:id/collaborators", authMiddleware, getCollaborators);


export default router;