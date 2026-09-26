import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DashboardServices } from './dashboard.service';

const getOverview = catchAsync(async (_req, res) => {
  const result = await DashboardServices.getOverviewFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard overview has been retrieved successfully',
    data: result,
  });
});

const getRecentActivity = catchAsync(async (_req, res) => {
  const result = await DashboardServices.getRecentActivityFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Recent activity has been retrieved successfully',
    data: result,
  });
});

export const DashboardControllers = {
  getOverview,
  getRecentActivity,
};
