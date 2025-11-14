import { Request, Response } from "express";
import { CreatePaymentMethodDto } from "../dtos/create-payment-method.dto";
import { PaymentMethodService } from "../services/payment-method.service";
import { childLogger } from '@/core/logger/logger';

const logger = childLogger('payments-method-controller');

export async function createPaymentMethodController(req: Request, res: Response) {
  const user = (req as unknown as { user?: { id: number; email?: string } }).user;
  if (!user || !user.id) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const body = req.body as CreatePaymentMethodDto;

  const result = await PaymentMethodService.createPaymentMethod(user.id, body);

  if (result.success) {
    return res.status(200).json({ message: result.message });
  }

  // Si la tarjeta fue rechazada por Stripe o SP devolvió PAYEMENT_METHOD_REJECTED
  if (result.message === "PAYMENT_METHOD_REJECTED") {
    return res.status(400).json({ message: "PAYMENT_METHOD_REJECTED" });
  }

  if (result.message === 'ALREADY_EXISTS') {
    return res.status(400).json({ message: 'ALREADY_EXISTS' });
  }

  return res.status(500).json({ message: result.message });
}

export async function listPaymentMethodsController(req: Request, res: Response) {
  const user = (req as unknown as { user?: { id: number; email?: string } }).user;
  if (!user || !user.id) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const list = await PaymentMethodService.listPaymentMethods(user.id);
    return res.status(200).json({ data: list });
  } catch (err) {
    logger.error({ message: 'listPaymentMethodsController error', error: (err as Error).message, stack: (err as Error).stack });
    return res.status(500).json({ message: "ERROR_INTERNAL" });
  }
}

export async function getPaymentMethodController(req: Request, res: Response) {
  const user = (req as unknown as { user?: { id: number; email?: string } }).user;
  if (!user || !user.id) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const id = Number(req.params.id);
  const live = req.query.live === 'true' || req.query.live === '1';

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'INVALID_ID' });
  }

  try {
    const pm = await PaymentMethodService.getPaymentMethod(user.id, id, live as boolean);
    if (!pm) return res.status(404).json({ message: 'NOT_FOUND' });
    return res.status(200).json({ data: pm });
  } catch (err) {
    logger.error({ message: 'getPaymentMethodController error', error: (err as Error).message, stack: (err as Error).stack });
    return res.status(500).json({ message: 'ERROR_INTERNAL' });
  }
}

export async function setDefaultPaymentMethodController(req: Request, res: Response) {
  const user = (req as unknown as { user?: { id: number; email?: string } }).user;
  if (!user || !user.id) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const id = Number(req.params.id);
  if (!id || isNaN(id)) return res.status(400).json({ message: 'INVALID_ID' });

  try {
    const result = await PaymentMethodService.setDefaultPaymentMethod(user.id, id);
    if (result.success) return res.status(200).json({ message: result.message });
    if (result.message === 'NOT_OWNED') return res.status(403).json({ message: 'NOT_OWNED' });
    return res.status(400).json({ message: result.message });
  } catch (err) {
    logger.error({ message: 'setDefaultPaymentMethodController error', error: (err as Error).message, stack: (err as Error).stack });
    return res.status(500).json({ message: 'ERROR_INTERNAL' });
  }
}

export async function deletePaymentMethodController(req: Request, res: Response) {
  const user = (req as unknown as { user?: { id: number; email?: string } }).user;
  if (!user || !user.id) return res.status(401).json({ message: 'No autenticado' });

  const id = Number(req.params.id);
  if (!id || isNaN(id)) return res.status(400).json({ message: 'INVALID_ID' });

  try {
    const result = await PaymentMethodService.revokePaymentMethod(user.id, id);
    if (result.success) return res.status(200).json({ message: result.message });
    if (result.message === 'NOT_OWNED') return res.status(403).json({ message: 'NOT_OWNED' });
    if (result.message === 'NOT_FOUND') return res.status(404).json({ message: 'NOT_FOUND' });
    return res.status(400).json({ message: result.message });
  } catch (err) {
    logger.error({ message: 'deletePaymentMethodController error', error: (err as Error).message, stack: (err as Error).stack });
    return res.status(500).json({ message: 'ERROR_INTERNAL' });
  }
}
