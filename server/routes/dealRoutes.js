import express from "express";
import { addCollaborator, bulkAdvanceDeals, bulkReassignDeals, createDeal, deleteDeal, exportDealsCsv, getCollaborators, getDealHistory, getDeals, reassignDeal, removeCollaborator, reopenDeal, updateDeal, updateDealStage } from "../controllers/dealController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createDeal);
router.get("/export/csv", authMiddleware, exportDealsCsv);
router.get("/", authMiddleware, getDeals);
router.put("/:id", authMiddleware, updateDeal);
router.patch("/bulk/reassign", authMiddleware, bulkReassignDeals);
router.patch("/bulk/advance", authMiddleware, bulkAdvanceDeals);
router.patch("/:id/stage", authMiddleware, updateDealStage);
router.patch("/:id/reopen", authMiddleware, reopenDeal);
router.patch("/:id/reassign", authMiddleware, reassignDeal);
router.delete("/:id", authMiddleware, deleteDeal);
router.get("/:id/history", authMiddleware, getDealHistory);
router.post("/:id/collaborators", authMiddleware, addCollaborator);
router.delete("/:id/collaborators/:userId", authMiddleware, removeCollaborator);
router.get("/:id/collaborators", authMiddleware, getCollaborators);

export default router;