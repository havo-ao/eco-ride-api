import { Router } from 'express';
import { initPaymentMethodController } from '../controllers/method.controller';
import { getPaymentStatusController } from '../controllers/status.controller';

export const paymentsRouter = Router();

// Inicia SetupIntent y devuelve client_secret
paymentsRouter.post('/metodo', initPaymentMethodController);

// Estado simple para la UI (valid/none)
paymentsRouter.get('/metodo/status', getPaymentStatusController);