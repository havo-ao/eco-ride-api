import { Router } from "express";
import { StationController } from "./station.controller";

const router = Router();

router.get("/nearest", StationController.getNearest);

export default router;
