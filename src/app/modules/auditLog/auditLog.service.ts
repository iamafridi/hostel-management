import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { getCached, invalidateCache, setCache } from '../../utils/redis';
import { AuditLogSearchableFields } from './auditLog.constant';
import { TAuditLog } from './auditLog.interface';
import { AuditLog } from './auditLog.model';

const AUDIT_STATS_CACHE_KEY = 'audit:stats';
const AUDIT_STATS_CACHE_TTL = 60;

const createAuditLogIntoDB = async (payload: TAuditLog) => {
  const result = await AuditLog.create(payload);
  await invalidateCache('audit:*');
  return result;
};

const getAllAuditLogsFromDB = async (query: Record<string, unknown>) => {
  const auditLogQuery = new QueryBuilder(AuditLog.find(), query)
    .search(AuditLogSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const total = await auditLogQuery.countTotal();
  const result = await auditLogQuery.modelQuery;

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

const getSingleAuditLogFromDB = async (id: string) => {
  const result = await AuditLog.findById(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Audit log is not found');
  }

  return result;
};

// every entry that belongs to the same request can be replayed through its correlation id
const getAuditTrailByCorrelationIdFromDB = async (correlationId: string) => {
  const result = await AuditLog.find({ correlationId }).sort({ createdAt: 1 });

  if (result.length === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'No audit trail is found for this correlation id',
    );
  }

  return result;
};

const getAuditStatsFromDB = async () => {
  const cachedStats = await getCached<Record<string, unknown>>(
    AUDIT_STATS_CACHE_KEY,
  );
  if (cachedStats) {
    return cachedStats;
  }

  const [byModule, byAction, bySource, failedRequests] = await Promise.all([
    AuditLog.aggregate([
      { $group: { _id: '$module', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]),
    AuditLog.aggregate([
      { $group: { _id: '$action', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    AuditLog.aggregate([
      { $group: { _id: '$source', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    AuditLog.aggregate([
      { $match: { statusCode: { $gte: 400 } } },
      {
        $group: {
          _id: { module: '$module', statusCode: '$statusCode' },
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const stats = { byModule, byAction, bySource, failedRequests };

  await setCache(AUDIT_STATS_CACHE_KEY, stats, AUDIT_STATS_CACHE_TTL);

  return stats;
};

const deleteAuditLogFromDB = async (id: string) => {
  const result = await AuditLog.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Audit log is not found');
  }

  await invalidateCache('audit:*');

  return result;
};

export const AuditLogServices = {
  createAuditLogIntoDB,
  getAllAuditLogsFromDB,
  getSingleAuditLogFromDB,
  getAuditTrailByCorrelationIdFromDB,
  getAuditStatsFromDB,
  deleteAuditLogFromDB,
};
