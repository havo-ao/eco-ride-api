import { Request, Response } from 'express';
import { InitPaymentMethodSchema } from '../dtos/payments.dtos';
import { paymentsService } from '../services/payments.service';

// TODO: reemplazar por tu middleware de auth
function getUserIdFromReq(req: Request): number {
  const xUserId = req.header('x-user-id');
  return Number(xUserId || 1);
}

export async function initPaymentMethodController(req: Request, res: Response) {
  const userId = getUserIdFromReq(req);

  const parsed = InitPaymentMethodSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid body', issues: parsed.error.issues });
  }

  try {
    const result = await paymentsService.initSetupIntent(userId);
    res.json(result); // { clientSecret }
  } catch (err: any) {
    // Log full error for debugging
    console.error('initPaymentMethodController error:', err);
    const safeMessage = err?.message || 'Failed to init payment method';
    // In non-production include a bit more detail to help debugging
    const payload: any = { message: safeMessage };
    if (process.env.NODE_ENV !== 'production') payload.details = err?.stack || null;
    res.status(500).json(payload);
  }
}
