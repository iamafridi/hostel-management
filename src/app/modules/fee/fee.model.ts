import { Model, Schema, model, models } from 'mongoose';
import { FeeHeadCategories, FeeStatuses } from './fee.constant';
import { TFee, TFeeHead } from './fee.interface';

const feeHeadSchema = new Schema<TFeeHead>({
  head: { type: String, required: [true, 'Fee head is required'], trim: true },
  category: {
    type: String,
    enum: {
      values: FeeHeadCategories,
      message: '{VALUE} is not a valid fee head category',
    },
    required: [true, 'Fee head category is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Fee head amount is required'],
    min: [0, 'Fee head amount can not be negative'],
  },
});

const feeSchema = new Schema<TFee>(
  {
    id: { type: String, required: [true, 'ID is required'], unique: true },
    student: {
      type: Schema.Types.ObjectId,
      required: [true, 'Student is required'],
      ref: 'Student',
    },
    academicSemester: {
      type: Schema.Types.ObjectId,
      required: [true, 'Academic semester is required'],
      ref: 'AcademicSemester',
    },
    academicDepartment: {
      type: Schema.Types.ObjectId,
      ref: 'AcademicDepartment',
    },
    feeHeads: {
      type: [feeHeadSchema],
      required: [true, 'Fee heads are required'],
      validate: {
        validator: (feeHeads: TFeeHead[]) => feeHeads.length > 0,
        message: 'At least one fee head is required',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    discount: { type: Number, default: 0, min: 0 },
    lateFee: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: {
        values: FeeStatuses,
        message: '{VALUE} is not a valid fee status',
      },
      default: 'unpaid',
    },
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    remarks: { type: String, trim: true },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// one invoice per student per semester, a soft deleted invoice does not block a new one
feeSchema.index(
  { student: 1, academicSemester: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
feeSchema.index({ status: 1 });
feeSchema.index({ dueDate: 1 });

// filter out deleted documents
feeSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

feeSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

feeSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

export const Fee: Model<TFee> =
  (models.Fee as Model<TFee>) || model<TFee>('Fee', feeSchema);
