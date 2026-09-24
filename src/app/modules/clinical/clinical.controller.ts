import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { ClinicalServices } from './clinical.service';

/* rotations */

const createRotation = catchAsync(async (req, res) => {
  const result = await ClinicalServices.createRotationIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Clinical rotation has been created successfully',
    data: result,
  });
});

const getAllRotations = catchAsync(async (req, res) => {
  const { meta, result } = await ClinicalServices.getAllRotationsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Clinical rotations have been retrieved successfully',
    meta,
    data: result,
  });
});

const getSingleRotation = catchAsync(async (req, res) => {
  const result = await ClinicalServices.getSingleRotationFromDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Clinical rotation has been retrieved successfully',
    data: result,
  });
});

const updateRotation = catchAsync(async (req, res) => {
  const result = await ClinicalServices.updateRotationIntoDB(
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Clinical rotation has been updated successfully',
    data: result,
  });
});

const deleteRotation = catchAsync(async (req, res) => {
  const result = await ClinicalServices.deleteRotationFromDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Clinical rotation has been deleted successfully',
    data: result,
  });
});

/* procedures */

const createProcedure = catchAsync(async (req, res) => {
  const result = await ClinicalServices.createProcedureIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Clinical procedure has been logged successfully',
    data: result,
  });
});

const getAllProcedures = catchAsync(async (req, res) => {
  const { meta, result } = await ClinicalServices.getAllProceduresFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Clinical procedures have been retrieved successfully',
    meta,
    data: result,
  });
});

const getSingleProcedure = catchAsync(async (req, res) => {
  const result = await ClinicalServices.getSingleProcedureFromDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Clinical procedure has been retrieved successfully',
    data: result,
  });
});

const updateProcedure = catchAsync(async (req, res) => {
  const result = await ClinicalServices.updateProcedureIntoDB(
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Clinical procedure has been updated successfully',
    data: result,
  });
});

const signOffProcedure = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const result = await ClinicalServices.signOffProcedureIntoDB(
    req.params.id,
    req.body,
    req.user.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Clinical procedure sign-off has been recorded successfully',
    data: result,
  });
});

const deleteProcedure = catchAsync(async (req, res) => {
  const result = await ClinicalServices.deleteProcedureFromDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Clinical procedure has been deleted successfully',
    data: result,
  });
});

/* aggregates */

const getStudentLogbook = catchAsync(async (req, res) => {
  const result = await ClinicalServices.getStudentLogbookFromDB(
    req.params.studentId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student clinical logbook has been retrieved successfully',
    data: result,
  });
});

const getClinicalSummary = catchAsync(async (_req, res) => {
  const result = await ClinicalServices.getClinicalSummaryFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Clinical summary has been retrieved successfully',
    data: result,
  });
});

export const ClinicalControllers = {
  createRotation,
  getAllRotations,
  getSingleRotation,
  updateRotation,
  deleteRotation,
  createProcedure,
  getAllProcedures,
  getSingleProcedure,
  updateProcedure,
  signOffProcedure,
  deleteProcedure,
  getStudentLogbook,
  getClinicalSummary,
};
