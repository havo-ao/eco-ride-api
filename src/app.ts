import express from "express";
import cors from "cors";
import { swaggerDocs } from "./swagger/swagger";

import { registerUserController } from "./modules/users/controllers/register.controller";
import { userProfileController } from "./modules/users/controllers/user-profile.controller";
import { debugUserRidesController } from "./modules/users/controllers/user-debug.controller";
import reservationRoutes from "./modules/reservations/reservation.routes";
import stationRoutes from "./modules/stations/station.routes";
import authRoutes from "./modules/auth/auth.routes";
import rideRoutes from "./modules/rides/ride.routes";

import { authMiddleware } from "./core/middleware/authMiddleware";
import { createCommentController,getAllCommentsController } from './modules/comments/controllers/comments.controller';
import paymentRoutes from "./modules/payments/routes/payment-method.routes";
import { paymentWebhookController } from './modules/payments/controllers/payment-webhook.controller';
import { activateUserController } from "./modules/users/controllers/activate.user.controller";

const app = express();
app.use(cors());
app.use(express.json());
// Inicializa Swagger
swaggerDocs(app);

app.use("/api/auth", authRoutes);
app.post("/api/users/register", registerUserController);
app.get("/api/users/activate/:token", activateUserController);
app.get("/api/users/profile", authMiddleware, userProfileController);

// Development-only debug route to inspect raw rides for a user
if (process.env.NODE_ENV === 'development') {
  app.get('/internal/debug/user/:id/rides', debugUserRidesController);
}



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

export default app;
