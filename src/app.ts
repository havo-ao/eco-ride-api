import express from "express";
import cors from "cors";

import { registerUserController } from "./modules/users/controllers/register.controller";
import reservationRoutes from "./modules/reservations/reservation.routes";
import stationRoutes from "./modules/stations/station.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/users/register", registerUserController);
app.use("/api/reservations", reservationRoutes);
app.use("/api/stations", stationRoutes);

app.get("/health", (_, res) =>
  res.json({ status: "OK", message: "EcoRide backend running" })
);

export default app;
