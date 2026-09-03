import { Model, Schema, model, models } from 'mongoose';
import {
  AuditActions,
  AuditLogRetentionSeconds,
  AuditSources,
} from './auditLog.constant';
import { TAuditActor, TAuditLog } from './auditLog.interface';

const auditActorSchema = new Schema<TAuditActor>(
  {
    userId: { type: String, trim: true },
    email: { type: String, trim: true },
    role: { type: String, trim: true },
  },
  { _id: false },
);

const auditLogSchema = new Schema<TAuditLog>(
  {
    eventId: { type: String },
    correlationId: {
      type: String,
      required: [true, 'Correlation ID is required'],
      index: true,
    },
    action: {
      type: String,
      enum: {
        values: AuditActions,
        message: '{VALUE} is not a valid audit action',
      },
      required: [true, 'Action is required'],
    },
    module: {
      type: String,
      required: [true, 'Module is required'],
      trim: true,
      index: true,
    },
    resourceId: { type: String, trim: true },
    method: { type: String, required: [true, 'Method is required'] },
    path: { type: String, required: [true, 'Path is required'] },
    statusCode: { type: Number, required: [true, 'Status code is required'] },
    durationMs: { type: Number, default: 0 },
    actor: { type: auditActorSchema, default: () => ({}) },
    ip: { type: String },
    userAgent: { type: String },
    requestBody: { type: Schema.Types.Mixed },
    responseSummary: { type: Schema.Types.Mixed },
    errorMessage: { type: String },
    retryCount: { type: Number, default: 0 },
    source: {
      type: String,
      enum: {
        values: AuditSources,
        message: '{VALUE} is not a valid audit source',
      },
      default: 'direct',
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

// ttl index : entries older than the retention window are removed automatically
auditLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: AuditLogRetentionSeconds },
);
// kafka delivers at least once, so the event id enforces that a replay does not duplicate the trail
auditLogSchema.index({ eventId: 1 }, { unique: true, sparse: true });
auditLogSchema.index({ module: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ correlationId: 1, createdAt: -1 });

// filter out deleted documents
auditLogSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

auditLogSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

auditLogSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const AuditLog: Model<TAuditLog> =
  (models.AuditLog as Model<TAuditLog>) ||
  model<TAuditLog>('AuditLog', auditLogSchema);
