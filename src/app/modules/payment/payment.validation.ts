import z from 'zod';

const createPaymentValidationSchema = z.object({
  body: z.object({
    fee: z.string().trim().min(1, 'Fee is required'),
    amount: z.number().positive('Payment amount must be greater than zero'),
    method: z.enum(['online', 'offline', 'bank-transfer', 'cash']),
    transactionId: z.string().trim().min(1).optional(),
    paymentDate: z.string().trim().min(1).optional(),
    remarks: z.string().trim().optional(),
    gatewayResponse: z.record(z.string(), z.unknown()).optional(),
  }),
});

const refundPaymentValidationSchema = z.object({
  body: z.object({
    refundReason: z.string().trim().min(1).optional(),
    refundedAt: z.string().trim().min(1).optional(),
  }),
});

// signature verification for the razorpay webhook payload
const razorpayWebhookValidationSchema = z.object({
  body: z.object({
    event: z.string().trim().min(1).optional(),
    payload: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const PaymentValidations = {
  createPaymentValidationSchema,
  refundPaymentValidationSchema,
  razorpayWebhookValidationSchema,
};
