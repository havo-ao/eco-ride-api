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

    // Validación y lógica con Stripe
    let isValid = true;

    if (dto.type === "CARD") {
      try {
        const pm = await stripe.paymentMethods.retrieve(dto.stripePaymentMethodId as string);
        if (!pm || (pm as any).card == null) {
          isValid = false;
        }

        if (isValid) {
          const user = await getUserById(userId);
          let stripeCustomerId = user?.stripe_customer_id ?? null;

          if (!stripeCustomerId) {
            const customer = await stripe.customers.create({ metadata: { userId: String(userId) } });
            stripeCustomerId = customer.id;
            await setStripeCustomerId(userId, stripeCustomerId);
          }

          try {
            await stripe.paymentMethods.attach(dto.stripePaymentMethodId as string, { customer: stripeCustomerId });
          } catch (attachErr) {
            console.error('Failed to attach PaymentMethod to customer', (attachErr as Error).message);
            return { success: false, message: 'ERROR_INTERNAL' };
          }
        }
      } catch (err) {
        isValid = false;
        console.error('Error retrieving Stripe paymentMethod:', dto.stripePaymentMethodId, (err as Error).message);
      }
    }

    try {
      // Business logic now lives in service: check duplicates, manage default flag, persist via repository
      if (dto.type === 'CARD' && dto.stripePaymentMethodId) {
        const existing = await PaymentMethodRepository.findByStripePaymentMethodId(userId, dto.stripePaymentMethodId);
        if (existing) {
          return { success: false, message: 'ALREADY_EXISTS' };
        }
      }

      const status = isValid ? 'VALID' : 'REJECTED';
      const isDefault = !!dto.setAsDefault && isValid;

      if (isDefault) {
        await PaymentMethodRepository.clearDefaultForUser(userId);
      }

      await PaymentMethodRepository.createPaymentMethod({
        userId,
        type: dto.type,
        stripePaymentMethodId: dto.stripePaymentMethodId ?? null,
        brand: dto.brand ?? null,
        last4: dto.last4 ?? null,
        expMonth: dto.expMonth ?? null,
        expYear: dto.expYear ?? null,
        status: status as 'PENDING' | 'VALID' | 'REJECTED',
        isDefault,
      });

      return { success: true, message: 'OK' };
    } catch (error) {
      console.error('createPaymentMethod error:', (error as Error).message);
      return { success: false, message: 'ERROR_INTERNAL' };
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
        // Retrieve the payment method to check if it's attached to a customer
        const pm = await stripe.paymentMethods.retrieve(row.stripePaymentMethodId as string);

        // pm.customer can be null/undefined if not attached
        const attachedToCustomer = (pm as any).customer ? true : false;

        if (attachedToCustomer) {
          try {
            await stripe.paymentMethods.detach(row.stripePaymentMethodId as string);
          } catch (detachErr) {
            // Log but don't fail the overall revocation flow
            console.error('Error detaching payment method from Stripe', (detachErr as Error).message);
          }
        } else {
          // Not attached — nothing to detach (avoid Stripe error)
          console.info('PaymentMethod not attached to any customer in Stripe; skipping detach', row.stripePaymentMethodId);
        }
      } catch (err) {
        // If retrieval fails, log and continue with DB revoke. We don't want this to block the revocation.
        console.warn('Failed to retrieve PaymentMethod from Stripe; skipping detach. ID:', row.stripePaymentMethodId, 'error:', (err as Error).message);
      }
    }

    const repoRes = await PaymentMethodRepository.revokeById(userId, paymentMethodId);
    if (repoRes.resultCode === 0) return { success: true, message: repoRes.resultMessage };
    if (repoRes.resultCode === 2) return { success: false, message: 'NOT_OWNED' };
    return { success: false, message: repoRes.resultMessage };
  }
}
