import { TFeeHeadCategory, TFeeStatus } from './fee.interface';

export const FeeSearchableFields = ['id', 'status', 'remarks'];

export const FeeStatuses: TFeeStatus[] = ['unpaid', 'partial', 'paid'];

export const FeeHeadCategories: TFeeHeadCategory[] = [
  'tuition',
  'hostel',
  'transport',
  'library',
  'laboratory',
  'examination',
  'other',
];

export const FeeIdPrefix = 'FEE';

export const FeeSummaryCacheKey = 'fee:summary';

export const FeeSummaryCacheTtl = 60;
