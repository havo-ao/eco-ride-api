import express from "express";
import cors from "cors";
import httpLogger from '@/core/logger/http-logger.middleware';
import errorLogger from '@/core/logger/error-logger.middleware';

import { registerUserController } from "./modules/users/controllers/register.controller";
import reservationRoutes from "./modules/reservations/reservation.routes";
import stationRoutes from "./modules/stations/station.routes";
import authRoutes from "./modules/auth/auth.routes";
import rideRoutes from "./modules/rides/ride.routes";

import { authMiddleware } from "./core/middleware/authMiddleware";
import { createCommentController,getAllCommentsController } from './modules/comments/controllers/comments.controller';
import paymentRoutes from "./modules/payments/routes/payment-method.routes";
import { paymentWebhookController } from './modules/payments/controllers/payment-webhook.controller';

const app = express();
app.use(cors());
app.use(express.json());

// HTTP logging middleware (assigns requestId, logs incoming requests)
app.use(httpLogger);

app.use("/api/auth", authRoutes);
app.post("/api/users/register", registerUserController);

app.use("/api/stations", stationRoutes);


// Public webhook endpoint must receive raw body (stripe signatures). Mount before json middleware would parse it,
// but we have express.json globally — we use express.raw on the route itself.
app.post('/api/pagos/webhook', express.raw({ type: 'application/json' }), paymentWebhookController);

app.use("/api/reservations", authMiddleware, reservationRoutes);
app.use("/api/rides", authMiddleware, rideRoutes);
app.use("/api/pagos", authMiddleware, paymentRoutes);

app.post('/api/comments/postComment', createCommentController);
app.get('/api/comments/userComments', getAllCommentsController);

app.get("/health", (_, res) =>
  res.json({ status: "OK", message: "EcoRide backend running" })
);

// Error logger should be the last middleware
app.use(errorLogger);

export default app;
