import express from "express";
import cors from "cors";

import { registerUserController } from './modules/users/controllers/register.controller';
import { startRideController } from './modules/rides/controllers/startRide.controller';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/users/register', registerUserController);

app.post('/api/rides/start', startRideController);

app.get("/health", (_, res) =>
  res.json({ status: "OK", message: "EcoRide backend running" })
);

export default app;
