import { Router } from "express";
import { ReservationController } from "./reservation.controller";

const router = Router();

router.get("/active", ReservationController.getActive);
router.post("/", ReservationController.create);
router.post("/:id/cancel", ReservationController.cancel);

export default router;
