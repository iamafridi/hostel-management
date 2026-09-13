import { randomBytes } from 'crypto';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { getCached, invalidateCache, setCache } from '../../utils/redis';
import {
  NotificationIdPrefix,
  NotificationSearchableFields,
} from './notification.constant';
import { TNotificationPayload } from './notification.interface';
import { Notification } from './notification.model';

const UNREAD_COUNT_CACHE_TTL = 30;

const generateNotificationId = () =>
  `${NotificationIdPrefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`;

const createNotificationIntoDB = async (payload: TNotificationPayload) => {
  const result = await Notification.create({
    ...payload,
    id: payload.id ?? generateNotificationId(),
    deliveredAt: payload.deliveredAt ?? new Date(),
  });

  await invalidateCache('notification:unread:*');

  return result;
};

const getAllNotificationsFromDB = async (query: Record<string, unknown>) => {
  const notificationQuery = new QueryBuilder(Notification.find(), query)
    .search(NotificationSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const total = await notificationQuery.countTotal();
  const result = await notificationQuery.modelQuery;

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

const getSingleNotificationFromDB = async (id: string) => {
  const result = await Notification.findById(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification is not found');
  }

  return result;
};

const markNotificationAsReadIntoDB = async (id: string) => {
  const result = await Notification.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification is not found');
  }

  await invalidateCache('notification:unread:*');

  return result;
};

const markAllNotificationsAsReadIntoDB = async (recipientId: string) => {
  const result = await Notification.updateMany(
    { recipientId, isRead: false },
    { isRead: true, deliveredAt: new Date() },
  );

  await invalidateCache('notification:unread:*');

  return result;
};

const getUnreadNotificationCountFromDB = async (recipientId: string) => {
  const cacheKey = `notification:unread:${recipientId}`;
  const cachedCount = await getCached<number>(cacheKey);

  if (cachedCount !== null) {
    return { recipientId, unread: cachedCount, cached: true };
  }

  const unread = await Notification.countDocuments({
    recipientId,
    isRead: false,
  });

  await setCache(cacheKey, unread, UNREAD_COUNT_CACHE_TTL);

  return { recipientId, unread, cached: false };
};

const deleteNotificationFromDB = async (id: string) => {
  const result = await Notification.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification is not found');
  }

  await invalidateCache('notification:unread:*');

  return result;
};

export const NotificationServices = {
  createNotificationIntoDB,
  getAllNotificationsFromDB,
  getSingleNotificationFromDB,
  markNotificationAsReadIntoDB,
  markAllNotificationsAsReadIntoDB,
  getUnreadNotificationCountFromDB,
  deleteNotificationFromDB,
};
