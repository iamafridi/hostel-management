import { randomBytes } from 'crypto';
import { FeeIdPrefix } from './fee.constant';
import { TFeeAmounts, TFeeHead, TFeeStatus } from './fee.interface';

export const resolveFeeStatus = (
  paidAmount: number,
  payableAmount: number,
): TFeeStatus => {
  if (paidAmount <= 0) return 'unpaid';
  if (paidAmount < payableAmount) return 'partial';

  return 'paid';
};

// the single source of truth for the fee arithmetic used by the fee and payment modules
export const calculateFeeAmounts = (
  feeHeads: TFeeHead[],
  options: { discount?: number; lateFee?: number; paidAmount?: number } = {},
): TFeeAmounts => {
  const totalAmount = feeHeads.reduce(
    (total, feeHead) => total + Number(feeHead.amount ?? 0),
    0,
  );
  const discount = Number(options.discount ?? 0);
  const lateFee = Number(options.lateFee ?? 0);
  const paidAmount = Number(options.paidAmount ?? 0);
  const payableAmount = totalAmount + lateFee - discount;
  const dueAmount = Math.max(payableAmount - paidAmount, 0);

  return {
    totalAmount,
    discount,
    lateFee,
    paidAmount,
    payableAmount,
    dueAmount,
    status: resolveFeeStatus(paidAmount, payableAmount),
  };
};

export const generateFeeId = () =>
  `${FeeIdPrefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`;
