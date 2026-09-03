import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuditLogControllers } from './auditLog.controller';
import { AuditLogValidations } from './auditLog.validation';

const router = express.Router();

router.post(
  '/create-audit-log',
  validateRequest(AuditLogValidations.createAuditLogValidationSchema),
  AuditLogControllers.createAuditLog,
);
router.get('/stats', AuditLogControllers.getAuditStats);
router.get(
  '/trail/:correlationId',
  AuditLogControllers.getAuditTrailByCorrelationId,
);
router.get('/:id', AuditLogControllers.getSingleAuditLog);
router.get('/', AuditLogControllers.getAllAuditLogs);
router.delete('/:id', AuditLogControllers.deleteAuditLog);

export const AuditLogRoutes = router;
