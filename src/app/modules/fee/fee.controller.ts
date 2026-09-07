import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FeeServices } from './fee.service';

const createFee = catchAsync(async (req, res) => {
  const result = await FeeServices.createFeeIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Fee has been created successfully',
    data: result,
  });
});

const generateBulkFees = catchAsync(async (req, res) => {
  const result = await FeeServices.generateBulkFeesIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Fees have been generated successfully',
    data: result,
  });
});

const getAllFees = catchAsync(async (req, res) => {
  const { meta, result } = await FeeServices.getAllFeesFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fees have been retrieved successfully',
    meta,
    data: result,
  });
});

const getSingleFee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await FeeServices.getSingleFeeFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fee has been retrieved successfully',
    data: result,
  });
});

const getFeeSummary = catchAsync(async (req, res) => {
  const result = await FeeServices.getFeeSummaryFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fee summary has been retrieved successfully',
    data: result,
  });
});

const updateFee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await FeeServices.updateFeeIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fee has been updated successfully',
    data: result,
  });
});

const deleteFee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await FeeServices.deleteFeeFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Fee has been deleted successfully',
    data: result,
  });
});

export const FeeControllers = {
  createFee,
  generateBulkFees,
  getAllFees,
  getSingleFee,
  getFeeSummary,
  updateFee,
  deleteFee,
};
