import { Types } from 'mongoose';

export type TFeeHeadCategory =
  | 'tuition'
  | 'hostel'
  | 'transport'
  | 'library'
  | 'laboratory'
  | 'examination'
  | 'other';

export type TFeeStatus = 'unpaid' | 'partial' | 'paid';

export type TFeeHead = {
  head: string;
  category: TFeeHeadCategory;
  amount: number;
};

export type TFee = {
  id: string;
  student: Types.ObjectId;
  academicSemester: Types.ObjectId;
  academicDepartment?: Types.ObjectId;
  feeHeads: TFeeHead[];
  totalAmount: number;
  discount: number;
  lateFee: number;
  paidAmount: number;
  dueAmount: number;
  status: TFeeStatus;
  dueDate: Date;
  remarks?: string;
  isDeleted?: boolean;
};

export type TFeeAmounts = {
  totalAmount: number;
  discount: number;
  lateFee: number;
  paidAmount: number;
  payableAmount: number;
  dueAmount: number;
  status: TFeeStatus;
};
