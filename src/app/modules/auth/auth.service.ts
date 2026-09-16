import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError';
import config from '../../config';
import {
  createAccessToken,
  createRefreshToken,
  TJwtPayload,
  verifyRefreshToken,
} from '../../utils/jwt';
import { User } from '../user/user.model';
import {
  TAuthProfile,
  TChangePasswordPayload,
  TLoginPayload,
  TLoginResult,
} from './auth.interface';

const buildJwtPayload = (user: {
  _id: unknown;
  id: string;
  email?: string;
  role: TAuthProfile['role'];
  isDemo?: boolean;
}): TJwtPayload => ({
  userId: String(user._id),
  id: user.id,
  email: user.email,
  role: user.role,
  isDemo: Boolean(user.isDemo),
});

const toProfile = (user: {
  _id: unknown;
  id: string;
  email?: string;
  role: TAuthProfile['role'];
  isDemo?: boolean;
  needsPasswordChange?: boolean;
}): TAuthProfile => ({
  userId: String(user._id),
  id: user.id,
  email: user.email,
  role: user.role,
  isDemo: Boolean(user.isDemo),
  needsPasswordChange: Boolean(user.needsPasswordChange),
});

// id based accounts and email based accounts both sign in through the same field
const loginUserIntoDB = async (
  payload: TLoginPayload,
): Promise<TLoginResult> => {
  const identifier = payload.identifier.trim();

  const user = await User.findOne({
    isDeleted: { $ne: true },
    $or: [{ email: identifier.toLowerCase() }, { id: identifier }],
  })
    .select('+password')
    .lean();

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email/ID or password');
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This account has been blocked');
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid email/ID or password');
  }

  const jwtPayload = buildJwtPayload(user);

  return {
    user: toProfile(user),
    tokens: {
      accessToken: createAccessToken(jwtPayload),
      refreshToken: createRefreshToken(jwtPayload),
    },
  };
};

// rotates the token pair so a leaked refresh token has a limited lifetime
const refreshTokenIntoDB = async (
  refreshToken: string,
): Promise<TLoginResult> => {
  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findOne({
    _id: decoded.userId,
    isDeleted: { $ne: true },
  }).lean();

  if (!user) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'This account no longer exists',
    );
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This account has been blocked');
  }

  const jwtPayload = buildJwtPayload(user);

  return {
    user: toProfile(user),
    tokens: {
      accessToken: createAccessToken(jwtPayload),
      refreshToken: createRefreshToken(jwtPayload),
    },
  };
};

const getMeFromDB = async (userId: string): Promise<TAuthProfile> => {
  const user = await User.findOne({
    _id: userId,
    isDeleted: { $ne: true },
  }).lean();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is not found');
  }

  return toProfile(user);
};

const changePasswordIntoDB = async (
  userId: string,
  payload: TChangePasswordPayload,
): Promise<{ message: string }> => {
  const user = await User.findOne({ _id: userId, isDeleted: { $ne: true } })
    .select('+password')
    .lean();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is not found');
  }

  const isOldPasswordMatched = await bcrypt.compare(
    payload.oldPassword,
    user.password,
  );

  if (!isOldPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'The old password is incorrect',
    );
  }

  if (payload.oldPassword === payload.newPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'The new password can not be the same as the old password',
    );
  }

  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findByIdAndUpdate(userId, {
    password: newHashedPassword,
    needsPasswordChange: false,
  });

  return { message: 'Password changed successfully' };
};

export const AuthServices = {
  loginUserIntoDB,
  refreshTokenIntoDB,
  getMeFromDB,
  changePasswordIntoDB,
};
