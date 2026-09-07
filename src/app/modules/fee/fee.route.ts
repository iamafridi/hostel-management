import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { FeeControllers } from './fee.controller';
import { FeeValidations } from './fee.validation';

const router = express.Router();

router.post(
  '/create-fee',
  validateRequest(FeeValidations.createFeeValidationSchema),
  FeeControllers.createFee,
);
router.post(
  '/generate-bulk-fees',
  validateRequest(FeeValidations.generateBulkFeesValidationSchema),
  FeeControllers.generateBulkFees,
);
router.get('/summary', FeeControllers.getFeeSummary);
router.get('/:id', FeeControllers.getSingleFee);
router.get('/', FeeControllers.getAllFees);
router.patch(
  '/:id',
  validateRequest(FeeValidations.updateFeeValidationSchema),
  FeeControllers.updateFee,
);
router.delete('/:id', FeeControllers.deleteFee);

export const FeeRoutes = router;
