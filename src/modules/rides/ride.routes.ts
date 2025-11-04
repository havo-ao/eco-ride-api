import { Router } from "express";
import { RideController } from "./ride.controller";

const router = Router();

router.get("/active", RideController.getActive);
router.post("/start", RideController.start);
router.post("/:id/end", RideController.end);

export default router;
