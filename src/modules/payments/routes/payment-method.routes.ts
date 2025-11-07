import { Router } from "express";
import { createPaymentMethodController, listPaymentMethodsController, getPaymentMethodController, setDefaultPaymentMethodController, deletePaymentMethodController } from "../controllers/payment-method.controller";

const router = Router();

// GET /api/pagos/metodo
router.get("/metodo", listPaymentMethodsController);

// GET /api/pagos/metodo/:id
router.get('/metodo/:id', getPaymentMethodController);

// POST /api/pagos/metodo
router.post("/metodo", createPaymentMethodController);

// PATCH set as default
router.patch('/metodo/:id', setDefaultPaymentMethodController);

// DELETE /api/pagos/metodo/:id
router.delete('/metodo/:id', deletePaymentMethodController);

export default router;
