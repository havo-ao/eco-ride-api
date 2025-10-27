import express from "express";
import cors from "cors";
import { paymentsRouter } from "./modules/payments/routes/payments.routes";
import { stripeWebhookRouter } from './core/stripe/stripe-webhook.routes';

const app = express();
app.use(cors());


app.use('/api/stripe/webhooks', stripeWebhookRouter);


app.use(express.json());

app.use('/api/pagos', paymentsRouter);

app.get("/health", (_, res) =>
  res.json({ status: "OK", message: "EcoRide backend running" })
);

export default app;
