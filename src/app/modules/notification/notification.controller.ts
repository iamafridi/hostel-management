import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NotificationServices } from './notification.service';

const createNotification = catchAsync(async (req, res) => {
  const result = await NotificationServices.createNotificationIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Notification has been created successfully',
    data: result,
  });
});

const getAllNotifications = catchAsync(async (req, res) => {
  const { meta, result } = await NotificationServices.getAllNotificationsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications have been retrieved successfully',
    meta,
    data: result,
  });
});

const getSingleNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NotificationServices.getSingleNotificationFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification has been retrieved successfully',
    data: result,
  });
});

const getUnreadNotificationCount = catchAsync(async (req, res) => {
  const recipientId = (req.params.recipientId ??
    req.query.recipientId) as string;
  const result =
    await NotificationServices.getUnreadNotificationCountFromDB(recipientId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Unread notification count has been retrieved successfully',
    data: result,
  });
});

const markNotificationAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NotificationServices.markNotificationAsReadIntoDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification has been marked as read successfully',
    data: result,
  });
});

const markAllNotificationsAsRead = catchAsync(async (req, res) => {
  const { recipientId } = req.params;
  const result =
    await NotificationServices.markAllNotificationsAsReadIntoDB(recipientId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications have been marked as read successfully',
    data: result,
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await NotificationServices.deleteNotificationFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification has been deleted successfully',
    data: result,
  });
});

export const NotificationControllers = {
  createNotification,
  getAllNotifications,
  getSingleNotification,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
