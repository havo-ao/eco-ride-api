import express from "express";
import cors from "cors";

import { registerUserController } from "./modules/users/controllers/register.controller";
import reservationRoutes from "./modules/reservations/reservation.routes";
import stationRoutes from "./modules/stations/station.routes";
import authRoutes from "./modules/auth/auth.routes";

import { authMiddleware } from "./core/middleware/authMiddleware";

const app = express();
app.use(cors());
app.use(express.json());

// Routes for all
app.use("/api/auth", authRoutes);
app.post("/api/users/register", registerUserController);

// Only Routes for Public
app.use("/api/stations", stationRoutes);

// Private Routes
app.use("/api/reservations", authMiddleware, reservationRoutes);

app.get("/health", (_, res) =>
  res.json({ status: "OK", message: "EcoRide backend running" })
);

export default app;
