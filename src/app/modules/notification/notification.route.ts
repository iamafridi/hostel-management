import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { NotificationControllers } from './notification.controller';
import { NotificationValidations } from './notification.validation';

const router = express.Router();

router.post(
  '/create-notification',
  validateRequest(NotificationValidations.createNotificationValidationSchema),
  NotificationControllers.createNotification,
);
router.get(
  '/unread-count/:recipientId',
  NotificationControllers.getUnreadNotificationCount,
);
router.patch(
  '/read-all/:recipientId',
  NotificationControllers.markAllNotificationsAsRead,
);
router.patch('/:id/read', NotificationControllers.markNotificationAsRead);
router.get('/:id', NotificationControllers.getSingleNotification);
router.get('/', NotificationControllers.getAllNotifications);
router.delete('/:id', NotificationControllers.deleteNotification);

export const NotificationRoutes = router;
