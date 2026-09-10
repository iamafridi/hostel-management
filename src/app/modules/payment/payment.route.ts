import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentControllers } from './payment.controller';
import { PaymentValidations } from './payment.validation';

const router = express.Router();

router.post(
  '/create-payment',
  validateRequest(PaymentValidations.createPaymentValidationSchema),
  PaymentControllers.createPayment,
);
router.post('/razorpay/webhook', PaymentControllers.handleRazorpayWebhook);
router.get('/summary', PaymentControllers.getPaymentSummary);
router.get('/receipt/:receiptNumber/verify', PaymentControllers.verifyReceipt);
router.get('/:id', PaymentControllers.getSinglePayment);
router.get('/', PaymentControllers.getAllPayments);
router.patch(
  '/:id/refund',
  validateRequest(PaymentValidations.refundPaymentValidationSchema),
  PaymentControllers.refundPayment,
);
router.delete('/:id', PaymentControllers.deletePayment);

export const PaymentRoutes = router;
