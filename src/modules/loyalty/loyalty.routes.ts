import { Router } from "express";
import { LoyaltyController } from "./loyalty.controller";
import { authMiddleware } from "@/core/middleware/authMiddleware";

const router = Router();

router.get("/balance", authMiddleware, LoyaltyController.getBalance);
router.get("/history", authMiddleware, LoyaltyController.getHistory);
router.post("/redeem", authMiddleware, LoyaltyController.redeem);

export default router;
