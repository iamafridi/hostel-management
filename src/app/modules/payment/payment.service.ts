import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { TFeePaidEventPayload } from '../../interface/event';
import { EVENT_TOPICS, publish } from '../../utils/eventBus';
import {
  acquireLock,
  getCached,
  invalidateCache,
  releaseLock,
  setCache,
} from '../../utils/redis';
import { Fee } from '../fee/fee.model';
import { calculateFeeAmounts } from '../fee/fee.utils';
import {
  PaymentSearchableFields,
  PaymentSummaryCacheKey,
  PaymentSummaryCacheTtl,
} from './payment.constant';
import { TPayment } from './payment.interface';
import { Payment } from './payment.model';
import {
  generatePaymentId,
  generateQrToken,
  generateReceiptNumber,
  generateTransactionId,
} from './payment.utils';

// payments on the same invoice are serialised through redis, and the fee update is a compare and
// set, so a stale read can never overwrite a payment that landed in between
const PAYMENT_LOCK_TTL_MS = 15000;

const recordPaymentIntoDB = async (
  payload: Partial<TPayment>,
  options: { correlationId?: string },
) => {
  const fee = await Fee.findById(payload.fee);

  if (!fee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Fee record is not found');
  }

  if (fee.status === 'paid') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This fee has already been paid in full',
    );
  }

  const amount = Number(payload.amount);

  if (!amount || amount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Payment amount must be greater than zero',
    );
  }

  if (amount > fee.dueAmount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Payment amount can not be greater than the due amount (${fee.dueAmount})`,
    );
  }

  const amounts = calculateFeeAmounts(fee.feeHeads, {
    discount: fee.discount,
    lateFee: fee.lateFee,
    paidAmount: fee.paidAmount + amount,
  });

  const session = await mongoose.startSession();

  const result = await (async () => {
    try {
      session.startTransaction();

      const createdPayments = await Payment.create(
        [
          {
            id: generatePaymentId(),
            fee: fee._id,
            student: fee.student,
            amount,
            method: payload.method,
            transactionId: payload.transactionId ?? generateTransactionId(),
            receiptNumber: generateReceiptNumber(),
            qrToken: generateQrToken(),
            paymentDate: payload.paymentDate
              ? new Date(payload.paymentDate)
              : new Date(),
            status: 'success',
            remarks: payload.remarks,
            gatewayResponse: payload.gatewayResponse,
          },
        ],
        { session },
      );

      // the paid amount that was read is part of the filter, so only one writer can win
      const updatedFee = await Fee.findOneAndUpdate(
        { _id: fee._id, paidAmount: fee.paidAmount, status: { $ne: 'paid' } },
        {
          paidAmount: amounts.paidAmount,
          dueAmount: amounts.dueAmount,
          status: amounts.status,
        },
        { new: true, runValidators: true, session },
      );

      if (!updatedFee) {
        throw new AppError(
          httpStatus.CONFLICT,
          'The invoice was updated by another payment, please retry',
        );
      }

      await session.commitTransaction();

      // the qr token is only exposed through the signed verification endpoint, never in the body
      const payment = createdPayments[0].toObject();

      return { payment, fee: updatedFee };
    } catch (err) {
      await session.abortTransaction();

      if (err instanceof AppError) {
        throw err;
      }

      // the unique transaction id makes a duplicated webhook delivery fail right here
      if ((err as { code?: number })?.code === 11000) {
        throw err;
      }

      console.error(
        '[payment] failed to record the payment:',
        (err as Error).message,
      );
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to record the payment',
      );
    } finally {
      await session.endSession();
    }
  })();

  // domain event : notifications, analytics and reporting react to it asynchronously
  const eventPayload: TFeePaidEventPayload = {
    paymentId: result.payment.id,
    receiptNumber: result.payment.receiptNumber,
    feeId: fee.id,
    studentId: String(fee.student),
    amount: result.payment.amount,
    method: result.payment.method,
    paidAmount: result.fee.paidAmount,
    dueAmount: result.fee.dueAmount,
    status: result.fee.status,
  };

  await publish(EVENT_TOPICS.feePaid, eventPayload, {
    key: String(fee.student),
    correlationId: options.correlationId,
  });

  await invalidateCache('fee:*');
  await invalidateCache('payment:*');

  return result;
};

const createPaymentIntoDB = async (
  payload: Partial<TPayment>,
  options: { correlationId?: string } = {},
) => {
  const lockKey = `lock:fee:payment:${String(payload.fee ?? 'unknown')}`;
  const lockToken = await acquireLock(lockKey, PAYMENT_LOCK_TTL_MS);

  try {
    return await recordPaymentIntoDB(payload, options);
  } finally {
    // without redis the compare and set update still protects the invoice
    if (lockToken) await releaseLock(lockKey, lockToken);
  }
};

const getAllPaymentsFromDB = async (query: Record<string, unknown>) => {
  const paymentQuery = new QueryBuilder(
    Payment.find()
      .populate('student', 'id name email')
      .populate('fee', 'id totalAmount paidAmount dueAmount status'),
    query,
  )
    .search(PaymentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const total = await paymentQuery.countTotal();
  const result = await paymentQuery.modelQuery;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    result,
  };
};

const getSinglePaymentFromDB = async (id: string) => {
  const result = await Payment.findById(id)
    .populate('student', 'id name email')
    .populate('fee', 'id totalAmount paidAmount dueAmount status');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment is not found');
  }

  return result;
};

// public verification : the token behind the qr code has to match the stored one
const verifyReceiptFromDB = async (receiptNumber: string, qrToken?: string) => {
  const payment = await Payment.findOne({ receiptNumber })
    .select('+qrToken')
    .populate('student', 'id name email');

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Receipt is not found');
  }

  if (qrToken && qrToken !== payment.qrToken) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'The receipt token is not valid',
    );
  }

  return {
    receiptNumber: payment.receiptNumber,
    amount: payment.amount,
    method: payment.method,
    paymentDate: payment.paymentDate,
    status: payment.status,
    student: payment.student,
    verified: true,
  };
};

const reversePaymentIntoDB = async (
  id: string,
  payload: { refundReason?: string; refundedAt?: string },
  options: { correlationId?: string },
) => {
  const payment = await Payment.findById(id);

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment is not found');
  }

  if (payment.status === 'refunded') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This payment has already been refunded',
    );
  }

  if (payment.status !== 'success') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Only a successful payment can be refunded',
    );
  }

  const fee = await Fee.findById(payment.fee);

  if (!fee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Fee record is not found');
  }

  // the invoice moves back to the state it was in before this payment
  const amounts = calculateFeeAmounts(fee.feeHeads, {
    discount: fee.discount,
    lateFee: fee.lateFee,
    paidAmount: Math.max(fee.paidAmount - payment.amount, 0),
  });

  const session = await mongoose.startSession();

  const result = await (async () => {
    try {
      session.startTransaction();

      // only a payment that is still successful can be reversed, so a double refund can not win
      const refundedPayment = await Payment.findOneAndUpdate(
        { _id: id, status: 'success' },
        {
          status: 'refunded',
          refundedAmount: payment.amount,
          refundedAt: payload.refundedAt
            ? new Date(payload.refundedAt)
            : new Date(),
          refundReason: payload.refundReason,
        },
        { new: true, runValidators: true, session },
      );

      if (!refundedPayment) {
        throw new AppError(
          httpStatus.CONFLICT,
          'This payment has already been reversed',
        );
      }

      const updatedFee = await Fee.findOneAndUpdate(
        { _id: fee._id, paidAmount: fee.paidAmount },
        {
          paidAmount: amounts.paidAmount,
          dueAmount: amounts.dueAmount,
          status: amounts.status,
        },
        { new: true, runValidators: true, session },
      );

      if (!updatedFee) {
        throw new AppError(
          httpStatus.CONFLICT,
          'The invoice was updated by another transaction, please retry',
        );
      }

      await session.commitTransaction();

      return { payment: refundedPayment, fee: updatedFee };
    } catch (err) {
      await session.abortTransaction();

      if (err instanceof AppError) {
        throw err;
      }

      console.error(
        '[payment] failed to refund the payment:',
        (err as Error).message,
      );
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to refund the payment',
      );
    } finally {
      await session.endSession();
    }
  })();

  await invalidateCache('fee:*');
  await invalidateCache('payment:*');

  console.log(
    `[payment] refunded ${payment.amount} for payment ${payment.id} (correlation: ${
      options.correlationId ?? 'n/a'
    })`,
  );

  return result;
};

const refundPaymentIntoDB = async (
  id: string,
  payload: { refundReason?: string; refundedAt?: string },
  options: { correlationId?: string } = {},
) => {
  const lockKey = `lock:payment:refund:${id}`;
  const lockToken = await acquireLock(lockKey, PAYMENT_LOCK_TTL_MS);

  try {
    return await reversePaymentIntoDB(id, payload, options);
  } finally {
    if (lockToken) await releaseLock(lockKey, lockToken);
  }
};

// webhook deliveries are retried by the gateway, so the gateway payment id is the idempotency key
const processRazorpayWebhookIntoDB = async (
  event: { event?: string; payload?: Record<string, unknown> },
  options: { correlationId?: string } = {},
) => {
  const paymentEntity = (
    event.payload?.payment as { entity?: Record<string, unknown> } | undefined
  )?.entity;

  if (!paymentEntity) {
    return {
      processed: false,
      reason: 'The webhook payload does not carry a payment entity',
    };
  }

  const gatewayPaymentId = String(paymentEntity.id ?? '');
  const notes = (paymentEntity.notes ?? {}) as Record<string, unknown>;
  const feeId = notes.feeId ? String(notes.feeId) : undefined;

  // the gateway reports the amount in the smallest currency unit
  const amount = Number(paymentEntity.amount ?? 0) / 100;

  if (event.event === 'payment.failed') {
    console.error(
      `[payment] the gateway reported a failed payment ${gatewayPaymentId}`,
    );
    return {
      processed: false,
      reason: 'Failed gateway payments are only logged',
    };
  }

  if (event.event !== 'payment.captured') {
    return { processed: false, reason: `The event ${event.event} is ignored` };
  }

  if (!feeId) {
    return {
      processed: false,
      reason: 'The gateway payload does not carry a feeId in its notes',
    };
  }

  const existingPayment = await Payment.findOne({
    transactionId: gatewayPaymentId,
  });

  if (existingPayment) {
    return {
      processed: false,
      reason: 'This gateway payment has already been recorded',
      paymentId: existingPayment.id,
    };
  }

  try {
    const result = await createPaymentIntoDB(
      {
        fee: new Types.ObjectId(feeId),
        amount,
        method: 'online',
        transactionId: gatewayPaymentId,
        remarks: 'Captured through the razorpay webhook',
        gatewayResponse: paymentEntity,
      },
      options,
    );

    return {
      processed: true,
      paymentId: result.payment.id,
      receiptNumber: result.payment.receiptNumber,
    };
  } catch (err) {
    // two deliveries of the same gateway payment can arrive together, the index rejects the loser
    if ((err as { code?: number })?.code === 11000) {
      return {
        processed: false,
        reason: 'This gateway payment has already been recorded',
      };
    }

    throw err;
  }
};

const getPaymentSummaryFromDB = async () => {
  const cachedSummary = await getCached<Record<string, unknown>>(
    PaymentSummaryCacheKey,
  );
  if (cachedSummary) {
    return cachedSummary;
  }

  const [byMethod, byStatus, totals] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'success' } },
      {
        $group: {
          _id: '$method',
          total: { $sum: 1 },
          collectedAmount: { $sum: '$amount' },
        },
      },
      { $sort: { collectedAmount: -1 } },
    ]),
    Payment.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Payment.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalCollected: { $sum: '$amount' },
          totalRefunded: { $sum: '$refundedAmount' },
        },
      },
      { $project: { _id: 0 } },
    ]),
  ]);

  const summary = { byMethod, byStatus, totals: totals[0] ?? {} };

  await setCache(PaymentSummaryCacheKey, summary, PaymentSummaryCacheTtl);

  return summary;
};

const deletePaymentFromDB = async (id: string) => {
  const existingPayment = await Payment.findById(id);

  if (!existingPayment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Payment is not found');
  }

  if (existingPayment.status === 'success') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'A successful payment can not be deleted, refund it instead',
    );
  }

  const result = await Payment.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  await invalidateCache('payment:*');

  return result;
};

export const PaymentServices = {
  createPaymentIntoDB,
  getAllPaymentsFromDB,
  getSinglePaymentFromDB,
  verifyReceiptFromDB,
  refundPaymentIntoDB,
  processRazorpayWebhookIntoDB,
  getPaymentSummaryFromDB,
  deletePaymentFromDB,
};
