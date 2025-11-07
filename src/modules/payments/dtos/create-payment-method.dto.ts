export type PaymentMethodType = 'CARD' | 'WALLET';

export interface CreatePaymentMethodDto {
  type: PaymentMethodType;
  stripePaymentMethodId?: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  setAsDefault?: boolean;
}
