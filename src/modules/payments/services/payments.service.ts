import { stripe } from '../../../core/stripe/stripe-client';
import { usersRepo } from '../repositories/users.repo';
import { paymentsRepo } from '../repositories/payments.repo';

async function ensureStripeCustomer(userId: number): Promise<string> {
  const existing = await usersRepo.getStripeCustomerId(userId);
  if (existing) return existing;

  // Crear customer en Stripe
  const customer = await stripe.customers.create({ metadata: { userId: String(userId) } });
  console.debug('Stripe customer created', { userId, customerId: customer.id });

  await usersRepo.setStripeCustomerId(userId, customer.id);
  return customer.id;
}

export const paymentsService = {
  async initSetupIntent(userId: number): Promise<{ clientSecret: string }> {
    const customerId = await ensureStripeCustomer(userId);

    const si = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
      payment_method_types: ['card'],
      metadata: { userId: String(userId) },
    });
    console.debug('Stripe setup intent created', { userId, customerId, setupIntentId: si.id });

    // Aseguramos que Stripe haya devuelto client_secret
    if (!si.client_secret) {
      // Incluir algo de contexto en el error para facilitar el debug
      throw new Error('Stripe setup intent did not return a client_secret');
    }

    return { clientSecret: si.client_secret };
  },

  async handleSetupIntentSucceeded(userId: number, paymentMethodId: string) {
    const customerId = await usersRepo.getStripeCustomerId(userId);
    if (!customerId) {
      throw new Error('Customer not found for user');
    }
    await paymentsRepo.saveValidPaymentMethod(userId, customerId, paymentMethodId);
  },

  async handleSetupIntentFailed(userId: number, reason: string) {
    await paymentsRepo.markPaymentMethodRejected(userId, reason);
  },
};
