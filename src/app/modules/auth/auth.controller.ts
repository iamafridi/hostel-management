import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { DEMO_ACCOUNT_PASSWORD, DEMO_ACCOUNTS } from './auth.constant';
import { AuthServices } from './auth.service';

const login = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body;
  const result = await AuthServices.refreshTokenIntoDB(token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Token refreshed successfully',
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const result = await AuthServices.getMeFromDB(req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const result = await AuthServices.changePasswordIntoDB(
    req.user.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// intentionally public so reviewers can discover the sandbox identities
const getDemoAccounts = catchAsync(async (_req, res) => {
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Demo accounts retrieved successfully',
    data: {
      password: DEMO_ACCOUNT_PASSWORD,
      note: 'Demo accounts are view-only. Read requests are allowed, mutations are blocked.',
      accounts: DEMO_ACCOUNTS,
    },
  });
});

export const AuthControllers = {
  login,
  refreshToken,
  getMe,
  changePassword,
  getDemoAccounts,
};
