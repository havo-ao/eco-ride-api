import { z } from 'zod';

export const InitPaymentMethodSchema = z.object({
  mode: z.literal('init').optional().default('init'),
});

export type InitPaymentMethodDTO = z.infer<typeof InitPaymentMethodSchema>;
