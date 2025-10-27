import { Router } from 'express';
import bodyParser from 'body-parser';
import { handleStripeWebhook } from './stripe-webhook.controller';

export const stripeWebhookRouter = Router();
stripeWebhookRouter.post('/', bodyParser.raw({ type: 'application/json' }), handleStripeWebhook);
