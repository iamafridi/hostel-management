import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { ClinicalControllers } from './clinical.controller';
import { ClinicalValidations } from './clinical.validation';

const router = express.Router();

// clinical staff may write, every authenticated role may read
const clinicalWriters = requireRole(
  'super-admin',
  'domain-admin',
  'admin',
  'faculty',
  'doctor',
);

router.get('/summary', requireAuth, ClinicalControllers.getClinicalSummary);

router.get(
  '/students/:studentId/logbook',
  requireAuth,
  ClinicalControllers.getStudentLogbook,
);

router.post(
  '/rotations',
  requireAuth,
  clinicalWriters,
  validateRequest(ClinicalValidations.createRotationValidationSchema),
  ClinicalControllers.createRotation,
);
router.get('/rotations', requireAuth, ClinicalControllers.getAllRotations);
router.get(
  '/rotations/:id',
  requireAuth,
  ClinicalControllers.getSingleRotation,
);
router.patch(
  '/rotations/:id',
  requireAuth,
  clinicalWriters,
  validateRequest(ClinicalValidations.updateRotationValidationSchema),
  ClinicalControllers.updateRotation,
);
router.delete(
  '/rotations/:id',
  requireAuth,
  clinicalWriters,
  ClinicalControllers.deleteRotation,
);

router.post(
  '/procedures',
  requireAuth,
  clinicalWriters,
  validateRequest(ClinicalValidations.createProcedureValidationSchema),
  ClinicalControllers.createProcedure,
);
router.get('/procedures', requireAuth, ClinicalControllers.getAllProcedures);
router.get(
  '/procedures/:id',
  requireAuth,
  ClinicalControllers.getSingleProcedure,
);
router.patch(
  '/procedures/:id',
  requireAuth,
  clinicalWriters,
  validateRequest(ClinicalValidations.updateProcedureValidationSchema),
  ClinicalControllers.updateProcedure,
);
router.patch(
  '/procedures/:id/sign-off',
  requireAuth,
  requireRole('super-admin', 'domain-admin', 'faculty', 'doctor'),
  validateRequest(ClinicalValidations.signOffProcedureValidationSchema),
  ClinicalControllers.signOffProcedure,
);
router.delete(
  '/procedures/:id',
  requireAuth,
  clinicalWriters,
  ClinicalControllers.deleteProcedure,
);

export const ClinicalRoutes = router;
