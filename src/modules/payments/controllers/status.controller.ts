import { Request, Response } from 'express';
import { paymentsRepo } from '../repositories/payments.repo';

// TODO: reemplazar por tu middleware de auth
function getUserIdFromReq(req: Request): number {
  const xUserId = req.header('x-user-id');
  return Number(xUserId || 1);
}

export async function getPaymentStatusController(req: Request, res: Response) {
  const userId = getUserIdFromReq(req);
  const hasValid = await paymentsRepo.hasValidPaymentMethod(userId);
  res.json({ status: hasValid ? 'valid' : 'none' });
}
