import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuditLogServices } from './auditLog.service';

const createAuditLog = catchAsync(async (req, res) => {
  const result = await AuditLogServices.createAuditLogIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Audit log has been created successfully',
    data: result,
  });
});

const getAllAuditLogs = catchAsync(async (req, res) => {
  const { meta, result } = await AuditLogServices.getAllAuditLogsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audit logs have been retrieved successfully',
    meta,
    data: result,
  });
});

const getSingleAuditLog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AuditLogServices.getSingleAuditLogFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audit log has been retrieved successfully',
    data: result,
  });
});

const getAuditTrailByCorrelationId = catchAsync(async (req, res) => {
  const { correlationId } = req.params;
  const result =
    await AuditLogServices.getAuditTrailByCorrelationIdFromDB(correlationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audit trail has been retrieved successfully',
    data: result,
  });
});

const getAuditStats = catchAsync(async (req, res) => {
  const result = await AuditLogServices.getAuditStatsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audit statistics have been retrieved successfully',
    data: result,
  });
});

const deleteAuditLog = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AuditLogServices.deleteAuditLogFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audit log has been deleted successfully',
    data: result,
  });
});

export const AuditLogControllers = {
  createAuditLog,
  getAllAuditLogs,
  getSingleAuditLog,
  getAuditTrailByCorrelationId,
  getAuditStats,
  deleteAuditLog,
};
