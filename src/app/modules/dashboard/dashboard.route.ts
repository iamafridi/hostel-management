import express from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth';
import { DashboardControllers } from './dashboard.controller';

const router = express.Router();

// institutional analytics are available to management and finance roles
const analyticsRoles = requireRole(
  'super-admin',
  'domain-admin',
  'admin',
  'accountant',
);

router.get(
  '/overview',
  requireAuth,
  analyticsRoles,
  DashboardControllers.getOverview,
);
router.get(
  '/recent-activity',
  requireAuth,
  analyticsRoles,
  DashboardControllers.getRecentActivity,
);

export const DashboardRoutes = router;
