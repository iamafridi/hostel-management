import { createHmac, timingSafeEqual } from 'crypto';
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PaymentServices } from './payment.service';

const createPayment = catchAsync(async (req, res) => {
  const result = await PaymentServices.createPaymentIntoDB(req.body, {
    correlationId: (req as typeof req & { correlationId?: string })
      .correlationId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Payment has been recorded successfully',
    data: result,
  });
});

const getAllPayments = catchAsync(async (req, res) => {
  const { meta, result } = await PaymentServices.getAllPaymentsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments have been retrieved successfully',
    meta,
    data: result,
  });
});

const getSinglePayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PaymentServices.getSinglePaymentFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment has been retrieved successfully',
    data: result,
  });
});

const getPaymentSummary = catchAsync(async (req, res) => {
  const result = await PaymentServices.getPaymentSummaryFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment summary has been retrieved successfully',
    data: result,
  });
});

const verifyReceipt = catchAsync(async (req, res) => {
  const { receiptNumber } = req.params;
  const { token } = req.query;
  const result = await PaymentServices.verifyReceiptFromDB(
    receiptNumber,
    token as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Receipt has been verified successfully',
    data: result,
  });
});

const refundPayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PaymentServices.refundPaymentIntoDB(id, req.body, {
    correlationId: (req as typeof req & { correlationId?: string })
      .correlationId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment has been refunded successfully',
    data: result,
  });
});

const deletePayment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await PaymentServices.deletePaymentFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment has been deleted successfully',
    data: result,
  });
});

// the gateway signs the raw body, so the signature is verified before anything is processed
const handleRazorpayWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  const rawBody = (req as typeof req & { rawBody?: Buffer }).rawBody;

  if (!config.razorpay_webhook_secret) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'The razorpay webhook secret is not configured',
    );
  }

  if (!signature || !rawBody) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'The webhook signature is missing',
    );
  }

  const expectedSignature = createHmac('sha256', config.razorpay_webhook_secret)
    .update(rawBody)
    .digest('hex');

  const signatureBuffer = Buffer.from(signature, 'utf-8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'The webhook signature is not valid',
    );
  }

  const result = await PaymentServices.processRazorpayWebhookIntoDB(req.body, {
    correlationId: (req as typeof req & { correlationId?: string })
      .correlationId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook has been processed successfully',
    data: result,
  });
});

export const PaymentControllers = {
  createPayment,
  getAllPayments,
  getSinglePayment,
  getPaymentSummary,
  verifyReceipt,
  refundPayment,
  handleRazorpayWebhook,
  deletePayment,
};
