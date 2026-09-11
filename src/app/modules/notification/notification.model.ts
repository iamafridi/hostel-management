import { Model, Schema, model, models } from 'mongoose';
import {
  NotificationChannels,
  NotificationSources,
  NotificationTypes,
} from './notification.constant';
import { TNotification } from './notification.interface';

const notificationSchema = new Schema<TNotification>(
  {
    id: { type: String, required: [true, 'ID is required'], unique: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: NotificationTypes,
        message: '{VALUE} is not a valid notification type',
      },
      default: 'info',
    },
    channel: {
      type: String,
      enum: {
        values: NotificationChannels,
        message: '{VALUE} is not a valid notification channel',
      },
      default: 'in-app',
    },
    recipientId: { type: String, trim: true, index: true },
    recipientRole: { type: String, trim: true },
    referenceId: { type: String, trim: true, index: true },
    correlationId: { type: String, trim: true, index: true },
    isRead: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    failureReason: { type: String },
    retryCount: { type: Number, default: 0 },
    source: {
      type: String,
      enum: {
        values: NotificationSources,
        message: '{VALUE} is not a valid notification source',
      },
      default: 'api',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });

// filter out deleted documents
notificationSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

notificationSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

notificationSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const Notification: Model<TNotification> =
  (models.Notification as Model<TNotification>) ||
  model<TNotification>('Notification', notificationSchema);
