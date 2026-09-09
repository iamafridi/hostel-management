import { TPaymentMethod, TPaymentStatus } from './payment.interface';

export const PaymentSearchableFields = [
  'id',
  'receiptNumber',
  'transactionId',
  'status',
];

export const PaymentMethods: TPaymentMethod[] = [
  'online',
  'offline',
  'bank-transfer',
  'cash',
];

export const PaymentStatuses: TPaymentStatus[] = [
  'success',
  'failed',
  'refunded',
];

export const PaymentIdPrefix = 'PAY';

export const ReceiptNumberPrefix = 'RCP';

export const PaymentSummaryCacheKey = 'payment:summary';

export const PaymentSummaryCacheTtl = 60;
