import { Request, Response } from "express";
import Stripe from "stripe";
import { PaymentMethodRepository } from "../repositories/payment-method.repository";
import { childLogger } from '@/core/logger/logger';

const logger = childLogger('payments-webhook-controller');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {} as Stripe.StripeConfig);

export async function paymentWebhookController(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const rawBody = req.body; // express.raw will provide Buffer here when route is configured

  let event: Stripe.Event;

  const bypassHeader = (req.headers['x-bypass-stripe-signature'] || req.headers['x-ignore-stripe-signature']) as string | undefined;
  const allowBypass = process.env.ALLOW_INSECURE_WEBHOOK_TESTS === 'true';

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    // If bypass requested and allowed via env, parse raw body without verification (useful for Postman tests)
    if (bypassHeader && allowBypass) {
      try {
        const body = rawBody as Buffer | string | object;
        let parsed: any;
        if (Buffer.isBuffer(body)) {
          parsed = JSON.parse(body.toString('utf8'));
        } else if (typeof body === 'string') {
          parsed = JSON.parse(body);
        } else if (typeof body === 'object') {
          parsed = body;
        } else {
          throw new Error('Unsupported payload type');
        }
  event = parsed as Stripe.Event;
  logger.warn({ message: 'Webhook verification bypassed via header (tests only).' });
      } catch (err) {
  logger.error({ message: 'Invalid webhook payload (bypass)', error: (err as Error).message, stack: (err as Error).stack });
        return res.status(400).send('Invalid payload');
      }
    } else {
      if (!sig) {
        return res.status(400).send('Missing stripe-signature header');
      }
      try {
        event = stripe.webhooks.constructEvent(rawBody as Buffer, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
  logger.error({ message: 'Webhook signature verification failed', error: (err as Error).message, stack: (err as Error).stack });
        return res.status(400).send('Webhook signature verification failed');
      }
    }
  } else {
    // If no webhook secret provided, accept the event body as-is (not recommended for production)
    try {
      const body = rawBody as Buffer | string | object;
      let parsed: any;
      if (Buffer.isBuffer(body)) {
        parsed = JSON.parse(body.toString('utf8'));
      } else if (typeof body === 'string') {
        parsed = JSON.parse(body);
      } else if (typeof body === 'object') {
        parsed = body;
      } else {
        throw new Error('Unsupported payload type');
      }
      event = parsed as Stripe.Event;
    } catch (err) {
  logger.error({ message: 'Invalid webhook payload', error: (err as Error).message, stack: (err as Error).stack });
      return res.status(400).send('Invalid payload');
    }
  }

  try {
    switch (event.type) {
      case 'payment_method.detached': {
        const pm = event.data.object as Stripe.PaymentMethod;
        if (pm && pm.id) {
          await PaymentMethodRepository.revokeByStripeId(pm.id);
        }
        break;
      }
      case 'payment_method.attached':
      case 'payment_method.updated': {
        const pm = event.data.object as Stripe.PaymentMethod;
        if (pm && pm.id) {
          try {
            await PaymentMethodRepository.updateFromStripe(pm as any);
          } catch (err) {
            logger.error({ message: 'Failed updating payment_method from Stripe', error: (err as Error).message, stack: (err as Error).stack });
          }
        }
        break;
      }
      default:
        // ignore other events
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    logger.error({ message: 'Webhook handling error', error: (err as Error).message, stack: (err as Error).stack });
    return res.status(500).send('Webhook handling error');
  }
}
