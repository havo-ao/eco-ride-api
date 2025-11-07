import Stripe from "stripe";
import { CreatePaymentMethodDto } from "../dtos/create-payment-method.dto";
import { PaymentMethodRepository } from "../repositories/payment-method.repository";
import { getUserById, setStripeCustomerId } from "../../users/repositories/users.repo";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {} as Stripe.StripeConfig);

export class PaymentMethodService {
  public static async createPaymentMethod(
    userId: number,
    dto: CreatePaymentMethodDto
  ): Promise<{ success: boolean; message: string }> {
    // Validaciones básicas
    if (dto.type === "CARD") {
      if (!dto.stripePaymentMethodId || !dto.last4 || !dto.expMonth || !dto.expYear) {
        return { success: false, message: "MISSING_CARD_FIELDS" };
      }
    }

    // Validación con Stripe: para tarjetas intentamos recuperar el PaymentMethod
    let isValid = true;

    if (dto.type === "CARD") {
      try {
        const pm = await stripe.paymentMethods.retrieve(dto.stripePaymentMethodId as string);
        // Si no tiene datos de tarjeta, marcar como inválido
        if (!pm || (pm as any).card == null) {
          isValid = false;
        }
        // If payment method is valid, ensure it's attached to a Stripe Customer for this user
        if (isValid) {
          // fetch user to check stripe_customer_id
          const user = await getUserById(userId);
          let stripeCustomerId = user?.stripe_customer_id ?? null;

          if (!stripeCustomerId) {
            // create customer in Stripe and save to DB
            const customer = await stripe.customers.create({ metadata: { userId: String(userId) } });
            stripeCustomerId = customer.id;
            await setStripeCustomerId(userId, stripeCustomerId);
          }

          // attach payment method to customer (idempotent if already attached)
          try {
            await stripe.paymentMethods.attach(dto.stripePaymentMethodId as string, { customer: stripeCustomerId });
          } catch (attachErr) {
            // If attach fails, consider this an internal error (do not register the PM)
            console.error('Failed to attach PaymentMethod to customer', (attachErr as Error).message);
            return { success: false, message: 'ERROR_INTERNAL' };
          }
        }
      } catch (err) {
        // Si Stripe lanza error, consideramos la tarjeta inválida
        isValid = false;
        console.error('Error retrieving Stripe paymentMethod:', dto.stripePaymentMethodId, (err as Error).message);
      }
    }

    try {
      const repoRes = await PaymentMethodRepository.registerPaymentMethod(userId, dto, isValid, !!dto.setAsDefault);

      if (repoRes.resultCode === 0) {
        return { success: true, message: repoRes.resultMessage };
      }

      // Mapeo simple de códigos conocidos
      if (repoRes.resultCode === 2) {
        return { success: false, message: repoRes.resultMessage };
      }

      return { success: false, message: repoRes.resultMessage };
    } catch (error) {
      return { success: false, message: "ERROR_INTERNAL" };
    }
  }

  public static async listPaymentMethods(userId: number) {
    // Delegate to repository — business rules for listing are in DB/SP when required
    const rows = await PaymentMethodRepository['listByUser'](userId);
    return (rows as any[]).map(r => ({
      id: r.id,
      stripePaymentMethodId: r.stripePaymentMethodId,
      type: r.type,
      brand: r.brand,
      last4: r.last4,
      expMonth: r.expMonth,
      expYear: r.expYear,
      status: r.status,
      isDefault: !!r.isDefault,
      createdAt: r.createdAt,
    }));
  }

  public static async getPaymentMethod(userId: number, id: number, live = false) {
    const row = await PaymentMethodRepository['findById'](id, userId);
    if (!row) return null;

    const base = {
      id: row.id,
      stripePaymentMethodId: row.stripePaymentMethodId,
      type: row.type,
      brand: row.brand,
      last4: row.last4,
      expMonth: row.expMonth,
      expYear: row.expYear,
      status: row.status,
      isDefault: !!row.isDefault,
      createdAt: row.createdAt,
    } as any;

    if (live && row.stripePaymentMethodId) {
      try {
        const pm = await stripe.paymentMethods.retrieve(row.stripePaymentMethodId as string);
        base.live = pm;
      } catch (err) {
        // If Stripe retrieval fails, return base info and a liveError flag
        base.liveError = (err as Error).message;
      }
    }

    return base;
  }

  public static async setDefaultPaymentMethod(userId: number, paymentMethodId: number) {
    const res = await PaymentMethodRepository['setAsDefault'](userId, paymentMethodId);
    if (res.resultCode === 0) return { success: true, message: res.resultMessage };
    return { success: false, message: res.resultMessage };
  }

  public static async revokePaymentMethod(userId: number, paymentMethodId: number) {
    // Find the payment method
    const row: any = await PaymentMethodRepository.findById(paymentMethodId, userId);
    if (!row) return { success: false, message: 'NOT_FOUND' };

    // If attached to Stripe, attempt to detach first
    if (row.stripePaymentMethodId) {
      try {
        await stripe.paymentMethods.detach(row.stripePaymentMethodId as string);
      } catch (err) {
        // Log the error but still attempt to revoke in DB
        console.error('Error detaching payment method from Stripe', (err as Error).message);
      }
    }

    const repoRes = await PaymentMethodRepository.revokeById(userId, paymentMethodId);
    if (repoRes.resultCode === 0) return { success: true, message: repoRes.resultMessage };
    if (repoRes.resultCode === 2) return { success: false, message: 'NOT_OWNED' };
    return { success: false, message: repoRes.resultMessage };
  }
}
