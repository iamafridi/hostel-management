import { Types } from 'mongoose';

export type TPaymentMethod = 'online' | 'offline' | 'bank-transfer' | 'cash';

export type TPaymentStatus = 'success' | 'failed' | 'refunded';

export type TPayment = {
  id: string;
  fee: Types.ObjectId;
  student: Types.ObjectId;
  amount: number;
  method: TPaymentMethod;
  transactionId: string;
  receiptNumber: string;
  qrToken: string;
  paymentDate: Date;
  status: TPaymentStatus;
  remarks?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  refundReason?: string;
  gatewayResponse?: Record<string, unknown>;
  isDeleted?: boolean;
};
