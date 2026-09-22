import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { getCached, invalidateCache, setCache } from '../../utils/redis';
import { Student } from '../student/student.model';
import {
  ClinicalProcedureSearchableFields,
  ClinicalRotationSearchableFields,
  ClinicalSummaryCacheKey,
  ClinicalSummaryCacheTtl,
  ProcedureIdPrefix,
  RotationIdPrefix,
  generateClinicalId,
} from './clinical.constant';
import {
  TClinicalProcedure,
  TClinicalRotation,
  TSignOffStatus,
} from './clinical.interface';
import { ClinicalProcedure, ClinicalRotation } from './clinical.model';

const rotationPopulate = [
  { path: 'student', select: 'id name email contactNo' },
  { path: 'course', select: 'title code prefix credits' },
  { path: 'supervisor', select: 'id name designation' },
];

const procedurePopulate = [
  { path: 'student', select: 'id name email' },
  { path: 'rotation', select: 'id hospital ward status' },
  { path: 'supervisorSignOff.supervisor', select: 'id name designation' },
];

/* ----------------------------- rotations ----------------------------- */

const createRotationIntoDB = async (payload: Partial<TClinicalRotation>) => {
  const student = await Student.findById(payload.student).lean();

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student is not found');
  }

  const result = await ClinicalRotation.create({
    ...payload,
    id: payload.id ?? generateClinicalId(RotationIdPrefix),
    status: payload.status ?? 'PLANNED',
  });

  await invalidateCache('clinical:*');

  return result;
};

const getAllRotationsFromDB = async (query: Record<string, unknown>) => {
  const rotationQuery = new QueryBuilder(
    ClinicalRotation.find().populate(rotationPopulate),
    query,
  )
    .search(ClinicalRotationSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const total = await rotationQuery.countTotal();
  const result = await rotationQuery.modelQuery;

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    result,
  };
};

const getSingleRotationFromDB = async (id: string) => {
  const result = await ClinicalRotation.findById(id).populate(rotationPopulate);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Clinical rotation is not found');
  }

  return result;
};

const updateRotationIntoDB = async (
  id: string,
  payload: Partial<TClinicalRotation>,
) => {
  const result = await ClinicalRotation.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Clinical rotation is not found');
  }

  await invalidateCache('clinical:*');

  return result;
};

const deleteRotationFromDB = async (id: string) => {
  const result = await ClinicalRotation.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Clinical rotation is not found');
  }

  await invalidateCache('clinical:*');

  return result;
};

/* ----------------------------- procedures ----------------------------- */

const createProcedureIntoDB = async (payload: Partial<TClinicalProcedure>) => {
  const student = await Student.findById(payload.student).lean();

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student is not found');
  }

  if (payload.rotation) {
    const rotation = await ClinicalRotation.findById(payload.rotation).lean();

    if (!rotation) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'Clinical rotation is not found',
      );
    }
  }

  const result = await ClinicalProcedure.create({
    ...payload,
    id: payload.id ?? generateClinicalId(ProcedureIdPrefix),
    competencyLevel: payload.competencyLevel ?? 'OBSERVED',
    supervisorSignOff: payload.supervisorSignOff ?? { status: 'PENDING' },
  });

  await invalidateCache('clinical:*');

  return result;
};

const getAllProceduresFromDB = async (query: Record<string, unknown>) => {
  const procedureQuery = new QueryBuilder(
    ClinicalProcedure.find().populate(procedurePopulate),
    query,
  )
    .search(ClinicalProcedureSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const total = await procedureQuery.countTotal();
  const result = await procedureQuery.modelQuery;

  return {
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    result,
  };
};

const getSingleProcedureFromDB = async (id: string) => {
  const result =
    await ClinicalProcedure.findById(id).populate(procedurePopulate);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Clinical procedure is not found');
  }

  return result;
};

const updateProcedureIntoDB = async (
  id: string,
  payload: Partial<TClinicalProcedure>,
) => {
  const result = await ClinicalProcedure.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Clinical procedure is not found');
  }

  await invalidateCache('clinical:*');

  return result;
};

// the supervisor sign-off is recorded from the authenticated caller, never trusted from the body
const signOffProcedureIntoDB = async (
  id: string,
  payload: { status: TSignOffStatus; supervisor?: string; remarks?: string },
  signedBy: string,
) => {
  const procedure = await ClinicalProcedure.findById(id);

  if (!procedure) {
    throw new AppError(httpStatus.NOT_FOUND, 'Clinical procedure is not found');
  }

  procedure.supervisorSignOff = {
    status: payload.status,
    supervisor: payload.supervisor
      ? (payload.supervisor as unknown as TClinicalProcedure['supervisorSignOff']['supervisor'])
      : procedure.supervisorSignOff?.supervisor,
    signedBy,
    signedAt: new Date(),
    remarks: payload.remarks,
  };

  await procedure.save();
  await invalidateCache('clinical:*');

  return procedure;
};

const deleteProcedureFromDB = async (id: string) => {
  const result = await ClinicalProcedure.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Clinical procedure is not found');
  }

  await invalidateCache('clinical:*');

  return result;
};

/* ----------------------------- aggregates ----------------------------- */

const getStudentLogbookFromDB = async (studentId: string) => {
  const student = await Student.findById(studentId).lean();

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student is not found');
  }

  const [rotations, procedures, byCategory, byCompetency] = await Promise.all([
    ClinicalRotation.find({ student: studentId }).lean(),
    ClinicalProcedure.find({ student: studentId })
      .sort({ performedAt: -1 })
      .populate('rotation', 'id hospital ward')
      .lean(),
    ClinicalProcedure.aggregate([
      { $match: { student: student._id } },
      { $group: { _id: '$category', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    ClinicalProcedure.aggregate([
      { $match: { student: student._id } },
      { $group: { _id: '$competencyLevel', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
  ]);

  const signedOff = procedures.filter(
    (procedure) => procedure.supervisorSignOff?.status === 'SIGNED_OFF',
  ).length;

  return {
    student: {
      _id: student._id,
      id: student.id,
      name: student.name,
      email: student.email,
    },
    summary: {
      totalRotations: rotations.length,
      activeRotations: rotations.filter(
        (rotation) => rotation.status === 'ACTIVE',
      ).length,
      totalProcedures: procedures.length,
      signedOffProcedures: signedOff,
      pendingSignOff: procedures.length - signedOff,
      byCategory,
      byCompetency,
    },
    rotations,
    procedures,
  };
};

const getClinicalSummaryFromDB = async () => {
  const cachedSummary = await getCached<Record<string, unknown>>(
    ClinicalSummaryCacheKey,
  );
  if (cachedSummary) {
    return cachedSummary;
  }

  const [rotationTotals, procedureTotals, byCategory, pendingSignOff] =
    await Promise.all([
      ClinicalRotation.aggregate([
        { $group: { _id: '$status', total: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      ClinicalProcedure.aggregate([
        { $group: { _id: null, total: { $sum: 1 } } },
      ]),
      ClinicalProcedure.aggregate([
        { $group: { _id: '$category', total: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      ClinicalProcedure.countDocuments({
        'supervisorSignOff.status': 'PENDING',
      }),
    ]);

  const summary = {
    rotationsByStatus: rotationTotals,
    totalProcedures: procedureTotals[0]?.total ?? 0,
    proceduresByCategory: byCategory,
    pendingSignOff,
  };

  await setCache(ClinicalSummaryCacheKey, summary, ClinicalSummaryCacheTtl);

  return summary;
};

export const ClinicalServices = {
  createRotationIntoDB,
  getAllRotationsFromDB,
  getSingleRotationFromDB,
  updateRotationIntoDB,
  deleteRotationFromDB,
  createProcedureIntoDB,
  getAllProceduresFromDB,
  getSingleProcedureFromDB,
  updateProcedureIntoDB,
  signOffProcedureIntoDB,
  deleteProcedureFromDB,
  getStudentLogbookFromDB,
  getClinicalSummaryFromDB,
};
