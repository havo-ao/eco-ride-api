import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from './stripe-client';
import { paymentsService } from '../../modules/payments/services/payments.service';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'setup_intent.succeeded': {
        const si = event.data.object as Stripe.SetupIntent;
        const userId = Number(si.metadata?.userId);
        const pmId = si.payment_method as string;
        await paymentsService.handleSetupIntentSucceeded(userId, pmId);
        break;
      }
      case 'setup_intent.setup_failed': {
        const si = event.data.object as Stripe.SetupIntent;
        const userId = Number(si.metadata?.userId);
        const reason = si.last_setup_error?.message || 'setup_failed';
        await paymentsService.handleSetupIntentFailed(userId, reason);
        break;
      }
      default:
        // ignoramos otros eventos por ahora
        break;
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(500).json({ message: 'Webhook handler failed', error: err?.message });
  }
}
