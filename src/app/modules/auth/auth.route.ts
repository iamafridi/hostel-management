import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { requireAuth } from '../../middlewares/auth';
import { AuthControllers } from './auth.controller';
import { AuthValidations } from './auth.validation';

const router = express.Router();

router.post(
  '/login',
  validateRequest(AuthValidations.loginValidationSchema),
  AuthControllers.login,
);

router.post(
  '/refresh-token',
  validateRequest(AuthValidations.refreshTokenValidationSchema),
  AuthControllers.refreshToken,
);

router.get('/demo-accounts', AuthControllers.getDemoAccounts);

router.get('/me', requireAuth, AuthControllers.getMe);

router.post(
  '/change-password',
  requireAuth,
  validateRequest(AuthValidations.changePasswordValidationSchema),
  AuthControllers.changePassword,
);

export const AuthRoutes = router;
