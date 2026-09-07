import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { getCached, invalidateCache, setCache } from '../../utils/redis';
import { Student } from '../student/student.model';
import {
  FeeSearchableFields,
  FeeSummaryCacheKey,
  FeeSummaryCacheTtl,
} from './fee.constant';
import { TFee, TFeeHead } from './fee.interface';
import { Fee } from './fee.model';
import { calculateFeeAmounts, generateFeeId } from './fee.utils';

const createFeeIntoDB = async (payload: TFee) => {
  const student = await Student.findById(payload.student);

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student is not found');
  }

  const existingFee = await Fee.findOne({
    student: payload.student,
    academicSemester: payload.academicSemester,
  });

  if (existingFee) {
    throw new AppError(
      httpStatus.CONFLICT,
      'A fee for this student and semester already exists',
    );
  }

  const amounts = calculateFeeAmounts(payload.feeHeads, {
    discount: payload.discount,
    lateFee: payload.lateFee,
  });

  const result = await Fee.create({
    ...payload,
    id: payload.id ?? generateFeeId(),
    totalAmount: amounts.totalAmount,
    discount: amounts.discount,
    lateFee: amounts.lateFee,
    paidAmount: amounts.paidAmount,
    dueAmount: amounts.dueAmount,
    status: amounts.status,
  });

  await invalidateCache('fee:*');

  return result;
};

// generates the same invoice for a batch of students in one transaction
const generateBulkFeesIntoDB = async (payload: {
  students: string[];
  academicSemester: string;
  academicDepartment?: string;
  feeHeads: TFeeHead[];
  dueDate: string;
  discount?: number;
  lateFee?: number;
  remarks?: string;
}) => {
  const amounts = calculateFeeAmounts(payload.feeHeads, {
    discount: payload.discount,
    lateFee: payload.lateFee,
  });

  const feeDocuments = payload.students.map((student) => ({
    id: generateFeeId(),
    student,
    academicSemester: payload.academicSemester,
    academicDepartment: payload.academicDepartment,
    feeHeads: payload.feeHeads,
    totalAmount: amounts.totalAmount,
    discount: amounts.discount,
    lateFee: amounts.lateFee,
    paidAmount: 0,
    dueAmount: amounts.dueAmount,
    status: amounts.status,
    dueDate: new Date(payload.dueDate),
    remarks: payload.remarks,
  }));

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const result = await Fee.insertMany(feeDocuments, {
      session,
      ordered: true,
    });

    await session.commitTransaction();
    await session.endSession();

    await invalidateCache('fee:*');

    return { insertedCount: result.length, fees: result };
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();

    if (err instanceof AppError) {
      throw err;
    }

    console.error('[fee] bulk generation failed:', (err as Error).message);
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to generate the fees');
  }
};

const getAllFeesFromDB = async (query: Record<string, unknown>) => {
  const feeQuery = new QueryBuilder(
    Fee.find()
      .populate('student', 'id name email contactNo')
      .populate('academicSemester', 'name year code'),
    query,
  )
    .search(FeeSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const total = await feeQuery.countTotal();
  const result = await feeQuery.modelQuery;

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

const getSingleFeeFromDB = async (id: string) => {
  const result = await Fee.findById(id)
    .populate('student', 'id name email contactNo')
    .populate('academicSemester', 'name year code');

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Fee is not found');
  }

  return result;
};

const updateFeeIntoDB = async (id: string, payload: Partial<TFee>) => {
  const existingFee = await Fee.findById(id);

  if (!existingFee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Fee is not found');
  }

  if (existingFee.status === 'paid') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'A fully paid fee can not be modified',
    );
  }

  const feeHeads = payload.feeHeads ?? existingFee.feeHeads;
  const discount = payload.discount ?? existingFee.discount;
  const lateFee = payload.lateFee ?? existingFee.lateFee;

  // the amounts are always derived, never trusted from the request body
  const amounts = calculateFeeAmounts(feeHeads, {
    discount,
    lateFee,
    paidAmount: existingFee.paidAmount,
  });

  if (amounts.payableAmount < existingFee.paidAmount) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'The updated payable amount can not be lower than the amount already paid',
    );
  }

  const result = await Fee.findByIdAndUpdate(
    id,
    {
      feeHeads,
      totalAmount: amounts.totalAmount,
      discount: amounts.discount,
      lateFee: amounts.lateFee,
      dueAmount: amounts.dueAmount,
      status: amounts.status,
      dueDate: payload.dueDate ?? existingFee.dueDate,
      remarks: payload.remarks ?? existingFee.remarks,
    },
    { new: true, runValidators: true },
  );

  await invalidateCache('fee:*');

  return result;
};

const deleteFeeFromDB = async (id: string) => {
  const existingFee = await Fee.findById(id);

  if (!existingFee) {
    throw new AppError(httpStatus.NOT_FOUND, 'Fee is not found');
  }

  if (existingFee.paidAmount > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'A fee that already has recorded payments can not be deleted',
    );
  }

  const result = await Fee.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  await invalidateCache('fee:*');

  return result;
};

const getFeeSummaryFromDB = async () => {
  const cachedSummary =
    await getCached<Record<string, unknown>>(FeeSummaryCacheKey);
  if (cachedSummary) {
    return cachedSummary;
  }

  const [byStatus, totals] = await Promise.all([
    Fee.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: 1 },
          billedAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' },
          dueAmount: { $sum: '$dueAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Fee.aggregate([
      {
        $group: {
          _id: null,
          totalFees: { $sum: 1 },
          totalBilled: { $sum: '$totalAmount' },
          totalCollected: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
          totalDiscount: { $sum: '$discount' },
          totalLateFee: { $sum: '$lateFee' },
        },
      },
      { $project: { _id: 0 } },
    ]),
  ]);

  const summary = { byStatus, totals: totals[0] ?? {} };

  await setCache(FeeSummaryCacheKey, summary, FeeSummaryCacheTtl);

  return summary;
};

export const FeeServices = {
  createFeeIntoDB,
  generateBulkFeesIntoDB,
  getAllFeesFromDB,
  getSingleFeeFromDB,
  updateFeeIntoDB,
  deleteFeeFromDB,
  getFeeSummaryFromDB,
};
