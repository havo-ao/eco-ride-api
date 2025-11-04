import { Router } from "express";
import { StationController } from "./station.controller";

const router = Router();

router.get("/nearest", StationController.getNearest);
router.get("/with-availability", StationController.getWithAvailability);

export default router;
