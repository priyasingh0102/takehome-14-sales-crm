import express from "express";
import { archiveCompany, createCompany, getCompanies, restoreCompany, updateCompany } from "../controllers/companyController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createCompany);
router.get("/", authMiddleware, getCompanies);
router.put("/:id", authMiddleware, updateCompany);
router.patch("/:id/archive", authMiddleware, archiveCompany);
router.patch("/:id/restore", authMiddleware, restoreCompany);

export default router;
