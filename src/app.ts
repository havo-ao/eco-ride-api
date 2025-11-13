import express from "express";
import cors from "cors";
import { swaggerDocs } from "./swagger/swagger";

import { registerUserController } from "./modules/users/controllers/register.controller";
import reservationRoutes from "./modules/reservations/reservation.routes";
import stationRoutes from "./modules/stations/station.routes";
import authRoutes from "./modules/auth/auth.routes";
import rideRoutes from "./modules/rides/ride.routes";

import { authMiddleware } from "./core/middleware/authMiddleware";
import { createCommentController,getAllCommentsController } from './modules/comments/controllers/comments.controller';
import { activateUserController } from "./modules/users/controllers/activate.user.controller";

const app = express();
app.use(cors());
app.use(express.json());
// Inicializa Swagger
swaggerDocs(app);

app.use("/api/auth", authRoutes);
app.post("/api/users/register", registerUserController);
app.get("/api/users/activate/:token", activateUserController);



app.use("/api/stations", stationRoutes);

app.use("/api/reservations", authMiddleware, reservationRoutes);
app.use("/api/rides", authMiddleware, rideRoutes);

app.post('/api/comments/postComment', createCommentController);
app.get('/api/comments/userComments', getAllCommentsController);

app.get("/health", (_, res) =>
  res.json({ status: "OK", message: "EcoRide backend running" })
);

export default app;
