import { Model, Schema, model, models } from 'mongoose';
import { PaymentMethods, PaymentStatuses } from './payment.constant';
import { TPayment } from './payment.interface';

const paymentSchema = new Schema<TPayment>(
  {
    id: { type: String, required: [true, 'ID is required'], unique: true },
    fee: {
      type: Schema.Types.ObjectId,
      required: [true, 'Fee is required'],
      ref: 'Fee',
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      required: [true, 'Student is required'],
      ref: 'Student',
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount can not be negative'],
    },
    method: {
      type: String,
      enum: {
        values: PaymentMethods,
        message: '{VALUE} is not a valid payment method',
      },
      required: [true, 'Payment method is required'],
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      trim: true,
    },
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      unique: true,
      trim: true,
    },
    qrToken: {
      type: String,
      required: [true, 'QR token is required'],
      select: false,
    },
    paymentDate: { type: Date, required: [true, 'Payment date is required'] },
    status: {
      type: String,
      enum: {
        values: PaymentStatuses,
        message: '{VALUE} is not a valid payment status',
      },
      default: 'success',
    },
    remarks: { type: String, trim: true },
    refundedAmount: { type: Number, default: 0, min: 0 },
    refundedAt: { type: Date },
    refundReason: { type: String, trim: true },
    gatewayResponse: { type: Schema.Types.Mixed },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ fee: 1, status: 1 });
paymentSchema.index({ paymentDate: -1 });
// a gateway transaction may only be recorded once so a webhook replay can not credit twice
paymentSchema.index({ transactionId: 1 }, { unique: true });

// filter out deleted documents
paymentSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

paymentSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

paymentSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const Payment: Model<TPayment> =
  (models.Payment as Model<TPayment>) ||
  model<TPayment>('Payment', paymentSchema);
