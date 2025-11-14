import { Router } from "express";
import { createPaymentMethodController, listPaymentMethodsController, getPaymentMethodController, setDefaultPaymentMethodController, deletePaymentMethodController } from "../controllers/payment-method.controller";

const router = Router();

// English endpoints (preferred)
router.get('/method', listPaymentMethodsController); // GET /api/payments/method
router.get('/method/:id', getPaymentMethodController); // GET /api/payments/method/:id
router.post('/method', createPaymentMethodController); // POST /api/payments/method
router.put('/method/:id/default', setDefaultPaymentMethodController); // PUT /api/payments/method/:id/default
router.delete('/method/:id', deletePaymentMethodController); // DELETE /api/payments/method/:id

// Spanish aliases (deprecated) kept for backward compatibility
router.get('/metodo', listPaymentMethodsController);
router.get('/metodo/:id', getPaymentMethodController);
router.post('/metodo', createPaymentMethodController);
router.patch('/metodo/:id', setDefaultPaymentMethodController);
router.delete('/metodo/:id', deletePaymentMethodController);

export default router;
