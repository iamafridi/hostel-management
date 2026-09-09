import { randomBytes } from 'crypto';
import { PaymentIdPrefix, ReceiptNumberPrefix } from './payment.constant';

const randomSuffix = (length: number) =>
  randomBytes(8).toString('hex').slice(0, length).toUpperCase();

export const generatePaymentId = () =>
  `${PaymentIdPrefix}-${Date.now().toString(36).toUpperCase()}-${randomSuffix(4)}`;

// a receipt carries a readable number and a token that a scanned qr code can be verified against
export const generateReceiptNumber = () =>
  `${ReceiptNumberPrefix}-${Date.now().toString(36).toUpperCase()}-${randomSuffix(6)}`;

export const generateQrToken = () => randomBytes(16).toString('hex');

export const generateTransactionId = () =>
  `TXN-${Date.now().toString(36).toUpperCase()}-${randomSuffix(6)}`;
